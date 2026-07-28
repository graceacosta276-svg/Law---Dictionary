"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { CATEGORY_LIST, DIFF_META, SEED_TERMS } from "@/lib/seedTerms";
import { TermDetail, TermRow } from "@/components/TermParts";
import AddTermForm from "@/components/AddTermForm";
import QuizMode from "@/components/QuizMode";
import Flashcards from "@/components/Flashcards";
import {
  IconSearch,
  IconMoon,
  IconSun,
  IconBook,
  IconLayers,
  IconStar,
  IconClock,
  IconBrain,
  IconRotate,
  IconPlus,
  IconSignOut,
  IconWifiOff,
} from "@/components/icons";

const OFFLINE_CACHE_KEY = "law-dictionary:offline-terms-cache";

function dayOfYear(d) {
  const start = new Date(d.getFullYear(), 0, 0);
  return Math.floor((d - start) / 86400000);
}

export default function DictionaryApp({ session }) {
  const userId = session.user.id;

  const [dark, setDark] = useState(false);
  const [view, setView] = useState("home");
  const [query, setQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState(null);

  const [terms, setTerms] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [notes, setNotes] = useState({});
  const [recents, setRecents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [offline, setOffline] = useState(false);
  const [savingTerm, setSavingTerm] = useState(false);

  /* ---------------- Initial load + realtime subscriptions ---------------- */

  const fetchAll = useCallback(async () => {
    try {
      const [{ data: termRows, error: termsErr }, { data: favRows }, { data: noteRows }, { data: recentRows }] = await Promise.all([
        supabase.from("terms").select("*").eq("user_id", userId).order("term"),
        supabase.from("favorites").select("term_id").eq("user_id", userId),
        supabase.from("term_notes").select("term_id, content").eq("user_id", userId),
        supabase.from("recents").select("term_id, viewed_at").eq("user_id", userId).order("viewed_at", { ascending: false }).limit(20),
      ]);
      if (termsErr) throw termsErr;

      let finalTerms = termRows || [];
      if (finalTerms.length === 0) {
        const rows = SEED_TERMS.map((t) => ({ ...t, user_id: userId }));
        const { data: inserted, error: seedErr } = await supabase.from("terms").insert(rows).select();
        if (!seedErr && inserted) {
          finalTerms = inserted.sort((a, b) => a.term.localeCompare(b.term));
        }
      }

      setTerms(finalTerms);
      setFavorites((favRows || []).map((r) => r.term_id));
      const noteMap = {};
      (noteRows || []).forEach((r) => (noteMap[r.term_id] = r.content));
      setNotes(noteMap);
      setRecents((recentRows || []).map((r) => r.term_id));
      setOffline(false);

      try {
        window.localStorage.setItem(OFFLINE_CACHE_KEY, JSON.stringify(finalTerms));
      } catch (e) {
        /* storage unavailable, non-critical */
      }
    } catch (err) {
      // Likely offline: fall back to the last successfully synced snapshot.
      try {
        const cached = window.localStorage.getItem(OFFLINE_CACHE_KEY);
        if (cached) {
          setTerms(JSON.parse(cached));
          setOffline(true);
        }
      } catch (e) {
        /* nothing we can do */
      }
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchAll();

    const channel = supabase
      .channel("dictionary-sync-" + userId)
      .on("postgres_changes", { event: "*", schema: "public", table: "terms", filter: `user_id=eq.${userId}` }, fetchAll)
      .on("postgres_changes", { event: "*", schema: "public", table: "favorites", filter: `user_id=eq.${userId}` }, fetchAll)
      .on("postgres_changes", { event: "*", schema: "public", table: "term_notes", filter: `user_id=eq.${userId}` }, fetchAll)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchAll, userId]);

  /* ---------------------------- Derived data ---------------------------- */

  const findByName = useCallback((name) => terms.find((t) => t.term.toLowerCase() === name.toLowerCase()), [terms]);

  const wordOfDay = useMemo(() => {
    if (terms.length === 0) return null;
    return terms[dayOfYear(new Date()) % terms.length];
  }, [terms]);

  const suggestions = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return terms.filter((t) => t.term.toLowerCase().includes(q)).slice(0, 8);
  }, [query, terms]);

  const filteredAll = useMemo(() => {
    let list = terms;
    if (categoryFilter) list = list.filter((t) => t.category === categoryFilter);
    return [...list].sort((a, b) => a.term.localeCompare(b.term));
  }, [terms, categoryFilter]);

  const grouped = useMemo(() => {
    const g = {};
    filteredAll.forEach((t) => {
      const letter = t.term[0].toUpperCase();
      g[letter] = g[letter] || [];
      g[letter].push(t);
    });
    return g;
  }, [filteredAll]);

  const favTerms = terms.filter((t) => favorites.includes(t.id));
  const recentTerms = recents.map((id) => terms.find((t) => t.id === id)).filter(Boolean);
  const selectedTerm = terms.find((t) => t.id === selectedId);
  const categoriesPresent = Array.from(new Set(terms.map((t) => t.category)));

  /* ------------------------------- Actions ------------------------------- */

  const selectTerm = useCallback(
    async (id) => {
      setSelectedId(id);
      setView("detail");
      setShowSuggestions(false);
      setQuery("");
      if (!offline) {
        await supabase.from("recents").upsert({ user_id: userId, term_id: id, viewed_at: new Date().toISOString() });
      }
    },
    [userId, offline]
  );

  const toggleFav = useCallback(
    async (id) => {
      const isFav = favorites.includes(id);
      setFavorites((prev) => (isFav ? prev.filter((x) => x !== id) : [...prev, id]));
      if (isFav) {
        await supabase.from("favorites").delete().eq("user_id", userId).eq("term_id", id);
      } else {
        await supabase.from("favorites").insert({ user_id: userId, term_id: id });
      }
    },
    [favorites, userId]
  );

  const updateNote = useCallback(
    async (id, text) => {
      setNotes((prev) => ({ ...prev, [id]: text }));
      await supabase.from("term_notes").upsert({ user_id: userId, term_id: id, content: text, updated_at: new Date().toISOString() });
    },
    [userId]
  );

  const addTerm = useCallback(
    async (payload) => {
      setSavingTerm(true);
      try {
        const { data, error } = await supabase.from("terms").insert({ ...payload, user_id: userId }).select().single();
        if (error) throw error;
        setTerms((prev) => [...prev, data].sort((a, b) => a.term.localeCompare(b.term)));
        setView("all");
        return true;
      } catch (err) {
        alert("Could not save this term: " + err.message);
        return false;
      } finally {
        setSavingTerm(false);
      }
    },
    [userId]
  );

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  /* --------------------------------- Theme -------------------------------- */

  const theme = dark
    ? {
        "--paper": "#242321", "--paper-deep": "#1B1A18", "--card": "#2E2C29", "--ink": "#F2EFE8", "--ink-soft": "#B8B2A5",
        "--border": "#46433D", "--green": "#6F9268", "--green-light": "#33402F", "--yellow": "#D6B24E", "--yellow-light": "#453A20",
        "--pink": "#C98A96", "--pink-light": "#412C30",
      }
    : {
        "--paper": "#FAF8F3", "--paper-deep": "#F1EEE3", "--card": "#FFFFFF", "--ink": "#2B2B28", "--ink-soft": "#6B675E",
        "--border": "#DED7C4", "--green": "#7FA377", "--green-light": "#E4EEDF", "--yellow": "#D9B84C", "--yellow-light": "#FBF1D4",
        "--pink": "#CE8E9B", "--pink-light": "#F8E7EA",
      };

  const navItems = [
    { key: "home", label: "Home", Icon: IconBook },
    { key: "all", label: "All Terms", Icon: IconLayers },
    { key: "add", label: "Add Term", Icon: IconPlus },
    { key: "favorites", label: "Favorites", Icon: IconStar },
    { key: "recents", label: "Recents", Icon: IconClock },
    { key: "quiz", label: "Quiz", Icon: IconBrain },
    { key: "flashcards", label: "Flashcards", Icon: IconRotate },
  ];

  return (
    <div style={theme} className="min-h-screen w-full font-sans">
      <div style={{ background: "var(--paper)", color: "var(--ink)", minHeight: "100vh" }} className="p-4 sm:p-6 max-w-4xl mx-auto">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold" style={{ color: "var(--ink)" }}>My Law Dictionary</h1>
            <p className="text-xs sm:text-sm" style={{ color: "var(--ink-soft)" }}>
              {session.user.email} — {terms.length} terms
              {offline && (
                <span className="ml-2 inline-flex items-center gap-1" style={{ color: "#B08A2E" }}>
                  <IconWifiOff size={12} /> offline, showing last synced data
                </span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={() => setDark((d) => !d)} className="rounded-full p-2" style={{ background: "var(--card)", border: "1px solid var(--border)" }} aria-label="Toggle dark mode">
              {dark ? <IconSun size={18} color="var(--yellow)" /> : <IconMoon size={18} color="var(--ink)" />}
            </button>
            <button onClick={signOut} className="rounded-full p-2" style={{ background: "var(--card)", border: "1px solid var(--border)" }} aria-label="Sign out">
              <IconSignOut size={18} color="var(--ink)" />
            </button>
          </div>
        </div>

        <div className="relative mb-4">
          <div className="flex items-center gap-2 rounded-full px-4 py-2.5" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
            <IconSearch size={18} color="var(--ink-soft)" />
            <input
              value={query}
              onChange={(e) => { setQuery(e.target.value); setShowSuggestions(true); }}
              onFocus={() => setShowSuggestions(true)}
              placeholder="Search a legal term, maxim, or doctrine..."
              className="w-full bg-transparent outline-none text-sm"
              style={{ color: "var(--ink)" }}
            />
          </div>
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute z-10 mt-1 w-full rounded-lg overflow-hidden shadow-lg" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
              {suggestions.map((t) => (
                <button key={t.id} onClick={() => selectTerm(t.id)} className="w-full text-left px-4 py-2 text-sm flex items-center justify-between hover:opacity-80" style={{ borderBottom: "1px solid var(--border)", color: "var(--ink)" }}>
                  <span>{t.term}</span>
                  <span className="text-xs" style={{ color: "var(--ink-soft)" }}>{DIFF_META[t.difficulty]?.emoji}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-1.5 mb-5">
          {navItems.map((n) => {
            const active = view === n.key;
            const NIcon = n.Icon;
            return (
              <button
                key={n.key}
                onClick={() => { setView(n.key); setShowSuggestions(false); }}
                className="flex items-center gap-1.5 rounded-t-lg px-3 py-2 text-xs sm:text-sm font-semibold transition"
                style={{ background: active ? "var(--green)" : "var(--card)", color: active ? "#fff" : "var(--ink)", border: "1px solid var(--border)", borderBottom: active ? "1px solid var(--green)" : "1px solid var(--border)" }}
              >
                <NIcon size={14} color={active ? "#fff" : "var(--ink)"} /> {n.label}
              </button>
            );
          })}
        </div>

        {loading ? (
          <p className="text-sm" style={{ color: "var(--ink-soft)" }}>Loading your dictionary...</p>
        ) : view === "detail" && selectedTerm ? (
          <TermDetail
            term={selectedTerm}
            isFav={favorites.includes(selectedTerm.id)}
            onToggleFav={toggleFav}
            note={notes[selectedTerm.id]}
            onNoteChange={updateNote}
            onRelatedClick={selectTerm}
            onClose={() => setView("home")}
            findByName={findByName}
          />
        ) : view === "add" ? (
          <AddTermForm onSubmit={addTerm} onCancel={() => setView("all")} busy={savingTerm} />
        ) : view === "home" ? (
          <div className="space-y-5">
            {wordOfDay && (
              <div className="rounded-xl p-4" style={{ background: "var(--green-light)", border: "1px solid var(--green)" }}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold uppercase tracking-wider" style={{ color: "#3F5B3C" }}>📖 Word of the Day</span>
                </div>
                <h3 className="font-serif text-xl font-bold mb-1" style={{ color: "var(--ink)" }}>{wordOfDay.term}</h3>
                <p className="text-sm mb-3" style={{ color: "var(--ink)" }}>{wordOfDay.simple}</p>
                <button onClick={() => selectTerm(wordOfDay.id)} className="text-xs font-semibold rounded-full px-3 py-1.5 text-white" style={{ background: "var(--green)" }}>
                  Read Full Entry
                </button>
              </div>
            )}

            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl p-3 text-center" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
                <div className="font-serif text-xl font-bold" style={{ color: "var(--ink)" }}>{terms.length}</div>
                <div className="text-xs" style={{ color: "var(--ink-soft)" }}>Total Terms</div>
              </div>
              <div className="rounded-xl p-3 text-center" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
                <div className="font-serif text-xl font-bold" style={{ color: "var(--ink)" }}>{favorites.length}</div>
                <div className="text-xs" style={{ color: "var(--ink-soft)" }}>Favorites</div>
              </div>
              <div className="rounded-xl p-3 text-center" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
                <div className="font-serif text-xl font-bold" style={{ color: "var(--ink)" }}>{categoriesPresent.length}</div>
                <div className="text-xs" style={{ color: "var(--ink-soft)" }}>Categories</div>
              </div>
            </div>

            <div>
              <div className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "var(--ink-soft)" }}>Browse by Category</div>
              <div className="flex flex-wrap gap-2">
                {categoriesPresent.map((c) => (
                  <button key={c} onClick={() => { setCategoryFilter(c); setView("all"); }} className="rounded-full px-3 py-1.5 text-xs font-medium" style={{ background: "var(--yellow-light)", border: "1px solid var(--yellow)", color: dark ? "#F2EFE8" : "#7A5B14" }}>
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => setView("add")}
              className="w-full rounded-xl p-4 text-sm font-semibold flex items-center justify-center gap-2"
              style={{ background: "var(--card)", border: "1px dashed var(--green)", color: "var(--green)" }}
            >
              <IconPlus size={14} /> Add a New Term
            </button>
          </div>
        ) : view === "all" ? (
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <button onClick={() => setCategoryFilter(null)} className="rounded-full px-3 py-1 text-xs font-semibold" style={{ background: !categoryFilter ? "var(--green)" : "var(--card)", color: !categoryFilter ? "#fff" : "var(--ink)", border: "1px solid var(--border)" }}>
                All
              </button>
              {CATEGORY_LIST.map((c) => (
                <button key={c} onClick={() => setCategoryFilter(c)} className="rounded-full px-3 py-1 text-xs font-semibold" style={{ background: categoryFilter === c ? "var(--green)" : "var(--card)", color: categoryFilter === c ? "#fff" : "var(--ink)", border: "1px solid var(--border)" }}>
                  {c}
                </button>
              ))}
            </div>
            <div className="space-y-5">
              {Object.keys(grouped).sort().map((letter) => (
                <div key={letter}>
                  <div className="font-serif text-lg font-bold mb-2 inline-block px-2 rounded" style={{ background: "var(--pink-light)", color: "#7A3542" }}>{letter}</div>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {grouped[letter].map((t) => (
                      <TermRow key={t.id} term={t} isFav={favorites.includes(t.id)} onClick={() => selectTerm(t.id)} />
                    ))}
                  </div>
                </div>
              ))}
              {filteredAll.length === 0 && <p className="text-sm" style={{ color: "var(--ink-soft)" }}>No terms yet. Add your first one!</p>}
            </div>
          </div>
        ) : view === "favorites" ? (
          <div className="space-y-2">
            {favTerms.length === 0
              ? <p className="text-sm" style={{ color: "var(--ink-soft)" }}>No favorites yet. Tap the star on any term to save it here.</p>
              : favTerms.map((t) => <TermRow key={t.id} term={t} isFav onClick={() => selectTerm(t.id)} />)}
          </div>
        ) : view === "recents" ? (
          <div className="space-y-2">
            {recentTerms.length === 0
              ? <p className="text-sm" style={{ color: "var(--ink-soft)" }}>Terms you look up will show up here, most recent first.</p>
              : recentTerms.map((t) => <TermRow key={t.id} term={t} isFav={favorites.includes(t.id)} onClick={() => selectTerm(t.id)} />)}
          </div>
        ) : view === "quiz" ? (
          <QuizMode key={terms.length} terms={terms} />
        ) : view === "flashcards" ? (
          <Flashcards pool={terms} />
        ) : null}
      </div>
    </div>
  );
}
