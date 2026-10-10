# BrandBondhu landing page

Static site, no build step. English at `/`, Bangla at `/bn/`.
Live (preview): https://solid-computing.github.io/BrandBondhu/

```
index.html        English landing page
bn/index.html     Bangla landing page
assets/           photos (Pexels licence) and favicon
_headers          used only if hosted on Cloudflare Pages (GitHub Pages ignores it)
```

All links are relative, so the site works on GitHub Pages, Cloudflare Pages or a custom domain.

## Publishing (GitHub Pages)

Every push to `main` runs `.github/workflows/pages.yml`, which copies the site files (`index.html`, `bn/`, `demo/`,
`assets/`) to the `gh-pages` branch that Pages serves. It goes live in a minute or two.

## Before going public

1. **WhatsApp number.** `8801712345678` is a sample. Find and replace it in both `index.html` files
   (creator links, floating button, and `data-wa` on the shortlist form).
2. **Example content.** The creators (Nusrat, Rafi, Tasnim, Arif), the Dhaka Threads case study, the
   testimonial and the deal card in the hero are invented. Replace with real, consented creators or remove.
3. **Promises.** Confirm the client can deliver "escrow", VAT invoices and card payments on day one
   (escrow may need a licence in Bangladesh). Consider showing only the managed pricing plan at first.
4. **Policy pages.** Add a privacy page (the form collects phone numbers) and a refund policy.
5. **Indexing.** Both pages carry `<meta name="robots" content="noindex">`. Remove that line at launch.
6. **Domain.** When the real domain is live, replace `https://solid-computing.github.io/BrandBondhu/`
   in the `og:url` and `og:image` tags of both pages, so WhatsApp and Facebook previews use it.

## How the shortlist form works

No backend. On submit it opens WhatsApp to the business number with the seller's page link,
category, budget and number pre-filled.

## Demo (`/demo/`)

Unlisted (`noindex`, not linked from the landing pages); share the URL directly. No build step, no backend:
everything is fictional and stays in the visitor's browser (`localStorage`).

**`/demo/` is the journey player**, made for investors and partners. It plays one deal end to end,
Dhaka Threads x Nusrat (৳8,000 + 15% fee + VAT = ৳9,380), across three sides:

- **Influencer** (phone): invite message, join, connect account, fee and wallet, under review, offer, plan,
  proof, payout, earnings.
- **Seller** (phone): our post in a sellers' group, free-shortlist form, shortlist in chat (no names), free sign-up
  with the Facebook page connected, our brand check, then one recommended match (score and reasons) to book in
  one tap, then the seller app
  (brief and price, pay, approve the plan, check the mention, results, run again).
- **Brandবন্ধু team** (laptop): shortlist requests, influencer pipeline, verification of brands and influencers,
  money, reported problems.

Left: the flow diagram (lanes Seller, team, Influencer; click any step to jump there) and a money meter.
Bottom: one-line captions with Back, Play and Next. Next shows the right screen and highlights the button;
tapping it yourself works too. "What if it goes wrong?" plays the problem, check and refund path.
Links to a step: `/demo/#/step/12`, `/demo/#/whatif/2`. Bangla if the browser is Bangla, else English.

**`/demo/app.html` is the standalone seller demo** (as before: three demo brands, fast-forward, reset), and its
Demo tools can now also show the influencer and team views.

```
demo/index.html, player.js, player.css   the journey player (embeds app.html?world=journey&embed=1)
demo/app.html, app.js                    app shell, core helpers and seller views
demo/outreach.js                         group post and shortlist chat (how sellers find us)
demo/creator.js, team.js                 influencer app and team console
demo/journey.js                          the 19 steps + what-if branch: screen, button, action, "done" test
demo/data.js                             fictional influencers, brands, prospects
```

- Two saved "worlds": `bb-demo-v3` (standalone) and `bb-journey-v1` (journey, starts before anyone has joined).
- Money wording follows the site: a licensed payment partner holds the money; our fee is earned when a deal ends.
- No refund goes out directly: cancellations, declined offers and problems after posting become cases our team
  checks first (team console, "Refunds" tab): both sides heard, a checklist that unlocks the decision, a proposal
  with the reason, and a second approval by finance before any money moves.
- Wording: "influencer" everywhere investors, sellers and our team look; Nusrat's own screens say
  "content creator" (as on the landing page's join buttons).
- Chat, feed and payment screens are neutral on purpose: no Facebook, WhatsApp, bKash or Nagad logos or colours.
- Run locally: `python -m http.server 8000`, then open http://localhost:8000/demo/
- Design notes: `docs/specs/2026-10-10-journey-demo-design.md`.
