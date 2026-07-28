"use client";

import { useEffect, useState } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabaseClient";
import { SEED_TERMS } from "@/lib/seedTerms";
import DictionaryApp from "@/components/DictionaryApp";

export default function AuthGate() {
  const [session, setSession] = useState(undefined); // undefined = loading, null = signed out
  const [mode, setMode] = useState("signin"); // signin | signup
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [info, setInfo] = useState("");

  useEffect(() => {
    if (!isSupabaseConfigured) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSession(null);
      return;
    }
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  const seedStarterTerms = async (userId) => {
    const rows = SEED_TERMS.map((t) => ({ ...t, user_id: userId }));
    await supabase.from("terms").insert(rows);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");
    setBusy(true);
    try {
      if (mode === "signup") {
        const { data, error: signUpError } = await supabase.auth.signUp({ email, password });
        if (signUpError) throw signUpError;
        if (data.user && !data.session) {
          setInfo("Check your email to confirm your account, then sign in.");
          setMode("signin");
        } else if (data.user) {
          await seedStarterTerms(data.user.id);
        }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
      }
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  if (!isSupabaseConfigured) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: "#FAF8F3" }}>
        <div className="max-w-md text-center rounded-xl p-6" style={{ background: "#fff", border: "1px solid #DED7C4" }}>
          <h1 className="font-serif text-xl font-bold mb-2">Setup needed</h1>
          <p className="text-sm text-gray-600">
            This app needs a Supabase project connected. Add{" "}
            <code>NEXT_PUBLIC_SUPABASE_URL</code> and <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> to your{" "}
            <code>.env.local</code> file (see the README), then restart the app.
          </p>
        </div>
      </div>
    );
  }

  if (session === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#FAF8F3" }}>
        <p className="text-sm text-gray-500">Loading your dictionary...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: "#FAF8F3" }}>
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-sm rounded-2xl p-6"
          style={{ background: "#fff", border: "1px solid #DED7C4" }}
        >
          <h1 className="font-serif text-2xl font-bold mb-1" style={{ color: "#2B2B28" }}>
            My Law Dictionary
          </h1>
          <p className="text-sm mb-5" style={{ color: "#6B675E" }}>
            {mode === "signup" ? "Create your account to start building your dictionary." : "Sign in to your dictionary."}
          </p>

          {error && (
            <div className="mb-3 rounded-lg p-2 text-xs" style={{ background: "#F8E7EA", color: "#7A3542", border: "1px solid #CE8E9B" }}>
              {error}
            </div>
          )}
          {info && (
            <div className="mb-3 rounded-lg p-2 text-xs" style={{ background: "#E4EEDF", color: "#3F5B3C", border: "1px solid #7FA377" }}>
              {info}
            </div>
          )}

          <label className="block text-xs font-semibold mb-1" style={{ color: "#6B675E" }}>
            Email
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full mb-3 rounded-lg px-3 py-2 text-sm outline-none"
            style={{ border: "1px solid #DED7C4" }}
          />

          <label className="block text-xs font-semibold mb-1" style={{ color: "#6B675E" }}>
            Password
          </label>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full mb-5 rounded-lg px-3 py-2 text-sm outline-none"
            style={{ border: "1px solid #DED7C4" }}
          />

          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-full py-2 text-sm font-semibold text-white mb-3"
            style={{ background: "#7FA377" }}
          >
            {busy ? "Please wait..." : mode === "signup" ? "Create Account" : "Sign In"}
          </button>

          <button
            type="button"
            onClick={() => {
              setMode(mode === "signup" ? "signin" : "signup");
              setError("");
              setInfo("");
            }}
            className="w-full text-xs font-semibold"
            style={{ color: "#7FA377" }}
          >
            {mode === "signup" ? "Already have an account? Sign in" : "New here? Create an account"}
          </button>

          <p className="text-[11px] mt-4 text-center" style={{ color: "#B8B2A5" }}>
            Sign in with the same account on your phone and laptop to keep everything in sync.
          </p>
        </form>
      </div>
    );
  }

  return <DictionaryApp session={session} />;
}
