> 🚦 **Native Setup Source of Truth**
> Before any native feature work, open **`DESPIA_README.md`**, then open the **Despia sitemap**, pick the feature page, and use the **latest Lovable Prompt** from that page.

# Despia × Lovable — Project Configuration

## Status

- **Despia project:** Not yet configured
- **despia-native package:** Not yet installed
- **Apple Sign In:** Edge function created (needs Apple credentials)
- **Deep links:** Placeholder files created (needs Team ID, Bundle ID, Package Name, SHA256)

## Placeholder Values to Replace

| Placeholder | Where | How to Get |
|---|---|---|
| `YOUR_TEAM_ID` | AASA, Apple Edge Function | Apple Developer Account |
| `YOUR_BUNDLE_ID` | AASA | Despia Publishing Panel |
| `YOUR_PACKAGE_NAME` | assetlinks.json | Despia Publishing Panel |
| `YOUR_SHA256_FINGERPRINT` | assetlinks.json | Play Console → App Integrity |
| `APPLE_CLIENT_ID` | Edge Function secret | Apple Developer → Services ID |

## Documentation Sources (memory-proof)

- Primary sitemap: `<ADD-SITEMAP-URL>`
- Feature page(s) used most recently:
  - `<PASTE-URL-1>`
  - `<PASTE-URL-2>`

## Architecture Decisions

- **Apple Sign In:** Custom AppleJS inline + Lovable Cloud edge functions (no prebuilt provider paths)
- **Google Sign In:** Managed by Lovable Cloud
- **Entitlements:** Server-authoritative (webhook-driven, not client-trusted)
- **Deep links:** AASA + assetlinks.json hosted at `/.well-known/`

## Edge Functions

| Function | Purpose |
|---|---|
| `apple-auth` | Verifies Apple ID token, links/creates user, returns session |
