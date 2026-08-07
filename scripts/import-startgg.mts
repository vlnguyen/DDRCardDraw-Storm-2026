#!/usr/bin/env node
import "dotenv/config";
import { writeFile } from "node:fs/promises";

const STARTGG_API_URL = "https://api.start.gg/gql/alpha";

const ENTRANTS_QUERY = `
  query EventEntrants($slug: String!, $page: Int!, $perPage: Int!) {
    event(slug: $slug) {
      id
      name
      entrants(query: { page: $page, perPage: $perPage }) {
        pageInfo {
          totalPages
        }
        nodes {
          id
          participants {
            gamerTag
            prefix
            user {
              id
              discriminator
            }
          }
        }
      }
    }
  }
`;

interface Participant {
  gamerTag: string;
  prefix: string;
  id: string | null;
  discriminator: string | null;
}

interface RawParticipant {
  gamerTag: string;
  prefix: string | null;
  user: { id: string; discriminator: string } | null;
}

interface EventEntrantsResponse {
  data?: {
    event: {
      id: string;
      name: string;
      entrants: {
        pageInfo: { totalPages: number };
        nodes: { id: string; participants: RawParticipant[] }[];
      };
    } | null;
  };
  errors?: { message: string }[];
}

function slugFromUrl(url: string): string {
  const normalized = /^https?:\/\//.test(url) ? url : `https://${url}`;
  const { pathname } = new URL(normalized);
  return pathname.replace(/^\/+|\/+$/g, "");
}

/** Merges participant lists (e.g. from multiple brackets of the same event),
 * deduping by start.gg user id where one is present. Participants with no
 * linked user account (`id === null`) can't be reliably deduped, so every
 * such entry is kept as-is. */
function mergeParticipants(lists: Participant[][]): Participant[] {
  const seenUserIds = new Set<string>();
  const merged: Participant[] = [];
  for (const list of lists) {
    for (const participant of list) {
      if (participant.id != null) {
        if (seenUserIds.has(participant.id)) continue;
        seenUserIds.add(participant.id);
      }
      merged.push(participant);
    }
  }
  return merged;
}

function csvField(value: string | null): string {
  const str = value ?? "";
  return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
}

function toCsv(participants: Participant[]): string {
  const header = ["id", "prefix", "gamerTag", "discriminator"];
  const rows = participants.map((p) =>
    [p.id, p.prefix, p.gamerTag, p.discriminator].map(csvField).join(","),
  );
  return [header.join(","), ...rows].join("\n");
}

async function fetchEntrantsPage(
  token: string,
  slug: string,
  page: number,
  perPage = 100,
): Promise<EventEntrantsResponse> {
  const res = await fetch(STARTGG_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      query: ENTRANTS_QUERY,
      variables: { slug, page, perPage },
    }),
  });

  if (!res.ok) {
    throw new Error(`start.gg API request failed: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

async function fetchAllParticipants(token: string, slug: string): Promise<Participant[]> {
  const participants: Participant[] = [];
  let page = 1;
  let totalPages = 1;

  do {
    const response = await fetchEntrantsPage(token, slug, page);

    if (response.errors?.length) {
      throw new Error(response.errors.map((e) => e.message).join(", "));
    }

    const event = response.data?.event;
    if (!event) {
      throw new Error(`No event found for slug "${slug}"`);
    }

    for (const entrant of event.entrants.nodes) {
      const participant = entrant.participants[0];
      participants.push({
        id: participant.user?.id ?? null,
        discriminator: participant.user?.discriminator ?? null,
        gamerTag: participant.gamerTag,
        prefix: participant.prefix ?? "",
      });
    }
    totalPages = event.entrants.pageInfo.totalPages;
    page++;
  } while (page <= totalPages);

  return participants;
}

function getArg(name: string): string | undefined {
  const prefix = `--${name}=`;
  const args = process.argv.slice(2);

  const inlineArg = args.find((arg) => arg.startsWith(prefix));
  if (inlineArg) {
    return inlineArg.slice(prefix.length);
  }

  const flagIndex = args.indexOf(`--${name}`);
  if (flagIndex !== -1) {
    return args[flagIndex + 1];
  }

  return undefined;
}

const eventUrl = getArg("url") ?? "https://www.start.gg/tournament/ceo-2026/event/itgmania/";
const eventUrlWomen =
  "www.start.gg/tournament/ceo-2026-community-tournaments/event/itgmania-women-non-binary/";

const outputName = getArg("name") ?? "entrants";

const token = process.env.STARTGG_TOKEN;
if (!token) {
  console.error("Missing STARTGG_TOKEN environment variable. See .env.template.");
  process.exit(1);
}

const slug = slugFromUrl(eventUrl);
const slugWomen = slugFromUrl(eventUrlWomen);

const [participantsMain, participantsWomen] = await Promise.all([
  fetchAllParticipants(token, slug),
  fetchAllParticipants(token, slugWomen),
]);

for (const [label, list] of [
  [slug, participantsMain],
  [slugWomen, participantsWomen],
] as const) {
  console.log(`Found ${list.length} participants for ${label}:`);
  for (const participant of list) {
    console.log(`${participant.id}\t${participant.prefix}\t${participant.gamerTag}`);
  }
}

const participants = mergeParticipants([participantsMain, participantsWomen]);
console.log(
  `Merged into ${participants.length} unique participants (from ${participantsMain.length + participantsWomen.length} total entries).`,
);

const outputPath = `src/assets/entrants/${outputName}`;

const jsonPath = `${outputPath}.json`;
await writeFile(jsonPath, JSON.stringify(participants, null, 2));
console.log(`Wrote ${jsonPath}`);

const csvPath = `${outputPath}.csv`;
await writeFile(csvPath, toCsv(participants));
console.log(`Wrote ${csvPath}`);
