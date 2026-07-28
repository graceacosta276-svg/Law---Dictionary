# My Law Dictionary — Deployment Guide

This is a real web app: Next.js (React) + Supabase (database, accounts, and
live sync), installable as an app on both desktop and mobile through Chrome.
It's been built and tested to compile cleanly — you just need to connect it
to your own free Supabase project and put it on the web with Vercel. Neither
step needs coding experience; it's mostly clicking buttons and copying two
values.

Total time: about 15–20 minutes the first time.

---

## Step 1 — Create your free Supabase project

1. Go to https://supabase.com and sign up (free tier is enough).
2. Click **New project**. Pick any name, a database password (save it
   somewhere), and a region close to you (Singapore is closest to the
   Philippines).
3. Wait about two minutes while it provisions.

## Step 2 — Create the database tables

1. In your new project, open **SQL Editor** (left sidebar) → **New query**.
2. Open the file `supabase/schema.sql` from this project, copy all of it,
   paste it into the query editor, and click **Run**.
3. You should see "Success. No rows returned." That means your `terms`,
   `favorites`, `term_notes`, and `recents` tables now exist, each locked so
   only you can see your own data.

## Step 3 — Get your API keys

1. In Supabase, go to **Settings** (gear icon) → **API**.
2. Copy the **Project URL** and the **anon public** key. You'll need both in
   the next step.

## Step 4 — Connect the app to Supabase

1. In this project folder, copy `.env.local.example` to a new file named
   `.env.local`.
2. Paste in your Project URL and anon key:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
   ```

## Step 5 — Put it on the web with Vercel

The easiest path is through GitHub:

1. Create a free GitHub account if you don't have one, and create a new
   repository (e.g. `law-dictionary`).
2. Upload this whole project folder to that repository (GitHub's website
   lets you drag-and-drop files if you'd rather not use the command line).
3. Go to https://vercel.com, sign up (you can sign in with your GitHub
   account directly), and click **Add New → Project**.
4. Import your `law-dictionary` repository.
5. Before deploying, open **Environment Variables** and add the same two
   values from your `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
6. Click **Deploy**. In about a minute you'll get a live URL like
   `https://law-dictionary-yourname.vercel.app`.

That URL is now your real, permanent link. Open it on your phone and your
laptop — sign up once with an email and password, and you're using the same
account (and the same live data) on both.

## Step 6 — Install it as an app

- **On your phone (Chrome, Android):** open the URL, tap the ⋮ menu, then
  "Add to Home screen" / "Install app."
- **On iPhone (Safari):** open the URL, tap the Share icon, then "Add to
  Home Screen."
- **On your laptop (Chrome or Edge):** open the URL, click the install icon
  in the address bar (or ⋮ menu → "Install My Law Dictionary...").

Once installed, it opens in its own window with its own icon, just like a
regular app.

## How adding a word works

Tap **Add Term** in the app, fill in the fields (simple meaning, legal
meaning, example, memory tip, etc.), and save. Because it's stored in your
Supabase database and the app subscribes to live changes, it appears on
every other device signed into the same account within a second or two, no
refresh needed.

## If you want me to add words for you

You can still ask me in chat to draft a full entry for a term (all the
sections filled in properly), and I'll hand you the text ready to paste into
the **Add Term** form. Typing it in yourself is what saves it to your real,
synced database — I can't reach into your live app from here.

## Troubleshooting

- **"Setup needed" screen:** your `.env.local` (or Vercel environment
  variables) aren't set yet, or the app needs restarting after adding them.
- **Can't sign in:** Supabase's default setting requires confirming your
  email before first sign-in. Check your inbox for a confirmation link, or
  turn off "Confirm email" in Supabase under **Authentication → Providers →
  Email** if you'd rather skip that step.
- **Changes not syncing between devices:** make sure you're signed in with
  the exact same email on both, and that both have an internet connection.
