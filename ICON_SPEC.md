# SecureScan — Icon & Screenshot Specifications
# ════════════════════════════════════════════════════════
# Brand colours: #0077cc (blue) / #f0f4f8 (background) / #1a1a2e (dark)
# ════════════════════════════════════════════════════════


## APP ICON DESIGN BRIEF

The icon should communicate: security + scanning + trust

Recommended design:
  - Dark navy background (#1a1a2e) or deep blue gradient
  - A shield shape in the centre
  - A subtle scan line or checkmark inside the shield
  - Clean, minimal — no text in the icon

Tools to create it (free):
  - Figma (figma.com) — free, drag and drop
  - Canva (canva.com) — free templates
  - Adobe Express — free tier available

Or hire someone on Fiverr for ~$20 for a professional icon.


## FILES YOU NEED TO CREATE

Place these in: mobile/assets/

┌──────────────────────────────┬────────────────────┬──────────────────────────────┐
│ FILE                         │ SIZE               │ USED FOR                     │
├──────────────────────────────┼────────────────────┼──────────────────────────────┤
│ icon.png                     │ 1024 × 1024 px     │ iOS App Store + base icon    │
│ adaptive-icon.png            │ 1024 × 1024 px     │ Android adaptive icon (fg)   │
│ splash.png                   │ 1284 × 2778 px     │ Splash screen (any device)   │
│ notification-icon.png        │ 96 × 96 px         │ Android notification icon    │
│ favicon.png                  │ 48 × 48 px         │ Web favicon                  │
└──────────────────────────────┴────────────────────┴──────────────────────────────┘

IMPORTANT for adaptive-icon.png:
  - The actual icon content should be centred in the middle 50% of the image
  - Leave 25% padding on all sides (Android crops it as a circle or squircle)
  - Background colour is set in app.json: "#f0f4f8"

IMPORTANT for splash.png:
  - Logo/content centred, works on all screen sizes
  - Background colour matches app.json splash backgroundColor: "#f0f4f8"
  - Keep logo around 200-300px wide in the centre


## SCREENSHOT SPECIFICATIONS

### iOS Screenshots (required)

iPhone 6.9" Pro Max — 1320 × 2868 px
  Take 5 screenshots showing:
  1. Home / Scanner screen
  2. Active scan with progress
  3. Results screen with score
  4. Finding detail with fix
  5. History / dashboard

iPhone 6.5" — 1284 × 2778 px
  Same 5 screenshots at this size

How to get exact sizes:
  In Xcode: Window → Devices and Simulators
  Choose "iPhone 15 Pro Max" for 6.9"
  Choose "iPhone 14 Plus" for 6.5"
  Run your app → Simulator → File → Take Screenshot

### Android Screenshots (required, minimum 2)

Minimum size: 1080 × 1920 px (portrait)
Use an Android emulator in Android Studio, or a real Android device


## GOOGLE PLAY FEATURE GRAPHIC

Size: 1024 × 500 px
Format: PNG or JPEG

Design brief:
  - Full bleed design (fills the whole rectangle)
  - App name "SecureScan" in large text
  - Tagline: "Scan. Detect. Protect."
  - Screenshot or mockup of the app on the right side
  - Dark navy or blue gradient background
  - NO simulated device frames (Google rejects those)


## QUICK OPTION — AI-GENERATED ICONS

You can use these prompts with Midjourney, DALL-E, or Adobe Firefly:

Icon prompt:
"App icon design, minimalist shield with a scanning line, dark navy blue 
background #1a1a2e, white and cyan accent, flat design, no text, 
1024x1024, iOS app icon style"

Feature graphic prompt:
"App store feature graphic 1024x500, dark navy background, large white text 
'SecureScan', subtitle 'Scan. Detect. Protect.', security shield logo on left, 
phone mockup on right showing security scan interface, professional tech aesthetic"
