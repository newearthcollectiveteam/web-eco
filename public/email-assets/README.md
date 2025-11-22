# Email Assets

This folder contains assets specifically for email templates.

## Why a Separate Folder?

The `/public/brand/` path conflicts with the `/brand` page route in Next.js, preventing static files from being served. This folder ensures email assets are always accessible via static file serving.

## Contents

- `logo.png` - Horizontal/stacked lockup if needed
- `symbol.png` - Core spiral symbol (PNG for general use)
- `symbol-email.png` - 96px optimized PNG that is Base64 inlined for the email header fallback
- `Airwaves-Regular.otf` - Brand wordmark font
- `bourtonlinebold.ttf` - Brand emphasis/slogan font

## Usage in Emails

Email templates reference these assets using absolute URLs:

```
https://joinnewearthcollective.com/email-assets/logo.png
https://joinnewearthcollective.com/email-assets/Airwaves-Regular.otf
https://joinnewearthcollective.com/email-assets/bourtonlinebold.ttf
```

You can override the base URL (for staging mirrors, asset CDNs, etc.) by setting `NEXT_PUBLIC_EMAIL_ASSET_BASE_URL`. When unset, templates fall back to the production domain listed above, ensuring previews and outbound emails always resolve to a working asset.

## Maintenance

Keep these assets in sync with `/public/brand/` and `/public/fonts/`:

- When brand assets are updated, update email-assets too
- Maintain the same file formats (PNG, OTF, TTF)
- Optimize images for email (web-optimized, reasonable file size)

## Testing

Test asset availability after deployment:

```bash
curl -I https://joinnewearthcollective.com/email-assets/logo.png
curl -I https://joinnewearthcollective.com/email-assets/Airwaves-Regular.otf
curl -I https://joinnewearthcollective.com/email-assets/bourtonlinebold.ttf
```
