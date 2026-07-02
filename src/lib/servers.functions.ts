import { createServerFn } from "@tanstack/react-start";

export type ServerRoom = "Casual" | "Standard" | "Custom Gametypes" | "Unknown";

export interface SRB2Server {
  name: string;
  ip: string;
  port: string;
  address: string;
  version: string;
  room: ServerRoom;
}

export interface ServerListResult {
  servers: SRB2Server[];
  fetchedAt: string;
}

const ROOM_MAP: Record<string, ServerRoom> = {
  "28": "Casual",
  "33": "Standard",
  "38": "Custom Gametypes",
};

function parseServers(text: string): SRB2Server[] {
  const blocks = text.split(/\n\s*\n/);
  const servers: SRB2Server[] = [];
  for (const block of blocks) {
    const lines = block.split("\n").map((l) => l.trim()).filter(Boolean);
    if (lines.length === 0) continue;
    const roomId = lines[0];
    const room: ServerRoom = ROOM_MAP[roomId] ?? "Unknown";
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      // Split from the right: version is last token, then name is everything encoded (single token, url-encoded)
      const parts = line.split(" ");
      if (parts.length < 4) continue;
      const version = parts[parts.length - 1];
      const nameEnc = parts[parts.length - 2];
      const port = parts[parts.length - 3];
      const ip = parts.slice(0, parts.length - 3).join(" ");
      let name = nameEnc;
      try {
        name = decodeURIComponent(nameEnc);
      } catch {
        // keep raw
      }
      servers.push({
        name,
        ip,
        port,
        address: `${ip}:${port}`,
        version,
        room,
      });
    }
  }
  return servers;
}

export const getServers = createServerFn({ method: "GET" }).handler(
  async (): Promise<ServerListResult> => {
    const res = await fetch("https://mb.srb2.org/MS/0/servers", {
      headers: { "User-Agent": "SRB2ServerBrowser/1.0" },
    });
    if (!res.ok) {
      throw new Error(`Master server responded with ${res.status}`);
    }
    const text = await res.text();
    return {
      servers: parseServers(text),
      fetchedAt: new Date().toISOString(),
    };
  },
);
