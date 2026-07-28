"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { CATEGORY_LIST } from "@/lib/seedTerms";

const REQUIRED_FIELDS = ["term", "category", "difficulty", "simple"];
const VALID_DIFFICULTIES = ["beginner", "intermediate", "advanced"];

function normalizeRow(raw) {
  return {
    term: String(raw.term || "").trim(),
    category: String(raw.category || "").trim(),
    difficulty: VALID_DIFFICULTIES.includes(raw.difficulty) ? raw.difficulty : "beginner",
    simple: String(raw.simple || "").trim(),
    legal: String(raw.legal || "").trim(),
    beginner: String(raw.beginner || "").trim(),
    why: String(raw.why || "").trim(),
    example: String(raw.example || "").trim(),
    memory_tip: String(raw.memory_tip || raw.memoryTip || "").trim(),
    latin: raw.latin ? String(raw.latin).trim() : null,
    related_laws: Array.isArray(raw.related_laws) ? raw.related_laws : Array.isArray(raw.relatedLaws) ? raw.relatedLaws : [],
    cases: Array.isArray(raw.cases) ? raw.cases : [],
    related: Array.isArray(raw.related) ? raw.related : [],
  };
}

export default function BulkImport({ userId, existingTerms, onImported }) {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const runImport = async () => {
    setError("");
    setResult(null);
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch (e) {
      setError("That doesn't look like valid JSON. Make sure you're pasting a [ ... ] list of term objects, exactly as given.");
      return;
    }
    if (!Array.isArray(parsed)) {
      setError("The pasted content needs to be a JSON array (starting with [ and ending with ]) of term objects.");
      return;
    }

    const existingNames = new Set(existingTerms.map((t) => t.term.toLowerCase()));
    const rows = [];
    const skipped = [];

    for (const raw of parsed) {
      const missing = REQUIRED_FIELDS.filter((f) => !raw[f] || String(raw[f]).trim() === "");
      if (missing.length > 0) {
        skipped.push(`${raw.term || "(unnamed)"} — missing ${missing.join(", ")}`);
        continue;
      }
      if (existingNames.has(String(raw.term).trim().toLowerCase())) {
        skipped.push(`${raw.term} — already in your dictionary`);
        continue;
      }
      rows.push({ ...normalizeRow(raw), user_id: userId });
      existingNames.add(String(raw.term).trim().toLowerCase());
    }

    if (rows.length === 0) {
      setError("Nothing new to import. " + (skipped.length ? `All ${skipped.length} entries were skipped.` : ""));
      return;
    }

    setBusy(true);
    try {
      const { data, error: insertErr } = await supabase.from("terms").insert(rows).select();
      if (insertErr) throw insertErr;
      setResult({ added: data.length, skipped });
      setText("");
      onImported();
    } catch (e) {
      setError("Import failed: " + e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-xl p-4 space-y-3" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
      <h3 className="font-serif text-lg font-bold" style={{ color: "var(--ink)" }}>Bulk Import Terms</h3>
      <p className="text-sm" style={{ color: "var(--ink-soft)" }}>
        Paste a JSON list of terms below (the format Claude gives you) and click Import. Duplicate terms already in
        your dictionary are automatically skipped.
      </p>

      {error && (
        <div className="rounded-lg p-2 text-xs whitespace-pre-wrap" style={{ background: "var(--pink-light)", color: "#7A3542", border: "1px solid var(--pink)" }}>
          {error}
        </div>
      )}

      {result && (
        <div className="rounded-lg p-3 text-xs space-y-1" style={{ background: "var(--green-light)", color: "#3F5B3C", border: "1px solid var(--green)" }}>
          <div className="font-semibold">Added {result.added} new term{result.added === 1 ? "" : "s"}.</div>
          {result.skipped.length > 0 && (
            <div>
              Skipped {result.skipped.length}: {result.skipped.join("; ")}
            </div>
          )}
        </div>
      )}

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={`[\n  {\n    "term": "Replevin",\n    "category": "${CATEGORY_LIST[3] || CATEGORY_LIST[0]}",\n    "difficulty": "intermediate",\n    "simple": "...",\n    "legal": "...",\n    "beginner": "...",\n    "why": "...",\n    "example": "...",\n    "memory_tip": "...",\n    "latin": null,\n    "related_laws": [],\n    "cases": [],\n    "related": []\n  }\n]`}
        rows={12}
        className="w-full rounded-md p-2 text-xs font-mono resize-y"
        style={{ background: "var(--paper)", border: "1px solid var(--border)", color: "var(--ink)" }}
      />

      <button
        onClick={runImport}
        disabled={busy || !text.trim()}
        className="rounded-full px-4 py-2 text-sm font-semibold text-white"
        style={{ background: "var(--green)", opacity: busy || !text.trim() ? 0.6 : 1 }}
      >
        {busy ? "Importing..." : "Import Terms"}
      </button>
    </div>
  );
}
