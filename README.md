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

Settings → Pages → Deploy from a branch → `main` / `(root)`. Every commit to `main` goes live in a minute or two.

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
