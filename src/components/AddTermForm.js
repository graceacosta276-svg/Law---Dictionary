"use client";

import { useState } from "react";
import { CATEGORY_LIST } from "@/lib/seedTerms";

const EMPTY = {
  term: "",
  category: CATEGORY_LIST[0],
  difficulty: "beginner",
  simple: "",
  legal: "",
  beginner: "",
  why: "",
  example: "",
  memory_tip: "",
  latin: "",
  related_laws: "",
  cases: "",
  related: "",
};

const FIELD_LABELS = [
  ["simple", "Simple Meaning", "textarea"],
  ["legal", "Legal Meaning", "textarea"],
  ["beginner", "Beginner Explanation", "textarea"],
  ["why", "Why It Matters", "textarea"],
  ["example", "Example", "textarea"],
  ["memory_tip", "Memory Tip", "textarea"],
  ["latin", "Latin Origin (optional)", "text"],
];

function toArray(csv) {
  return csv
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export default function AddTermForm({ onSubmit, onCancel, busy }) {
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState("");

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.term.trim() || !form.simple.trim()) {
      setError("At least a term name and a simple meaning are required.");
      return;
    }
    const payload = {
      term: form.term.trim(),
      category: form.category,
      difficulty: form.difficulty,
      simple: form.simple.trim(),
      legal: form.legal.trim(),
      beginner: form.beginner.trim(),
      why: form.why.trim(),
      example: form.example.trim(),
      memory_tip: form.memory_tip.trim(),
      latin: form.latin.trim() || null,
      related_laws: toArray(form.related_laws),
      cases: toArray(form.cases),
      related: toArray(form.related),
    };
    const ok = await onSubmit(payload);
    if (ok) setForm(EMPTY);
  };

  return (
    <form onSubmit={submit} className="rounded-xl p-4 space-y-3" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
      <h3 className="font-serif text-lg font-bold" style={{ color: "var(--ink)" }}>Add a New Term</h3>

      {error && (
        <div className="rounded-lg p-2 text-xs" style={{ background: "var(--pink-light)", color: "#7A3542", border: "1px solid var(--pink)" }}>
          {error}
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold mb-1" style={{ color: "var(--ink-soft)" }}>Term</label>
          <input
            value={form.term}
            onChange={set("term")}
            placeholder="e.g. Replevin"
            className="w-full rounded-md p-2 text-sm"
            style={{ background: "var(--paper)", border: "1px solid var(--border)", color: "var(--ink)" }}
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: "var(--ink-soft)" }}>Category</label>
            <select
              value={form.category}
              onChange={set("category")}
              className="w-full rounded-md p-2 text-sm"
              style={{ background: "var(--paper)", border: "1px solid var(--border)", color: "var(--ink)" }}
            >
              {CATEGORY_LIST.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: "var(--ink-soft)" }}>Difficulty</label>
            <select
              value={form.difficulty}
              onChange={set("difficulty")}
              className="w-full rounded-md p-2 text-sm"
              style={{ background: "var(--paper)", border: "1px solid var(--border)", color: "var(--ink)" }}
            >
              <option value="beginner">🟢 Beginner</option>
              <option value="intermediate">🟡 Intermediate</option>
              <option value="advanced">🔴 Advanced</option>
            </select>
          </div>
        </div>
      </div>

      {FIELD_LABELS.map(([key, label, type]) => (
        <div key={key}>
          <label className="block text-xs font-semibold mb-1" style={{ color: "var(--ink-soft)" }}>{label}</label>
          {type === "textarea" ? (
            <textarea
              value={form[key]}
              onChange={set(key)}
              rows={2}
              className="w-full rounded-md p-2 text-sm resize-none"
              style={{ background: "var(--paper)", border: "1px solid var(--border)", color: "var(--ink)" }}
            />
          ) : (
            <input
              value={form[key]}
              onChange={set(key)}
              className="w-full rounded-md p-2 text-sm"
              style={{ background: "var(--paper)", border: "1px solid var(--border)", color: "var(--ink)" }}
            />
          )}
        </div>
      ))}

      <div className="grid sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-semibold mb-1" style={{ color: "var(--ink-soft)" }}>Related Laws</label>
          <input
            value={form.related_laws}
            onChange={set("related_laws")}
            placeholder="Comma separated"
            className="w-full rounded-md p-2 text-sm"
            style={{ background: "var(--paper)", border: "1px solid var(--border)", color: "var(--ink)" }}
          />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1" style={{ color: "var(--ink-soft)" }}>Important Cases</label>
          <input
            value={form.cases}
            onChange={set("cases")}
            placeholder="Comma separated"
            className="w-full rounded-md p-2 text-sm"
            style={{ background: "var(--paper)", border: "1px solid var(--border)", color: "var(--ink)" }}
          />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1" style={{ color: "var(--ink-soft)" }}>Related Terms</label>
          <input
            value={form.related}
            onChange={set("related")}
            placeholder="Comma separated"
            className="w-full rounded-md p-2 text-sm"
            style={{ background: "var(--paper)", border: "1px solid var(--border)", color: "var(--ink)" }}
          />
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <button
          type="submit"
          disabled={busy}
          className="rounded-full px-4 py-2 text-sm font-semibold text-white"
          style={{ background: "var(--green)" }}
        >
          {busy ? "Saving..." : "Save Term"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-full px-4 py-2 text-sm font-semibold"
          style={{ background: "var(--paper)", border: "1px solid var(--border)", color: "var(--ink)" }}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
