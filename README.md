# SCROD — scrodphunk.org

Band website for SCROD. Built with [Eleventy](https://www.11ty.dev/), content
managed through [Pages CMS](https://pagescms.org), hosted on
[Cloudflare Pages](https://pages.cloudflare.com/).

## How content editing works

All the stuff that changes lives in `_data/` as small JSON files:

| File | What it controls |
|---|---|
| `_data/shows.json` | Upcoming shows (past shows auto-hide) |
| `_data/videos.json` | Video cards (embeds and links) |
| `_data/photos.json` | Photo gallery |
| `_data/bio.json` | Bio paragraph and band members |
| `_data/site.json` | Hero eyebrow + tagline |

Band members edit these through a friendly web UI at
**https://app.pagescms.org** (see setup below) — no code required. Saving in
the CMS commits to this repo, which triggers a Cloudflare Pages build and
deploy automatically. Photos uploaded through the CMS land in `/photos/`.

Everything else (layout, styles, the Mailchimp form, social links) lives in
`index.njk`, `styles.css`, and `main.js` and is edited by hand like before.

Notes:

- **Past shows disappear automatically** — the build filters out any show
  whose date is before the day of the build. The list refreshes every time
  something is deployed. (If nothing has been published for a while and a
  stale show lingers, any CMS save — or a "Retry deployment" in Cloudflare —
  refreshes it.)
- The **"Tickets →" button** only appears on a show when its ticket link
  field is filled in.

## Local development

```bash
npm install
npm run dev     # serves at http://localhost:8080 with live reload
npm run build   # writes the site to _site/
```

## One-time setup: Cloudflare Pages (production + staging)

**Do these in order.** The order matters for zero downtime: DNS moves to
Cloudflare first (the site keeps serving from GitHub Pages, unchanged, while
nameservers propagate), and only then does the site itself switch — which is
instant once DNS is already on Cloudflare.

Important: don't merge this branch into `main` until step 2 — GitHub Pages
serves `main` as-is, and after the merge there is no `index.html` there
anymore, so merging early would blank the live site.

### 1. Move DNS to Cloudflare (do this first — nothing visible changes)

1. Cloudflare dashboard → **Add a domain** → `scrodphunk.org` → free plan.
   Cloudflare imports the existing DNS records, including the GitHub Pages
   ones — the site keeps working exactly as before.
2. At the domain registrar, replace the nameservers with the two Cloudflare
   gives you.
3. Wait until Cloudflare shows the zone as **Active** (usually minutes,
   can take a few hours). The site is still the old GitHub Pages site this
   whole time — that's expected.

### 2. Merge this branch into `main`

Merge `claude/cms-cloudflare-migration-niu1lc` → `main`. `scrodphunk.org`
(still pointed at GitHub Pages) will 404 from now until step 4 — a few
minutes.

### 3. Create the Pages project

1. In the [Cloudflare dashboard](https://dash.cloudflare.com) →
   **Workers & Pages → Create → Pages → Connect to Git**.
2. Authorize GitHub and pick `scrod-band/website`.
3. Build settings:
   - **Production branch:** `main`
   - **Build command:** `npm run build`
   - **Build output directory:** `_site`
4. Deploy. You'll get a `<project>.pages.dev` URL — check the site looks
   right there.

### 4. Point the domain at the Pages project

In the Pages project → **Custom domains** → add `scrodphunk.org` and
`www.scrodphunk.org`. Cloudflare replaces the imported GitHub Pages records
and issues certificates; because DNS is already on Cloudflare this takes
effect right away. The new site is now live.

### 5. Turn off GitHub Pages

1. In the GitHub repo → **Settings → Pages** → set Source to "None".
2. Delete the `CNAME` file from the repo root (it was only for GitHub
   Pages), and delete any leftover imported DNS records pointing at
   `*.github.io` or GitHub's IPs if Cloudflare didn't replace them.

### 6. Staging branch

1. Create a `staging` branch in GitHub (from `main`).
2. Cloudflare automatically builds every non-production branch as a preview.
   The `staging` branch always has a stable alias:
   `staging.<project>.pages.dev`.
3. Optional: add a CNAME record `staging` → `staging.<project>.pages.dev`
   (proxied) to get `staging.scrodphunk.org`.

Workflow: design/code experiments go to `staging`, get reviewed at the
staging URL, then merge `staging` → `main` to go live. Content edits via the
CMS commit straight to `main` and go live on their own — shows and photos
don't need to wait for a code review.

### 7. Connect Pages CMS

1. Go to **https://app.pagescms.org**, sign in with GitHub.
2. Install the Pages CMS GitHub App on `scrod-band/website` when prompted.
3. Open the repo in Pages CMS — the editing UI comes from `.pages.yml`,
   already in this repo. Pick the `main` branch to edit live content.
4. Each band member who edits needs a GitHub account with write access to
   this repo (repo → Settings → Collaborators), then signs into Pages CMS
   the same way.

## Nice-to-haves (later)

- `logo.png` is 3.9 MB but displays small — resizing it to ~512px wide
  would noticeably speed up first load.
- A weekly scheduled rebuild (Cloudflare **Deploy Hook** + a cron trigger)
  would expire past shows even when nobody has published anything.
