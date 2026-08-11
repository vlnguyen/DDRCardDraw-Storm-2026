import type { AppState } from "../state/root-reducer";

// storm 2026 is only meant to run locally on site
export const PARTYKIT_HOST = "127.0.0.1:1999";
const ENDPOINT_PROTOCOL = "http";

export function partykitEndpoint(roomName: string) {
  return `${ENDPOINT_PROTOCOL}://${PARTYKIT_HOST}/parties/main/${roomName}`;
}

export async function getPartykitState(roomName: string): Promise<AppState> {
  const req = await fetch(partykitEndpoint(roomName));
  return await req.json();
}
