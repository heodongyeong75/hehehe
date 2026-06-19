import { NextRequest, NextResponse } from "next/server";
import { redis, KEYS } from "@/lib/redis";
import { groq, MODEL } from "@/lib/groq";
import type { Character, ChatMessage, Profile } from "@/lib/types";

export const runtime = "edge";

async function loadCharacter(characterId: string): Promise<Character | null> {
  const list = await redis.get<Character[]>(KEYS.characters);
  if (!Array.isArray(list)) return null;
  return list.find((c) => c.id === characterId) ?? null;
}

function buildSystemPrompt(character: Character, profile: Profile | null): string {
  const parts: string[] = [];
  parts.push(`You are roleplaying as "${character.name}".`);
  if (character.description) {
    parts.push(`Character description: ${character.description}`);
  }
  if (character.scenario) {
    parts.push(`Scenario / situation: ${character.scenario}`);
  }
  if (profile && profile.username) {
    parts.push(
      `You are talking to a person named "${profile.username}".` +
        (profile.description ? ` About them: ${profile.description}` : "")
    );
  }
  parts.push(
    "Stay fully in character at all times. Write actions and physical descriptions wrapped in *asterisks* (e.g. *smiles softly*). Keep replies natural and conversational."
  );
  return parts.join("\n");
}

// Load chat history.
export async function GET(req: NextRequest) {
  const characterId = req.nextUrl.searchParams.get("characterId");
  if (!characterId) {
    return NextResponse.json({ error: "characterId required" }, { status: 400 });
  }
  const messages = (await redis.get<ChatMessage[]>(KEYS.chat(characterId))) ?? [];
  return NextResponse.json({ messages });
}

// Overwrite chat history (used for edits / clear).
export async function PUT(req: NextRequest) {
  const { characterId, messages } = (await req.json()) as {
    characterId?: string;
    messages?: ChatMessage[];
  };
  if (!characterId) {
    return NextResponse.json({ error: "characterId required" }, { status: 400 });
  }
  await redis.set(KEYS.chat(characterId), messages ?? []);
  return NextResponse.json({ ok: true });
}

// Send conversation, get a reply, persist, and return it.
export async function POST(req: NextRequest) {
  const { characterId, messages } = (await req.json()) as {
    characterId?: string;
    messages?: ChatMessage[];
  };

  if (!characterId || !Array.isArray(messages)) {
    return NextResponse.json(
      { error: "characterId and messages required" },
      { status: 400 }
    );
  }

  const character = await loadCharacter(characterId);
  if (!character) {
    return NextResponse.json({ error: "character not found" }, { status: 404 });
  }

  const profile = await redis.get<Profile>(KEYS.profile);
  const system = buildSystemPrompt(character, profile);

  const completion = await groq.chat.completions.create({
    model: MODEL,
    messages: [
      { role: "system", content: system },
      ...messages.map((m) => ({ role: m.role, content: m.content })),
    ],
    temperature: 0.9,
    max_tokens: 1024,
  });

  const reply = completion.choices[0]?.message?.content ?? "...";
  const assistantMessage: ChatMessage = {
    id: crypto.randomUUID(),
    role: "assistant",
    content: reply,
  };

  const updated = [...messages, assistantMessage];
  await redis.set(KEYS.chat(characterId), updated);

  return NextResponse.json({ message: assistantMessage });
}
