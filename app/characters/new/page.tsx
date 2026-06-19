"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NewCharacterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [scenario, setScenario] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    const res = await fetch("/api/characters", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description, scenario }),
    });
    const data = await res.json();
    if (data.character) {
      router.replace(`/chat/${data.character.id}`);
    } else {
      setSaving(false);
    }
  }

  return (
    <main className="mx-auto max-w-md px-5 py-10">
      <div className="mb-6 flex items-center gap-3">
        <Link href="/" className="text-muted hover:text-white">
          ←
        </Link>
        <h1 className="text-xl font-semibold">New character</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="mb-1 block text-sm text-muted">Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Luna"
            className="w-full rounded-xl border border-border bg-panel px-4 py-3 outline-none focus:border-accent"
            autoFocus
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-muted">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Personality, appearance, traits…"
            rows={3}
            className="w-full resize-none rounded-xl border border-border bg-panel px-4 py-3 outline-none focus:border-accent"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-muted">
            Scenario / situation
          </label>
          <textarea
            value={scenario}
            onChange={(e) => setScenario(e.target.value)}
            placeholder="The setting and situation. Used as the system prompt."
            rows={4}
            className="w-full resize-none rounded-xl border border-border bg-panel px-4 py-3 outline-none focus:border-accent"
          />
        </div>
        <button
          type="submit"
          disabled={saving || !name.trim()}
          className="w-full rounded-xl bg-accent py-3 font-medium text-white transition hover:opacity-90 disabled:opacity-50"
        >
          {saving ? "Creating…" : "Create & chat"}
        </button>
      </form>
    </main>
  );
}
