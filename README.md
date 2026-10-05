# BrandBondhu landing page

Static site: English at `/`, Bangla at `/bn/`. No build step.

```
index.html        English landing page
bn/index.html     Bangla landing page
assets/           photos (Pexels licence) and favicon
_headers          Cloudflare Pages caching and security headers
```

## Push to GitHub

```bash
cd brandbondhu-site
git init -b main
git add .
git commit -m "BrandBondhu landing page (EN + BN)"
gh repo create brandbondhu-site --private --source=. --push
```

## Deploy on GitHub Pages (quick demo)

`.github/workflows/pages.yml` publishes `index.html`, `bn/` and `assets/` on every push to `main`.
All internal links are relative, so the site works under `https://<user>.github.io/BrandBondhu/`.

One-time setup: Settings → Pages → Build and deployment → Source: **GitHub Actions**.
Pages on a private repo needs GitHub Pro (or make the repo public). Re-run any time from
Actions → Deploy to GitHub Pages → Run workflow.

## Deploy on Cloudflare Pages

Cloudflare dashboard → Workers & Pages → Create → Pages → Connect to Git → pick the repo.
Framework preset: None. Build command: (empty). Output directory: `/`.
Every push to `main` then deploys automatically. Add the custom domain under the project's Custom domains tab.

## Before going public

1. **WhatsApp number.** `8801712345678` is a sample. Find and replace it in both `index.html` files
   (creator links, floating button, and the `data-wa` on the shortlist form).
2. **Example content.** The creators (Nusrat, Rafi, Tasnim, Arif), the Dhaka Threads case study and the
   testimonial are invented. Replace them with real, consented creators or remove them.
3. **Indexing.** Both pages carry `<meta name="robots" content="noindex">` so search engines skip them
   until step 2 is done. Remove that line at launch.
4. **hreflang.** Once the domain is set, change the two `hreflang` links in both pages to full URLs
   (e.g. `https://yourdomain.com/` and `https://yourdomain.com/bn/`).
5. Confirm pricing, and the "Log in" link (currently `#`).

## How the shortlist form works

No backend. On submit it opens WhatsApp to the business number with the seller's page link,
category, budget and number pre-filled. Swap for Formspree or a Cloudflare Pages Function later
if you want submissions in a sheet.
