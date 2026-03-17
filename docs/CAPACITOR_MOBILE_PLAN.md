# Capacitor Mobile App for NEC Admin

## Context

The `/admin/*` section (39 routes) is already mobile-responsive (sidebar → sheet pattern, 44px touch targets, responsive breakpoints). We want to wrap it in a native iOS/Android app using Capacitor so team members can download it from the app store, get push notifications, and access native features.

**Approach: Remote WebView** — Capacitor loads the live deployed URL (`https://joinnewearthcollective.com/admin`) in a native WebView container. This avoids any SSR/auth refactoring since cookies work natively in WKWebView/Android WebView. Web deploys update the app instantly without app store submissions.

## Phased Implementation

### Phase 1: Capacitor Project Setup

Create `mobile/` directory alongside the Next.js app:

```
mobile/
  capacitor.config.ts      # Points server.url to live admin URL
  package.json              # Capacitor CLI + plugins
  www/index.html            # Minimal boot shell (required by Capacitor)
  resources/                # Source icon/splash images (1024x1024)
  ios/                      # Generated — .gitignore'd
  android/                  # Generated — .gitignore'd
```

**capacitor.config.ts** — Key settings:

- `server.url`: `https://joinnewearthcollective.com/admin`
- `server.allowNavigation`: `['joinnewearthcollective.com', '*.supabase.co']`
- `ios.appendUserAgent` / `android.appendUserAgent`: `NEC-Native/1.0` (for native detection)
- Plugins: SplashScreen (#000 bg, #FACF39 spinner), StatusBar (dark style), Keyboard (body resize)

**Plugins to install:**
| Plugin | Purpose |
|--------|---------|
| `@capacitor/core` + `@capacitor/cli` | Core framework |
| `@capacitor/ios` + `@capacitor/android` | Platform support |
| `@capacitor/status-bar` | Dark status bar on black bg |
| `@capacitor/splash-screen` | NEC-branded launch screen |
| `@capacitor/network` | Offline detection |
| `@capacitor/app` | Deep link handling, lifecycle |
| `@capacitor/keyboard` | Keyboard scroll management |
| `@capacitor/haptics` | Tactile feedback |
| `@capacitor/push-notifications` | APNs + FCM (Phase 3) |

### Phase 2: Web App Modifications (Minimal)

These changes are harmless on the web (no-ops or zero-value CSS) but enable native features:

**New files:**
| File | Purpose |
|------|---------|
| `src/lib/native.ts` | `isNativeApp()` and `getNativePlatform()` — checks user-agent for `NEC-Native` |
| `src/components/admin/native-boot.tsx` | Client component: hides splash screen, sets status bar, handles deep links |
| `src/components/admin/native-offline.tsx` | Full-screen "No Connection" overlay with WifiOff icon + NEC branding |

**Modified files:**
| File | Change |
|------|--------|
| `src/app/layout.tsx` | Add `viewport-fit=cover` to viewport meta tag |
| `src/components/admin/admin-header.tsx` | Add `padding-top: env(safe-area-inset-top, 0px)` for iOS notch |
| `src/components/admin/admin-dashboard-layout.tsx` | Mount `<NativeBoot />` and `<NativeOfflineBanner />`, add safe-area bottom padding |
| `package.json` | Add Capacitor JS bridge packages (lightweight shims, no-op on web) |

**Safe area handling** — CSS `env(safe-area-inset-*)` values are `0px` in browsers but provide correct insets in native WebViews when `viewport-fit=cover` is set. No conditional logic needed.

**Native detection:**

```typescript
// src/lib/native.ts
export function isNativeApp(): boolean {
  if (typeof window === "undefined") return false;
  return navigator.userAgent.includes("NEC-Native");
}
```

### Phase 3: Push Notifications (v1.0)

**New files:**
| File | Purpose |
|------|---------|
| `src/components/admin/native-push-handler.tsx` | Requests permission, registers device token, handles notification taps |
| `src/server/api/routers/push-notifications.ts` | tRPC router for token registration |

**Schema addition** — `deviceTokens` table:

- `id`, `userId` (references userProfiles), `token` (unique), `platform` (ios/android), timestamps

**Backend** — Firebase Cloud Messaging (FCM) as unified provider for both iOS (via APNs) and Android.

### Phase 4: Deep Links / Universal Links

**New files in `public/.well-known/`:**
| File | Purpose |
|------|---------|
| `apple-app-site-association` | iOS: routes `/admin/*` and `/auth/callback*` to the native app |
| `assetlinks.json` | Android: same routing for app links |

**Vercel config** — Vercel strips the `.well-known` directory by default. Add to `vercel.json`:

```json
{
  "rewrites": [
    { "source": "/.well-known/:path*", "destination": "/.well-known/:path*" }
  ],
  "headers": [
    {
      "source": "/.well-known/apple-app-site-association",
      "headers": [{ "key": "Content-Type", "value": "application/json" }]
    }
  ]
}
```

**Auth callback handling** — When user taps a magic link or password reset email, the universal link opens the NEC app. The `@capacitor/app` `appUrlOpen` listener navigates the WebView to the callback URL. Supabase exchanges the code for a session cookie in the WebView.

### Phase 5: App Store Assets & Build

**App icon**: Based on `public/brand/symbol.png` — gold NEC symbol on #000 background. Use `@capacitor/assets` CLI to generate all sizes.

**Splash screen**: #000 background, gold NEC symbol centered, #FACF39 spinner. Auto-hidden after WebView loads.

**Apple Developer Account Setup** (prerequisite):

1. Enroll at [developer.apple.com](https://developer.apple.com/programs/) — $99/year
2. Create App ID: `com.newearthcollective.admin`
3. Enable capabilities: Push Notifications, Associated Domains
4. Create APNs key (for Firebase to send iOS push notifications)
5. Create provisioning profiles (development + distribution)

**iOS config** (Xcode):

- Bundle ID: `com.newearthcollective.admin`
- Minimum: iOS 16.0
- Capabilities: Push Notifications, Associated Domains
- Privacy manifest for network access

**Android config** (Android Studio):

- Package: `com.newearthcollective.admin`
- `google-services.json` for FCM
- Intent filters for deep links

**Build flow**: `cd mobile && npx cap sync && npx cap open ios` (or android)

## What Needs vs Doesn't Need App Store Updates

| App Store Update Needed       | Web Deploy Only         |
| ----------------------------- | ----------------------- |
| New Capacitor plugin          | Any UI/page changes     |
| Config changes (URL, plugins) | tRPC API changes        |
| Native code (Swift/Kotlin)    | Bug fixes, features     |
| Icon/splash changes           | Auth flow changes       |
| Deep link config              | Database schema changes |

## Verification

1. `npx tsc --noEmit` — web app still typechecks after modifications
2. `npx cap sync` in mobile/ — plugins sync without errors
3. iOS Simulator: app loads admin login, auth works, cookies persist across app restart
4. Android Emulator: same auth flow works
5. Offline: toggle airplane mode → "No Connection" screen appears → reconnect → app resumes
6. Safe areas: header doesn't overlap iOS notch/Dynamic Island
7. Splash screen: shows NEC branding, hides after page loads
8. Deep link: tap an `/admin/tasks` link in Messages → opens in NEC app (not Safari)

## Resolved Decisions

- **Apple Developer**: Not needed for development/testing (use Xcode free personal team signing). Only needed for App Store submission + APNs push. Enroll when ready to ship ($99/yr).
- **Push notifications**: Included in v1.0 — Firebase + schema + tRPC router
- **Hosting**: Vercel — `.well-known` files need rewrites in `vercel.json`
