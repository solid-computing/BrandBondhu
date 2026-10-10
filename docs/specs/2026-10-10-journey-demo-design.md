# Journey demo: design

Agreed 2026-10-10. Builds on the seller demo from PR #6 and the deal flow from PR #7.

## Goal

Show investors and partners the whole BrandBondhu marketplace working end to end: how we get
creators, how we get sellers, how they meet, how the money is held and released, and what our
team does in the middle. It must be playable (real state, not click-through pictures) and work
both when the founder presents it and when an investor opens the link alone.

## Decisions

| Topic | Decision |
|---|---|
| Audience | Investors and partners |
| Medium | Playable web demo at `/demo/` (not Figma) |
| Outreach | Both: how we acquire each side, and how they meet inside the app |
| Supply at the start | Founder-led: our team finds influencers and messages them |
| Our team's side | Light console, 5 screens |
| Viewing | Guided "Play the journey" with captions, plus free clicking |
| Words | Everyday Bangladeshi Bangla, short, easy to read; plain English. "Influencer" wherever investors, sellers and our team look; "content creator" only on screens aimed at the influencers |

## The story (one deal: Dhaka Threads x Nusrat, ৳8,000)

Supply comes first, so a seller always finds checked creators waiting.

| # | Phase | Lane | Step |
|---|---|---|---|
| 1 | Bring in creators | Team | Find Nusrat, send an invite |
| 2 | | Creator | Gets the invite, joins (free) |
| 3 | | Creator | Connects her account, sets fee and wallet, sends for review |
| 4 | | Team | Checks followers, engagement, audience; marks Verified |
| 5 | Win a seller | Seller | Sadia sees our post in a sellers' group, asks for a free shortlist |
| 6 | | Team | Picks 5 verified fashion influencers in budget, sends them |
| 7 | | Seller | Shortlist arrives in chat; she picks Nusrat |
| 8 | Book and pay | Seller | Writes key points (not a script), sees the price |
| 9 | | Seller | Pays ৳9,380 (৳8,000 + 15% ৳1,200 + VAT ৳180); a licensed payment partner holds it |
| 10 | | Creator | Sees the offer with the money already in, accepts |
| 11 | Post and check | Creator | Shares a short plan with code NUSRAT10 |
| 12 | | Seller | Approves the plan (one change allowed) |
| 13 | | Creator | Mentions it in her own reel, submits proof (link, time, code) |
| 14 | | Seller | Checks the mention, confirms |
| 15 | Get paid | Team | 72 hours pass; ৳8,000 to Nusrat, ৳1,200 to us, ৳180 VAT |
| 16 | | Creator | Money in her wallet, rating up |
| 17 | | Seller | Reach, clicks, orders by code, cost per order; run again |

"What if it goes wrong?" branch, from the state after step 13:
W1 seller reports "no mention" (payout frozen), W2 team compares proof and post and refunds
(or resumes if the mention is there), W3 seller gets ৳9,380 back.

## Screens

- Seller (phone): group post with the free-shortlist form, chat with the shortlist, then the
  existing app (home, find, profile, brief and price, pay, campaign with results). Results get a
  "Run again" button.
- Creator (phone): invite chat, join and connect account (fee, formats, wallet), under review,
  home with offers and deals, offer (accept or decline), deal (plan, proof, countdown, paid),
  earnings.
- Team (laptop): requests (auto-matched 5, send), creator pipeline
  (Found, Messaged, Replied, Joined, Verified), verification queue with checks and red flags,
  money (paid in, held, paid out, our revenue, VAT, ledger), problems (complaint next to proof).
- Chat and feed screens are generic: no Facebook, WhatsApp, bKash or Nagad logos or colours.

## The player (`/demo/`)

- Desktop: flow diagram on the left (lanes Seller, Brandবন্ধু team, Influencer; steps flow down;
  done steps ticked, current step glows; arrows show handoffs), money meter on top, the app on
  the right in a phone frame (seller, creator) or laptop frame (team), caption bar at the bottom
  with Back, Play and Next.
- Next shows the right screen and highlights the button to tap; tapping it yourself works too.
  When a step is done the player moves to the next screen. Play auto-advances.
- Free mode: switch role any time; the diagram follows the deal's real state. Clicking a step
  jumps there (back or forward).
- Links to a step: `/demo/#/step/12`, `/demo/#/whatif/2`.
- Phones: the app fills the screen; the diagram is a pull-up sheet above the caption bar.
- Language: Bangla if the browser is Bangla, English otherwise; toggle always visible.

## How it is built

- No build step, no backend, as before.
- `demo/app.html` is the app (was `demo/index.html`). `app.js` keeps the core and seller views
  and exposes helpers on `window.BB`. New files register views: `outreach.js` (seller post and
  chat), `creator.js`, `team.js`. `journey.js` holds the steps: each has a lane, phase, words,
  the screen to show, the button to highlight, an action and a "done" test on the state.
- Two worlds in `localStorage`: `bb-demo-v3` (the standalone seller demo, unchanged story) and
  `bb-journey-v1` (the journey, starting before Nusrat or Sadia have joined). Jumping to a step
  rebuilds the journey world from its seed by replaying the earlier steps.
- `demo/index.html` + `player.js` + `player.css` is the player. It embeds
  `app.html?world=journey&embed=1` in an iframe (same origin) so the app keeps its real phone and
  desktop layouts, and talks to it through `window.BBAPP`.
- Money wording follows the site: a licensed payment partner holds the money, Brandবন্ধু never
  holds it; our fee is earned when a deal completes.

## Checks before shipping

Scripted browser run of all 17 steps and the what-if branch, in Bangla and English, at desktop
and 375px: no console errors, no NaN or undefined, no Bangla digits, no leftover Bangla in
English mode, no horizontal scroll; deep links and Back work; the standalone seller demo still
works.

## Not in scope

Commission-on-sales deals, several deals in the guided run, real sign-in, real payment branding.
