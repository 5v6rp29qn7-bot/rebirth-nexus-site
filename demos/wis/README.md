# Rebirth Nexus — WIS Guided Demo

## What This Is

A guided, click-by-click demo tailored for the **Warfighting Innovation Summit** application. It uses the flagship Nexus UI with an **interactive guided tour** that:

- Highlights exactly where to click
- Gates progress until the viewer completes each step
- Reinforces differentiators: **48hr early detection**, **$127M exposure quantification**, **cascade simulation**, **35:1 ROI mitigation**, and **data provenance**

## Scenario

**Contested Pacific Logistics** — Port interdiction threat at Subic Bay with cascading effects across Guam, Yokosuka, and allied facilities. All data is synthetic and unclassified.

## Deploy (Static Hosting)

This demo is **static only** — no API calls, no backend required.

1. Upload `index.html` and `demo-logic.js` to any static host (Netlify, Vercel, GitHub Pages, S3)
2. Done

### Netlify Quick Deploy
1. Create new site → drag and drop this folder
2. Deploy

### Vercel Quick Deploy
1. `vercel deploy` from this folder
2. Or import via GitHub

## Password Protection (Recommended)

To add password protection on Netlify:
1. Site Settings → Access Control → Password Protection
2. Set password (e.g., `nexus2025`)

## Demo Flow

1. **Welcome** — Introduces Nexus and 5 pillars
2. **Intel Feed** — Shows DIA/INDOPACOM threat feeds
3. **Map** — Esri-powered Pacific theater (user clicks Analytics tab)
4. **Analytics** — Exposure by asset (user clicks Map tab)
5. **Chat** — Conversational interface introduction
6. **Risk Query** — User clicks "What's our biggest risk?"
7. **Actions Query** — User clicks "What actions should we take?"
8. **Complete** — Summary + CTA

## Key Numbers (Locked)

- Total Exposure: $127M
- Nodes at Risk: 7
- Mitigation Cost: $3.35M
- Value Protected: $118M
- ROI: 35:1
- Decision Window: 48h

## Restart Tour

Click the **"ℹ️ Tour"** button in the chat header to restart.

## Application Demo Link Label

**"Guided Contested Logistics Demo (2 minutes) — Synthetic/Unclassified"**

## Contact

c@rebirthnexus.ai
