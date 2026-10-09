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

Band members edit these through a web UI at **https://app.pagescms.org**
(no code required). Saving in the CMS commits to this repo; a GitHub Action
then builds the site and deploys it to Cloudflare. Photos uploaded through
the CMS land in `/photos/`.

Everything else (layout, styles, the Mailchimp form, social links) lives in
`index.njk`, `styles.css`, and `main.js` and is edited by hand.

Notes:

- **Past shows disappear automatically.** The build drops any show dated
  before the day it runs. The site rebuilds on every change and every Monday,
  so a finished show is gone within a week even if nobody publishes anything.
- **Show links and buttons:** if a show has a link, the whole row is
  clickable. The button on the right (e.g. "Tickets →") only appears when
  "Button text" is filled in.

## How deploys work

`.github/workflows/deploy.yml` runs on every push to `main` or `staging`
(and weekly). It builds with Eleventy and uploads `_site/` to the Cloudflare
Pages project `scrod-website` with Wrangler.

| Branch | Deploys to |
|---|---|
| `main` | Production: `scrodphunk.org` |
| `staging` | Preview: `staging.scrod-website.pages.dev` |

Workflow: try design or code changes on `staging`, check the staging URL,
then merge `staging` into `main`. Content edits in the CMS go straight to
`main` and are live a minute or two later.

The Action needs two repository secrets (Settings → Secrets and variables →
Actions): `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`. Without them
it skips the deploy without failing.

## Local development

Requires Node.js 22 or newer.

```bash
npm install
npm run dev     # serves at http://localhost:8080 with live reload
npm run build   # writes the site to _site/
```

Manual deploy, if you ever need one:

```bash
npx wrangler login
npm run build
npx wrangler pages deploy _site --project-name scrod-website --branch main
```

## One-time setup

1. **Cloudflare Pages project.** `npx wrangler pages project create
   scrod-website --production-branch main`. It must be in the same
   Cloudflare account as the `scrodphunk.org` zone.
2. **API token.** https://dash.cloudflare.com/profile/api-tokens → Create
   Token → Custom token → permission *Account → Cloudflare Pages → Edit*.
   Save it as the `CLOUDFLARE_API_TOKEN` secret, and your account ID
   (`npx wrangler whoami`) as `CLOUDFLARE_ACCOUNT_ID`.
3. **Custom domains.** Cloudflare dashboard → Workers & Pages →
   scrod-website → Custom domains → add `scrodphunk.org` and
   `www.scrodphunk.org`.
4. **Turn off GitHub Pages.** Repo Settings → Pages → Source: None. Then
   delete the `CNAME` file (GitHub Pages only).
5. **Staging.** Create a `staging` branch from `main`.
6. **CMS.** Sign in at https://app.pagescms.org with GitHub, install the
   Pages CMS app on `scrod-band/website`, open the repo, and edit on `main`.
   Each editor needs a GitHub account with write access to this repo.

## Later

- `logo.png` is 3.9 MB but displays small. Resizing it to about 512px wide
  would speed up the first page load.
