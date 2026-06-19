"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Character, Profile } from "@/lib/types";

export default function HomePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [characters, setCharacters] = useState<Character[]>([]);

  useEffect(() => {
    (async () => {
      const pRes = await fetch("/api/profile");
      const pData = await pRes.json();
      if (!pData.profile) {
        router.replace("/onboarding");
        return;
      }
      setProfile(pData.profile);

      const cRes = await fetch("/api/characters");
      const cData = await cRes.json();
      setCharacters(cData.characters ?? []);
      setLoading(false);
    })();
  }, [router]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center text-muted">
        Loading…
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-4 pb-24 pt-8">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Your characters</h1>
          <p className="text-sm text-muted">
            Signed in as {profile?.username}
          </p>
        </div>
        <Link
          href="/characters/new"
          className="rounded-full bg-accent px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
        >
          + New
        </Link>
      </header>

      {characters.length === 0 ? (
        <div className="rounded-2xl border border-border bg-panel p-8 text-center">
          <p className="text-muted">No characters yet.</p>
          <Link
            href="/characters/new"
            className="mt-4 inline-block rounded-full bg-accent px-5 py-2 text-sm font-medium text-white"
          >
            Create your first character
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {characters.map((c) => (
            <li
              key={c.id}
              className="flex items-center gap-4 rounded-2xl border border-border bg-panel p-4"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-panel2 text-lg font-semibold uppercase text-accent">
                {c.name.charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{c.name}</p>
                <p className="truncate text-sm text-muted">
                  {c.description || c.scenario || "No description"}
                </p>
              </div>
              <Link
                href={`/chat/${c.id}`}
                className="shrink-0 rounded-full border border-border bg-panel2 px-4 py-2 text-sm font-medium transition hover:border-accent"
              >
                Chat
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
