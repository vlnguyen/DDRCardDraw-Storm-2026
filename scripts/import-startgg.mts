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
            id
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
  entrantId: string;
  gamerTag: string;
  prefix: string;
  id: string | null;
  discriminator: string | null;
}

interface RawParticipant {
  id: string;
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
  const { pathname } = new URL(url);
  return pathname.replace(/^\/+|\/+$/g, "");
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
        entrantId: participant.id,
      });
    }
    totalPages = event.entrants.pageInfo.totalPages;
    page++;
  } while (page <= totalPages);

  return participants;
}

const eventUrl = process.argv[2];
if (!eventUrl) {
  console.error("Usage: yarn import:startgg <start.gg event URL> [output name]");
  process.exit(1);
}

const outputName = process.argv[3] ?? "entrants";

const token = process.env.STARTGG_TOKEN;
if (!token) {
  console.error("Missing STARTGG_TOKEN environment variable. See .env.template.");
  process.exit(1);
}

const slug = slugFromUrl(eventUrl);
const participants = await fetchAllParticipants(token, slug);

console.log(`Found ${participants.length} participants for ${slug}:`);
for (const participant of participants) {
  console.log(`${participant.id}\t${participant.prefix}\t${participant.gamerTag}`);
}

const outputPath = `src/assets/${outputName}.json`;
await writeFile(outputPath, JSON.stringify(participants, null, 2));
console.log(`Wrote ${outputPath}`);
