import { Redis } from "@upstash/redis";

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_TOKEN!,
});

export const KEYS = {
  profile: "profile",
  characters: "characters",
  chat: (characterId: string) => `chat:${characterId}`,
};
