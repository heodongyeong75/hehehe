"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function OnboardingPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/profile");
      const data = await res.json();
      if (data.profile) {
        router.replace("/");
        return;
      }
      setChecking(false);
    })();
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!username.trim()) return;
    setSaving(true);
    await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, description }),
    });
    router.replace("/characters/new");
  }

  if (checking) {
    return (
      <main className="flex min-h-screen items-center justify-center text-muted">
        Loading…
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-5 py-10">
      <h1 className="text-2xl font-semibold">Welcome 👋</h1>
      <p className="mt-1 text-sm text-muted">
        Set up your profile so characters know who they&apos;re talking to.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <div>
          <label className="mb-1 block text-sm text-muted">Your name</label>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="e.g. Alex"
            className="w-full rounded-xl border border-border bg-panel px-4 py-3 outline-none focus:border-accent"
            autoFocus
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-muted">
            About you (optional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="A short description characters should know about you."
            rows={4}
            className="w-full resize-none rounded-xl border border-border bg-panel px-4 py-3 outline-none focus:border-accent"
          />
        </div>
        <button
          type="submit"
          disabled={saving || !username.trim()}
          className="w-full rounded-xl bg-accent py-3 font-medium text-white transition hover:opacity-90 disabled:opacity-50"
        >
          {saving ? "Saving…" : "Continue"}
        </button>
      </form>
    </main>
  );
}
