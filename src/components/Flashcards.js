"use client";

import { useEffect, useState } from "react";
import { IconChevronLeft, IconChevronRight } from "@/components/icons";

export default function Flashcards({ pool }) {
  const [i, setI] = useState(0);
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setI(0);
    setFlipped(false);
  }, [pool.length]);

  if (pool.length === 0) {
    return (
      <div className="rounded-xl p-6 text-center text-sm" style={{ background: "var(--card)", border: "1px solid var(--border)", color: "var(--ink-soft)" }}>
        No terms to show yet.
      </div>
    );
  }

  const term = pool[i];
  const go = (delta) => {
    setFlipped(false);
    setI((prev) => (prev + delta + pool.length) % pool.length);
  };

  return (
    <div>
      <div className="text-center text-xs font-semibold mb-2" style={{ color: "var(--ink-soft)" }}>
        Card {i + 1} of {pool.length}
      </div>
      <button
        onClick={() => setFlipped((f) => !f)}
        className="w-full rounded-xl p-8 min-h-[220px] flex flex-col items-center justify-center text-center gap-2"
        style={{ background: flipped ? "var(--yellow-light)" : "var(--green-light)", border: "1px solid var(--border)" }}
      >
        {!flipped ? (
          <>
            <span className="font-serif text-2xl font-bold" style={{ color: "var(--ink)" }}>{term.term}</span>
            {term.latin && <span className="font-mono text-xs" style={{ color: "var(--ink-soft)" }}>{term.latin}</span>}
            <span className="text-xs mt-3" style={{ color: "var(--ink-soft)" }}>Tap to flip</span>
          </>
        ) : (
          <div className="text-left space-y-2">
            <p className="text-sm"><strong>Meaning: </strong>{term.simple}</p>
            <p className="text-sm"><strong>Example: </strong>{term.example}</p>
            <p className="text-sm"><strong>Memory Tip: </strong>{term.memory_tip}</p>
          </div>
        )}
      </button>
      <div className="flex justify-between mt-3">
        <button onClick={() => go(-1)} className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-semibold" style={{ background: "var(--card)", border: "1px solid var(--border)", color: "var(--ink)" }}>
          <IconChevronLeft size={14} /> Prev
        </button>
        <button onClick={() => go(1)} className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-semibold" style={{ background: "var(--card)", border: "1px solid var(--border)", color: "var(--ink)" }}>
          Next <IconChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}
