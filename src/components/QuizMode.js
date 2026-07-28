"use client";

import { useState } from "react";
import { IconBrain, IconRotate, IconCheck, IconChevronRight } from "@/components/icons";

const QUIZ_LENGTH = 8;

function buildQuiz(terms) {
  const size = Math.min(QUIZ_LENGTH, terms.length);
  const pool = [...terms].sort(() => Math.random() - 0.5).slice(0, size);
  return pool.map((t) => {
    const wrongPool = terms.filter((x) => x.id !== t.id).sort(() => Math.random() - 0.5).slice(0, 3);
    const options = [t, ...wrongPool].sort(() => Math.random() - 0.5).map((o) => ({ id: o.id, text: o.simple }));
    return { termId: t.id, term: t.term, options, correctId: t.id };
  });
}

export default function QuizMode({ terms }) {
  const [questions, setQuestions] = useState(() => buildQuiz(terms));
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState(null);
  const [done, setDone] = useState(false);

  if (terms.length < 4) {
    return (
      <div className="rounded-xl p-6 text-center text-sm" style={{ background: "var(--card)", border: "1px solid var(--border)", color: "var(--ink-soft)" }}>
        Add at least 4 terms to unlock quiz mode.
      </div>
    );
  }

  const q = questions[index];

  const choose = (optId) => {
    if (selected) return;
    setSelected(optId);
    if (optId === q.correctId) setScore((s) => s + 1);
  };

  const next = () => {
    if (index + 1 >= questions.length) setDone(true);
    else {
      setIndex((i) => i + 1);
      setSelected(null);
    }
  };

  const restart = () => {
    setQuestions(buildQuiz(terms));
    setIndex(0);
    setScore(0);
    setSelected(null);
    setDone(false);
  };

  if (done) {
    const pct = Math.round((score / questions.length) * 100);
    return (
      <div className="rounded-xl p-6 text-center" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
        <div className="mb-3"><IconBrain size={36} color="var(--pink)" /></div>
        <h3 className="font-serif text-xl font-bold mb-1" style={{ color: "var(--ink)" }}>Quiz Complete</h3>
        <p className="text-sm mb-4" style={{ color: "var(--ink-soft)" }}>
          You scored {score} out of {questions.length} ({pct}%)
        </p>
        <button
          onClick={restart}
          className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white"
          style={{ background: "var(--green)" }}
        >
          <IconRotate size={14} /> Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-xl p-5" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--ink-soft)" }}>
          Question {index + 1} of {questions.length}
        </span>
        <span className="text-xs font-semibold" style={{ color: "var(--ink-soft)" }}>Score: {score}</span>
      </div>
      <h3 className="font-serif text-lg font-bold mb-4" style={{ color: "var(--ink)" }}>What is {q.term}?</h3>
      <div className="space-y-2">
        {q.options.map((opt) => {
          const isCorrect = opt.id === q.correctId;
          const isChosen = selected === opt.id;
          let style = { background: "var(--paper)", border: "1px solid var(--border)", color: "var(--ink)" };
          if (selected) {
            if (isCorrect) style = { background: "var(--green-light)", border: "1px solid var(--green)", color: "#3F5B3C" };
            else if (isChosen) style = { background: "var(--pink-light)", border: "1px solid var(--pink)", color: "#7A3542" };
          }
          return (
            <button
              key={opt.id}
              onClick={() => choose(opt.id)}
              disabled={!!selected}
              className="w-full text-left rounded-lg p-3 text-sm flex items-center justify-between gap-2"
              style={style}
            >
              <span>{opt.text}</span>
              {selected && isCorrect && <IconCheck size={16} />}
            </button>
          );
        })}
      </div>
      {selected && (
        <button
          onClick={next}
          className="mt-4 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white"
          style={{ background: "var(--pink)" }}
        >
          {index + 1 >= questions.length ? "See Results" : "Next Question"} <IconChevronRight size={14} />
        </button>
      )}
    </div>
  );
}
