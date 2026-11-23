# Deploying thenaturelibrary.org

This page is for whoever works on the site, and for their Claude Code. It explains how a change gets
from this repo onto thenaturelibrary.org now that the site runs on its own server and no longer on Vercel.

**In one line:** push to `main`, and the site updates about three minutes later. Nothing else changes in your daily work.

## Before the first deploy: put your current code on `main`

Until now, production was deployed with the `vercel` CLI from your own machine. GitHub's `main` is older
than what is live (it is the code from 19 October, without sign-in, the school, the apothecary or the maps).
The server builds **only what is on GitHub**, so:

1. Push your current code to `main` (merge this pull request into it, or push your local `main` and then merge this).
2. Ask Derek to turn deploys on. That is the repository variable `DEPLOY_ENABLED = true`; until it is set, the
   Deploy workflow is skipped and pushing to `main` changes nothing.

Do not use `vercel --prod` after the switch. It would update the old Vercel project, which no longer serves the domain.

## How a push becomes a deploy

1. You push (or merge a pull request) to `main`.
2. The **Deploy** workflow (`.github/workflows/deploy.yml`) starts on GitHub Actions. It sends the server
   one command: "deploy this commit".
3. The server fetches that commit from this repo, runs `npm ci` and `next build`, and swaps the new build in.
   The env values come from a file on the server; the workflow never sees or prints them.
4. The server checks that the home page answers within 90 seconds. **If the new build fails, or does not answer,
   the site stays on (or goes back to) the version that was live.** A broken build cannot take the site down.

A build takes about two minutes on the server, three minutes end to end. Two pushes in a row deploy one after the other.

## Did it work?

- **The workflow run:** the repo's **Actions** tab → **Deploy**. Green means the commit you pushed is live; the
  run's summary shows the live commit. If it is red, open the step that failed. "next build failed" means a
  build error, shown in the log just above, and the live site is unchanged.
- **The site itself:** <https://thenaturelibrary.org/__version> shows the commit that is live.

## Rolling back

**Actions → Deploy → Run workflow**, and type an older commit's SHA (or a branch name) into the box. That commit
goes live. The last three builds are kept on the server, so going back to one of them takes a few seconds;
anything older is rebuilt (about two minutes).

You can also fix forward: revert the commit on `main` and push.

## Running it locally

```bash
npm ci
# create .env.local with the three values below
npm run dev                  # http://localhost:3000
```

`.env.local` needs `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
These are the same values as before; the two Supabase ones are on the Supabase project's API settings page.
Never commit `.env.local` (`.gitignore` already keeps it out). This repo is public.

To try it the way the server runs it: `npm run build && npm start`.

## Adding or changing an env var

The server's values live in one file on the server, which only Derek can change. To add or change one:

1. Tell Derek the **name**, and whether it is public (`NEXT_PUBLIC_…`, built into the pages) or server-only.
2. Send the **value** privately (not in an issue, a commit or a pull request).
3. Once he has set it, redeploy: push anything to `main`, or **Run workflow** on `main`. `NEXT_PUBLIC_` values
   are baked in at build time, so a redeploy is needed for them to take effect.

## What replaced each Vercel feature

| On Vercel | Now |
|---|---|
| Push / `vercel --prod` deploys | Push to `main` deploys (this page). |
| Instant rollback | **Run workflow** with an older commit (above). |
| Env vars in the dashboard, `vercel env pull` | A file on the server, changed by Derek. No pull command: you keep your own `.env.local`. |
| Runtime logs | Not self-serve yet. Ask Derek for the log around a time and a URL; the server keeps two weeks. |
| Preview deployments | **None yet.** See below. |
| Firewall: AI bots blocked, other bots challenged | Cloudflare in front of the site ("Block AI bots", Bot Fight Mode), the same AI user-agents refused by the server, and `robots.txt` (`src/app/robots.ts`) listing them. |
| CDN caching | Cloudflare caches pages at the edge; `/_next/static` files are cached forever. Signed-in visitors are never served a cached page. |
| Data cache (ISR / `fetch` revalidate) | Same Next.js behaviour, on the server's disk. The cache is kept across deploys and trimmed daily. |
| Analytics, Speed Insights | Were not in use. |

### Previews

If you want previews, the simplest option is a `preview` branch: every push to it would build on the same server and
appear at a second address such as `preview.thenaturelibrary.org` (marked noindex). It costs nothing extra (the
server has room for a second copy of the site), only a DNS record and a second workflow. Ask Derek if you want it.
It would be one shared preview, not one per pull request.

## Things to know when changing the code

- **iNaturalist limits requests per address.** On Vercel the site's calls came from many addresses; now they come
  from one. Above roughly one request a second, iNaturalist answers HTTP 429. A page rendered for the first time
  then fails (the code throws, correctly, so the failure is never cached). Two things would help, and both are your call:
  - send a `User-Agent` naming the site and a contact on every iNaturalist call (iNaturalist asks for this), and
  - pass iNaturalist calls in `src/lib/fetch-json.ts` through a small in-process queue (for example, at most two at a time),
    and wait for `Retry-After` on a 429 instead of retrying after 0.6 s.

  The server pre-fills the cache by walking the sitemap slowly, so most pages are warm already.
- The server runs `next start` on Node 24. No `output: "standalone"` or other config is needed. The home page `/`
  must answer 200 for a deploy to count as healthy.
- The path `/__version` is answered by the server, not by Next.
- `deploy/server/` holds copies of the server's scripts and config, for reference. **Editing them does not change the
  server**; ask Derek if something there should change.
- Never put a server address, key or token in this repo. The deploy settings live in GitHub's Actions secrets.
