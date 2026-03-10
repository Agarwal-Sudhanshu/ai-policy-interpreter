"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState, useRef, useEffect, useCallback } from "react";
import { useAuth } from "@/components/AuthProvider";
import { getGuestSessionId } from "@/lib/guestSession";
import { PageContainer, PageHeader, Card, Button, Textarea } from "@/components/ui";

const GUEST_LIMIT_QUESTIONS = 3;

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  source?: "rules" | "policy_text";
};

type GuestUsage = { questions_remaining: number };

export default function PolicyAskPage() {
  const params = useParams();
  const policyId = typeof params?.policy_id === "string" ? params.policy_id : "";
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [guestUsage, setGuestUsage] = useState<GuestUsage | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  const fetchGuestUsage = useCallback(() => {
    if (user?.id) return;
    const guestId = getGuestSessionId();
    if (!guestId) return;
    fetch(`/api/guest-usage?guest_session_id=${encodeURIComponent(guestId)}`)
      .then((res) => res.ok ? res.json() : null)
      .then((data: GuestUsage | null) => data && setGuestUsage(data))
      .catch(() => {});
  }, [user?.id]);

  useEffect(() => {
    fetchGuestUsage();
  }, [fetchGuestUsage]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = input.trim();
    if (!q || !policyId) return;
    if (guestLimitReached) return;
    setError(null);
    setInput("");
    setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: "user", content: q }]);
    setLoading(true);
    try {
      const body: { question: string; guest_session_id?: string } = { question: q };
      if (!user?.id) body.guest_session_id = getGuestSessionId();

      const res = await fetch(`/api/policies/${encodeURIComponent(policyId)}/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 403 && data.limit_reached) {
        setGuestUsage((prev) => (prev ? { ...prev, questions_remaining: 0 } : { questions_remaining: 0 }));
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: "assistant",
            content: "Create free account to continue. You've used your 3 free questions. Sign up for unlimited questions.",
          },
        ]);
        setLoading(false);
        return;
      }
      if (!res.ok) {
        throw new Error(data.error ?? "Failed to get answer");
      }
      fetchGuestUsage();
      const answer = typeof data.answer === "string" ? data.answer : "No answer returned.";
      const source = data.source ?? "policy_text";
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: "assistant", content: answer, source },
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: "Sorry, I couldn’t get an answer. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  const isGuest = !user?.id;
  const questionsRemaining = guestUsage?.questions_remaining ?? null;
  const questionsAsked = questionsRemaining !== null ? GUEST_LIMIT_QUESTIONS - questionsRemaining : null;
  const guestLimitReached = isGuest && questionsRemaining !== null && questionsRemaining <= 0;

  return (
    <PageContainer spacing={6}>
      <PageHeader
        title="Ask Policy AI"
        back={
          policyId
            ? { href: `/app/policies/${policyId}`, label: "← Back to Policy" }
            : { href: "/app/policies", label: "← Back to Policies" }
        }
      />

      {isGuest && questionsAsked !== null && (
        <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700">
          Questions asked: {questionsAsked} · Remaining: {questionsRemaining}
          {guestLimitReached && (
            <p className="mt-2 text-amber-700">
              <Link href="/signup" className="font-medium underline hover:no-underline">
                Sign up or log in
              </Link>
              {" "}to ask more questions.
            </p>
          )}
        </div>
      )}

      <div className="mx-auto max-w-[700px]">
        <Card padding={false} className="flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 space-y-4 min-h-[320px]">
            {messages.length === 0 && (
              <p className="text-center text-sm text-gray-500 pt-8">
                Ask a question about this policy. For example: &quot;What is the maximum LTV?&quot; or &quot;Minimum income required?&quot;
              </p>
            )}
            {messages.map((m) =>
              m.role === "user" ? (
                <div key={m.id} className="flex justify-end">
                  <div className="max-w-[85%] rounded-xl bg-[#2563EB] px-4 py-2.5 text-sm text-white">
                    {m.content}
                  </div>
                </div>
              ) : (
                <div key={m.id} className="flex justify-start">
                  <div className="max-w-[85%] rounded-xl bg-gray-100 px-4 py-2.5 text-sm text-gray-900">
                    <p>{m.content}</p>
                    {m.source && (
                      <p className="mt-2 text-xs text-gray-500">
                        Source: {m.source === "rules" ? "Policy rules" : "Policy text"}
                      </p>
                    )}
                  </div>
                </div>
              )
            )}
            {loading && (
              <div className="flex justify-start">
                <div className="rounded-xl bg-gray-100 px-4 py-2.5 text-sm text-gray-500">
                  Thinking…
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <form onSubmit={handleSubmit} className="border-t border-gray-200 p-4">
            {guestLimitReached && (
              <p className="mb-2 text-sm text-amber-700" role="alert">
                You&apos;ve used your 3 free questions.{" "}
                <Link href="/signup" className="font-medium underline hover:no-underline">Sign up</Link>
                {" "}or{" "}
                <Link href="/login" className="font-medium underline hover:no-underline">log in</Link>
                {" "}to continue.
              </p>
            )}
            {error && (
              <p className="mb-2 text-sm text-red-600" role="alert">
                {error}
              </p>
            )}
            <div className="flex gap-3">
              <Textarea
                placeholder="Ask a question about this policy"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={loading || guestLimitReached}
                className="min-h-[44px] resize-none flex-1"
                rows={1}
              />
              <Button type="submit" disabled={loading || guestLimitReached || !input.trim()}>
                Send
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </PageContainer>
  );
}
