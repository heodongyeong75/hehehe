"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ActionText } from "@/components/ActionText";
import type { Character, ChatMessage } from "@/lib/types";

function uid() {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);
}

export default function ChatPage() {
  const { characterId } = useParams<{ characterId: string }>();

  const [character, setCharacter] = useState<Character | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [confirmClear, setConfirmClear] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);

  // Initial load: character + history.
  useEffect(() => {
    (async () => {
      const [cRes, hRes] = await Promise.all([
        fetch("/api/characters"),
        fetch(`/api/chat?characterId=${characterId}`),
      ]);
      const cData = await cRes.json();
      const hData = await hRes.json();
      const found = (cData.characters as Character[] | undefined)?.find(
        (c) => c.id === characterId
      );
      setCharacter(found ?? null);
      setMessages(Array.isArray(hData.messages) ? hData.messages : []);
      setLoading(false);
    })();
  }, [characterId]);

  // Auto-scroll to latest message.
  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, sending]);

  const persist = useCallback(
    async (msgs: ChatMessage[]) => {
      await fetch("/api/chat", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ characterId, messages: msgs }),
      });
    },
    [characterId]
  );

  // Send a fresh user message and get a reply.
  async function send() {
    const text = input.trim();
    if (!text || sending) return;
    const userMsg: ChatMessage = { id: uid(), role: "user", content: text };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    await getReply(next);
  }

  // Call the model with a given message list and append the reply.
  async function getReply(history: ChatMessage[]) {
    setSending(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ characterId, messages: history }),
      });
      const data = await res.json();
      if (data.message) {
        setMessages([...history, data.message as ChatMessage]);
      }
    } finally {
      setSending(false);
    }
  }

  // Resend: drop trailing assistant reply (if any) and regenerate.
  async function resend() {
    if (sending) return;
    let base = [...messages];
    while (base.length && base[base.length - 1].role === "assistant") {
      base.pop();
    }
    if (base.length === 0) return;
    setMessages(base);
    await getReply(base);
  }

  function startEdit(m: ChatMessage) {
    setEditingId(m.id);
    setEditValue(m.content);
  }

  async function saveEdit() {
    if (editingId == null) return;
    const next = messages.map((m) =>
      m.id === editingId ? { ...m, content: editValue } : m
    );
    setMessages(next);
    setEditingId(null);
    setEditValue("");
    await persist(next);
  }

  async function deleteMessage(id: string) {
    const next = messages.filter((m) => m.id !== id);
    setMessages(next);
    await persist(next);
  }

  async function clearChat() {
    setMessages([]);
    setConfirmClear(false);
    await persist([]);
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center text-muted">
        Loading…
      </main>
    );
  }

  return (
    <main className="mx-auto flex h-screen max-w-2xl flex-col">
      {/* Header */}
      <header className="flex items-center gap-3 border-b border-border bg-panel px-4 py-3">
        <Link href="/" className="text-muted hover:text-white">
          ←
        </Link>
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-panel2 font-semibold uppercase text-accent">
          {character?.name?.charAt(0) ?? "?"}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium">
            {character?.name ?? "Unknown"}
          </p>
          <p className="truncate text-xs text-muted">
            {character?.scenario || character?.description || ""}
          </p>
        </div>
        <button
          onClick={() => setConfirmClear(true)}
          className="rounded-full border border-border px-3 py-1.5 text-xs text-muted transition hover:border-red-500 hover:text-red-400"
        >
          Clear
        </button>
      </header>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-4 py-5">
        {messages.length === 0 && (
          <p className="mt-10 text-center text-sm text-muted">
            Say hello to {character?.name ?? "your character"} 👋
          </p>
        )}

        {messages.map((m) => {
          const isUser = m.role === "user";
          const isEditing = editingId === m.id;
          return (
            <div
              key={m.id}
              className={`group flex flex-col ${
                isUser ? "items-end" : "items-start"
              }`}
            >
              <div
                className={`max-w-[85%] whitespace-pre-wrap break-words rounded-2xl px-4 py-2.5 text-[15px] leading-relaxed ${
                  isUser
                    ? "bg-accent text-white"
                    : "border border-border bg-panel text-[#ececf1]"
                }`}
              >
                {isEditing ? (
                  <textarea
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    rows={3}
                    className="w-[70vw] max-w-md resize-none rounded-lg bg-black/30 px-2 py-1 text-white outline-none"
                    autoFocus
                  />
                ) : (
                  <ActionText text={m.content} />
                )}
              </div>

              {/* per-message controls */}
              <div className="mt-1 flex gap-2 text-xs text-muted opacity-0 transition group-hover:opacity-100">
                {isEditing ? (
                  <>
                    <button
                      onClick={saveEdit}
                      className="hover:text-accent"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="hover:text-white"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => startEdit(m)}
                      className="hover:text-white"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteMessage(m.id)}
                      className="hover:text-red-400"
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}

        {sending && (
          <div className="flex items-start">
            <div className="rounded-2xl border border-border bg-panel px-4 py-2.5 text-muted">
              <span className="inline-block animate-pulse">typing…</span>
            </div>
          </div>
        )}
      </div>

      {/* Composer */}
      <div className="border-t border-border bg-panel px-3 py-3">
        <div className="mb-2 flex justify-end">
          <button
            onClick={resend}
            disabled={sending || messages.length === 0}
            className="rounded-full border border-border px-3 py-1 text-xs text-muted transition hover:border-accent hover:text-white disabled:opacity-40"
          >
            ↻ Resend
          </button>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
          className="flex items-end gap-2"
        >
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            placeholder="Type a message…  (use *asterisks* for actions)"
            rows={1}
            className="max-h-32 flex-1 resize-none rounded-2xl border border-border bg-panel2 px-4 py-3 text-[15px] outline-none focus:border-accent"
          />
          <button
            type="submit"
            disabled={sending || !input.trim()}
            className="shrink-0 rounded-full bg-accent px-5 py-3 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
          >
            Send
          </button>
        </form>
      </div>

      {/* Clear confirmation */}
      {confirmClear && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-6">
          <div className="w-full max-w-xs rounded-2xl border border-border bg-panel p-5">
            <p className="font-medium">Clear this chat?</p>
            <p className="mt-1 text-sm text-muted">
              All messages with {character?.name} will be deleted.
            </p>
            <div className="mt-5 flex gap-2">
              <button
                onClick={() => setConfirmClear(false)}
                className="flex-1 rounded-xl border border-border py-2 text-sm transition hover:bg-panel2"
              >
                Cancel
              </button>
              <button
                onClick={clearChat}
                className="flex-1 rounded-xl bg-red-500 py-2 text-sm font-medium text-white transition hover:bg-red-600"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
