import type { AppState } from "../state/root-reducer";

// storm 2026 is only meant to run locally on site
const HOST = process.env.PARTYKIT_HOST || "127.0.0.1";
const PORT = process.env.PARTYKIT_PORT || "1999";
export const PARTYKIT_HOST = `${HOST}:${PORT}`;
const ENDPOINT_PROTOCOL = "http";

export function partykitEndpoint(roomName: string) {
  return `${ENDPOINT_PROTOCOL}://${PARTYKIT_HOST}/parties/main/${roomName}`;
}

export async function getPartykitState(roomName: string): Promise<AppState> {
  const req = await fetch(partykitEndpoint(roomName));
  return await req.json();
}
