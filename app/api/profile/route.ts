import { NextRequest, NextResponse } from "next/server";
import { redis, KEYS } from "@/lib/redis";
import type { Profile } from "@/lib/types";

export const runtime = "edge";

export async function GET() {
  const profile = await redis.get<Profile>(KEYS.profile);
  return NextResponse.json({ profile: profile ?? null });
}

export async function PUT(req: NextRequest) {
  const body = (await req.json()) as Partial<Profile>;
  const username = (body.username ?? "").trim();
  const description = (body.description ?? "").trim();

  if (!username) {
    return NextResponse.json({ error: "username is required" }, { status: 400 });
  }

  const profile: Profile = { username, description };
  await redis.set(KEYS.profile, profile);
  return NextResponse.json({ profile });
}
