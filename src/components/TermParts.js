"use client";

import { useEffect, useState } from "react";
import { DIFF_META } from "@/lib/seedTerms";
import { IconBook, IconStar, IconX } from "@/components/icons";

export function DifficultyBadge({ level }) {
  const m = DIFF_META[level] || DIFF_META.beginner;
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold border"
      style={{ background: m.bg, color: m.fg, borderColor: m.border }}
    >
      <span>{m.emoji}</span>
      {m.label}
    </span>
  );
}

export function CategoryTag({ category }) {
  return (
    <span
      className="inline-flex items-center rounded px-2 py-0.5 text-[11px] font-medium tracking-wide uppercase"
      style={{ background: "var(--paper-deep)", color: "var(--ink-soft)", border: "1px solid var(--border)" }}
    >
      {category}
    </span>
  );
}

function SectionBlock({ title, accent, children }) {
  return (
    <div className="mb-4">
      <div
        className="inline-block rounded-t-md px-3 py-1 text-xs font-bold uppercase tracking-wider font-serif"
        style={{ background: accent, color: "#fff" }}
      >
        {title}
      </div>
      <div
        className="rounded-b-md rounded-tr-md p-3 text-sm leading-relaxed"
        style={{ background: "var(--card)", border: "1px solid var(--border)" }}
      >
        {children}
      </div>
    </div>
  );
}

export function TermDetail({ term, isFav, onToggleFav, note, onNoteChange, onRelatedClick, onClose, findByName }) {
  const [draft, setDraft] = useState(note || "");
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDraft(note || "");
  }, [term.id, note]);

  const relatedLaws = term.related_laws || [];
  const cases = term.cases || [];
  const related = term.related || [];

  return (
    <div className="rounded-xl overflow-hidden shadow-sm" style={{ border: "1px solid var(--border)", background: "var(--card)" }}>
      <div className="flex items-center justify-between px-4 py-3" style={{ background: "var(--green)" }}>
        <div className="flex items-center gap-2 flex-wrap">
          <IconBook size={18} color="#fff" />
          <h2 className="font-serif text-lg sm:text-xl text-white font-bold">{term.term}</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onToggleFav(term.id)}
            aria-label="Toggle favorite"
            className="rounded-full p-1.5 transition"
            style={{ background: isFav ? "var(--yellow)" : "rgba(255,255,255,0.25)" }}
          >
            <IconStar size={16} color={isFav ? "#5a4712" : "#fff"} fill={isFav ? "#5a4712" : "none"} />
          </button>
          {onClose && (
            <button onClick={onClose} className="rounded-full p-1.5" style={{ background: "rgba(255,255,255,0.25)" }}>
              <IconX size={16} color="#fff" />
            </button>
          )}
        </div>
      </div>

      <div className="p-4">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <DifficultyBadge level={term.difficulty} />
          <CategoryTag category={term.category} />
        </div>

        <SectionBlock title="Simple Meaning" accent="var(--green)">{term.simple}</SectionBlock>
        <SectionBlock title="Legal Meaning" accent="#5F7A5C">{term.legal}</SectionBlock>
        <SectionBlock title="Beginner Explanation" accent="var(--yellow)">{term.beginner}</SectionBlock>
        <SectionBlock title="Why It Matters" accent="#B08A2E">{term.why}</SectionBlock>
        <SectionBlock title="Example" accent="var(--pink)">{term.example}</SectionBlock>
        <SectionBlock title="Memory Tip" accent="#A6717D">{term.memory_tip}</SectionBlock>

        {term.latin && (
          <SectionBlock title="Latin Origin" accent="#6E6E68">
            <span className="font-mono text-[13px]">{term.latin}</span>
          </SectionBlock>
        )}

        {relatedLaws.length > 0 && (
          <SectionBlock title="Related Laws" accent="#6E6E68">
            <ul className="list-disc list-inside space-y-0.5">
              {relatedLaws.map((l) => (
                <li key={l} className="font-mono text-[13px]">{l}</li>
              ))}
            </ul>
          </SectionBlock>
        )}

        {cases.length > 0 && (
          <SectionBlock title="Important Cases" accent="#6E6E68">
            <ul className="list-disc list-inside space-y-0.5 italic">
              {cases.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </SectionBlock>
        )}

        {related.length > 0 && (
          <div className="mb-4">
            <div className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "var(--ink-soft)" }}>
              Related Terms
            </div>
            <div className="flex flex-wrap gap-2">
              {related.map((r) => {
                const exists = findByName(r);
                return (
                  <button
                    key={r}
                    onClick={() => exists && onRelatedClick(exists.id)}
                    disabled={!exists}
                    className="rounded-full px-3 py-1 text-xs font-medium transition hover:opacity-80"
                    style={{
                      background: "var(--green-light)",
                      color: "#3F5B3C",
                      border: "1px solid var(--green)",
                      cursor: exists ? "pointer" : "default",
                      opacity: exists ? 1 : 0.6,
                    }}
                  >
                    {r}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div>
          <div className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "var(--ink-soft)" }}>
            Notes
          </div>
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={() => onNoteChange(term.id, draft)}
            placeholder="Write your own notes on this term..."
            rows={3}
            className="w-full rounded-md p-2 text-sm resize-none focus:outline-none focus:ring-2"
            style={{ background: "var(--paper)", border: "1px solid var(--border)", color: "var(--ink)" }}
          />
        </div>
      </div>
    </div>
  );
}

export function TermRow({ term, onClick, isFav }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-lg p-3 flex items-center justify-between gap-2 transition hover:shadow-sm"
      style={{ background: "var(--card)", border: "1px solid var(--border)" }}
    >
      <div className="min-w-0">
        <div className="font-serif font-semibold text-sm truncate" style={{ color: "var(--ink)" }}>
          {term.term}
        </div>
        <div className="text-xs truncate" style={{ color: "var(--ink-soft)" }}>
          {term.simple}
        </div>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        {isFav && <IconStar size={14} fill="var(--yellow)" color="var(--yellow)" />}
        <span className="text-sm">{DIFF_META[term.difficulty]?.emoji}</span>
      </div>
    </button>
  );
}
