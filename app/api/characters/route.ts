import { NextRequest, NextResponse } from "next/server";
import { redis, KEYS } from "@/lib/redis";
import type { Character } from "@/lib/types";

export const runtime = "edge";

async function loadCharacters(): Promise<Character[]> {
  const list = await redis.get<Character[]>(KEYS.characters);
  return Array.isArray(list) ? list : [];
}

export async function GET() {
  const characters = await loadCharacters();
  return NextResponse.json({ characters });
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as Partial<Character>;
  const name = (body.name ?? "").trim();
  const description = (body.description ?? "").trim();
  const scenario = (body.scenario ?? "").trim();

  if (!name) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }

  const character: Character = {
    id: crypto.randomUUID(),
    name,
    description,
    scenario,
    createdAt: Date.now(),
  };

  const characters = await loadCharacters();
  characters.push(character);
  await redis.set(KEYS.characters, characters);

  return NextResponse.json({ character });
}
