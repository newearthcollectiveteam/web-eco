# Email Template Brand Updates

## Summary

Updated the email template (`emails/test-email.tsx`) to properly use New Earth Collective brand assets and follow email best practices.

## Changes Made

### 1. **Brand Logo Integration**

- **Before**: Generic symbol (✦) in a styled div
- **After**: Actual New Earth Collective logo
  - Using PNG format (`symbol.png`) for maximum email client compatibility
  - Absolute URL: `https://joinnewearthcollective.com/brand/symbol.png`
  - Size: 80x80px with proper alt text

### 2. **Brand Fonts**

- **Airwaves Regular**: Used for main headings and wordmark
  - Loaded from: `https://joinnewearthcollective.com/fonts/Airwaves-Regular.otf`
  - Applied to: Header title, main headings (h1)

- **Bourton Bold**: Used for emphasis text and buttons
  - Loaded from: `https://joinnewearthcollective.com/fonts/bourtonlinebold.ttf`
  - Applied to: Subheadings, CTA buttons

- **Fallback fonts**: System fonts (Arial Black, Impact) ensure readability in all email clients

### 3. **Brand Colors**

- **Primary Golden**: `#FACF39` - Used for logo, headers, CTAs, links
- **Dark Background**: `#1a1a1a` - Header and footer backgrounds
- **Text Colors**: Maintained proper contrast for accessibility

### 4. **Typography Updates**

- Header title: Now uses Airwaves font with proper letter spacing (0.15em)
- Subheadings: Bourton font with uppercase styling and golden color
- CTA Buttons: Bourton font, uppercase, increased letter spacing for impact

### 5. **Email Compatibility**

#### Image Format Choice

- **PNG over SVG**: Email clients have poor SVG support
- Logo uses PNG for guaranteed rendering across all email clients
- Images served from production domain for reliability

#### Font Loading

- Custom fonts loaded via @font-face with proper fallbacks
- OTF/TTF formats used (available in `/public/fonts/`)
- Fallback to web-safe fonts ensures readability even if custom fonts fail

#### Links

All links verified and use production domain:

- Main CTA: `https://joinnewearthcollective.com`
- Footer links: Website, About, Contact pages
- All using HTTPS for security

## File Structure

```
/public/
  /brand/               # Main brand assets (for web use)
    symbol.png
    symbol.svg
    226701695_padded_logo.png
    /Logo Files/
      /png/             # Multiple logo variations
      /svg/             # SVG versions (web only)
  /fonts/               # Main fonts (for web use)
    Airwaves-Regular.otf
    bourtonlinebold.ttf
  /email-assets/        # ✅ Dedicated email assets (avoids route conflicts)
    logo.png            # ✅ Optimized for email use
    Airwaves-Regular.otf     # ✅ Brand wordmark font
    bourtonlinebold.ttf      # ✅ Brand slogan/emphasis font

/emails/
  test-email.tsx        # ✅ Updated with brand assets
```

**Note**: The `/email-assets/` folder was created to avoid conflicts with the `/brand` page route. This ensures email images and fonts are always accessible via static file serving.

## Best Practices Implemented

1. **Absolute URLs**: All assets use full `https://joinnewearthcollective.com` URLs
   - Works reliably in all email clients
   - No relative path issues

2. **Image Optimization**:
   - PNG format for logos (universal support)
   - Specified width/height attributes (prevents layout shift)
   - Alt text for accessibility

3. **Font Strategy**:
   - Custom fonts with strong fallbacks
   - Email-safe fallback fonts (Arial, Impact)
   - Readable even if custom fonts don't load

4. **Color Consistency**:
   - Brand colors (#FACF39, #1a1a1a) used throughout
   - Proper contrast ratios for accessibility
   - Consistent with web brand identity

## Testing Recommendations

1. **Preview Email**: Visit `/email-preview` to see rendered template
2. **API Preview**: Use `/api/email-preview?emailNumber=1&name=Test` for specific emails
3. **Email Client Testing**: Test in Gmail, Outlook, Apple Mail, mobile clients
4. **Asset Loading**: Verify logo and fonts load from production URLs

## Future Enhancements

1. **Font Conversion**: Convert OTF/TTF to WOFF2 for better web performance
2. **CDN**: Consider using CDN for faster asset loading
3. **Responsive Images**: Add retina display support (2x images)
4. **Dark Mode**: Add email client dark mode support

## Environment Variables

Email templates use production URLs regardless of environment:

- Logo: `https://joinnewearthcollective.com/email-assets/logo.png`
- Fonts: `https://joinnewearthcollective.com/email-assets/*`
- Links: `https://joinnewearthcollective.com/*`

This ensures emails sent from development/staging environments still load assets correctly.

## Important Deployment Notes

### Email Assets Path

The `/email-assets/` folder was created specifically to avoid conflicts with the `/brand` Next.js route. The `/brand` route serves a dynamic page, which would prevent static assets from being accessible at `/brand/symbol.png`.

**Solution**: All email-specific assets are stored in `/public/email-assets/` which:

1. Has no route conflicts
2. Is served as static files by Next.js/Vercel
3. Is accessible at `https://domain.com/email-assets/*`

### Vercel Deployment

When deployed to Vercel:

1. Files in `/public/` are automatically served as static assets
2. The `/email-assets/` path will be accessible
3. No additional configuration needed

### Testing Asset Availability

After deployment, verify assets are accessible:

```bash
# Test logo
curl -I https://joinnewearthcollective.com/email-assets/logo.png

# Test fonts
curl -I https://joinnewearthcollective.com/email-assets/Airwaves-Regular.otf
curl -I https://joinnewearthcollective.com/email-assets/bourtonlinebold.ttf
```

All should return `200 OK` with appropriate content-types:

- PNG: `image/png`
- OTF: `font/otf` or `application/x-font-otf`
- TTF: `font/ttf` or `application/x-font-ttf`
