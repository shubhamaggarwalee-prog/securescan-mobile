# SecureScan — App Store & Play Store Submission Guide
# ════════════════════════════════════════════════════════
# Estimated time: 2–3 hours total
# Prerequisites: Apple Developer account + Google Play account
# ════════════════════════════════════════════════════════


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 1 — ONE-TIME SETUP (do this first, ~30 min)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 1A — Install EAS CLI

Open Terminal and run:

    npm install -g eas-cli
    eas login

Log in with your Expo account. If you don't have one:
→ https://expo.dev/signup (free)


## 1B — Link to your Expo project

    cd path/to/securescan-mobile
    eas init

This gives you your EAS Project ID. Copy it and paste it into app.json:
    "projectId": "PASTE-YOUR-ID-HERE"

Also paste your Expo username:
    "owner": "YOUR-EXPO-USERNAME"


## 1C — Fill in app.json placeholders

Open app.json and fill in these 4 values:

    "apiUrl":          "https://YOUR-RAILWAY-URL.up.railway.app"
    "supabaseUrl":     "https://YOUR-PROJECT.supabase.co"
    "supabaseAnonKey": "YOUR-SUPABASE-ANON-KEY"   ← the ANON key, not service_role
    "projectId":       "YOUR-EAS-PROJECT-ID"       ← from step 1B


## 1D — Fill in eas.json placeholders

Open eas.json and fill in:

    "appleId":     "your.email@icloud.com"         ← your Apple ID login
    "ascAppId":    "YOUR-APP-ID"                   ← get from App Store Connect (step 2B)
    "appleTeamId": "XXXXXXXXXX"                    ← 10-char code from developer.apple.com

For Android, you'll download a service account key in step 3B and save it
as play-store-key.json in the root of the mobile folder.


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 2 — APPLE APP STORE (~45 min)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 2A — Create app in App Store Connect

1. Go to https://appstoreconnect.apple.com
2. Click "My Apps" → "+" → "New App"
3. Fill in:
   - Platform: iOS
   - Name: SecureScan — Website Security
   - Primary language: English
   - Bundle ID: io.securescan.app
   - SKU: securescan-ios-001 (any unique string)
4. Click Create

## 2B — Get your App ID

After creating, look at the URL:
https://appstoreconnect.apple.com/apps/XXXXXXXXXX/...
                                          ↑
                              This number is your ascAppId
Copy it into eas.json


## 2C — App Store listing copy

Paste this into App Store Connect → App Information:

NAME:
SecureScan — Website Security

SUBTITLE (30 chars max):
Scan. Detect. Protect.

DESCRIPTION (4000 chars max):
SecureScan is a professional website security scanner that checks any URL
against 57 security modules — giving you a clear health score and actionable
fixes in minutes.

WHAT SECURESCAN CHECKS:
• SSL/TLS configuration and certificate validity
• Security headers (CSP, HSTS, X-Frame-Options)
• Common vulnerabilities: XSS, SQL injection, CSRF, SSRF
• Exposed sensitive files and directory listings
• DNS security and misconfigurations
• Cookie security and session management
• API security and authentication weaknesses
• And 50 more checks based on OWASP standards

WHO IT'S FOR:
→ Developers who want to harden their web apps before launch
→ Business owners who want to know if their site is safe
→ Security professionals who need a quick baseline scan
→ Agency teams who audit client websites regularly

HOW IT WORKS:
1. Enter any URL
2. SecureScan runs 57 automated security checks
3. You get a security score + prioritised list of findings
4. Each finding includes a plain-English explanation and exact fix

PLANS:
• Free: 5 scans/month, 1 site
• Pro ($29/month): 100 scans, 10 sites, PDF reports, AI summaries
• Team ($99/month): Unlimited scans, 50 sites, priority support

Your data is encrypted in transit and at rest. We never share scan results.

KEYWORDS (100 chars max):
security,scanner,website,vulnerability,OWASP,pentest,SSL,hacker,audit,protect

SUPPORT URL:
https://securescan.io/support

MARKETING URL:
https://securescan.io

PRIVACY POLICY URL:
https://securescan.io/privacy


## 2D — Screenshots needed

Apple requires screenshots for these sizes (use your simulator or real device):

  iPhone 6.9" (iPhone 15 Pro Max):  1320 × 2868 px  ← REQUIRED
  iPhone 6.5" (iPhone 14 Plus):     1284 × 2778 px  ← REQUIRED
  iPad Pro 13" (if tablet support):  2064 × 2752 px  ← optional

Take 3–5 screenshots showing:
  1. The scanner screen (entering a URL)
  2. A scan in progress (progress bar)
  3. Scan results (security score + findings list)
  4. A finding detail (with fix instructions)
  5. The dashboard / history

How to take screenshots:
  - Run app in Xcode simulator: Device → Screenshot (Cmd+S)
  - Or use a real device and AirDrop to Mac


## 2E — Content rating

In App Store Connect → App Information → Content Rights:
  Age Rating: 4+ (no objectionable content)
  
In the questionnaire, answer:
  - Unrestricted web access: YES (users can enter any URL)
  - All other categories: NO


## 2F — Build and submit to App Store

    # Build for App Store
    eas build --platform ios --profile production

    # EAS will ask for your Apple credentials — follow the prompts
    # Build takes 10-20 min in EAS cloud (no Xcode required on your machine)

    # When build completes, submit:
    eas submit --platform ios --profile production


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 3 — GOOGLE PLAY STORE (~45 min)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 3A — Create app in Play Console

1. Go to https://play.google.com/console
2. Click "Create app"
3. Fill in:
   - App name: SecureScan — Website Security
   - Default language: English (United States)
   - App or game: App
   - Free or paid: Free (with in-app purchases)
4. Accept policies → Create app


## 3B — Get service account key (for automated submission)

1. In Play Console → Setup → API access
2. Click "Link to a Google Cloud Project" (create one if needed)
3. Click "Create new service account"
4. Follow the Google Cloud Console link → Create service account
   - Name: securescan-deploy
   - Role: Service Account User
5. Create a JSON key → download it
6. Rename it: play-store-key.json
7. Put it in your mobile/ folder root
8. Add to .gitignore: play-store-key.json


## 3C — Play Store listing copy

In Play Console → Store presence → Main store listing:

APP NAME:
SecureScan — Website Security

SHORT DESCRIPTION (80 chars):
Scan any website for security vulnerabilities in minutes.

FULL DESCRIPTION (4000 chars):
[Use the same description from Step 2C above]

GRAPHIC ASSETS NEEDED:
  Hi-res icon:     512 × 512 px PNG (no alpha)
  Feature graphic: 1024 × 500 px PNG or JPEG
  Screenshots:     Minimum 2, at least 1080 × 1920 px (portrait)
                   Use the same screenshots from App Store (resize if needed)

See ICON_SPEC.md for exact design specifications.


## 3D — Content rating

In Play Console → Policy → App content → Content rating:
  Fill in the questionnaire:
  - Category: Utilities
  - Violence: No
  - Sexual content: No
  - Profanity: No
  - Controlled substance: No
  - User generated content: No
  This will give you a rating of "Everyone"


## 3E — Data safety section (REQUIRED since 2022)

In Play Console → Policy → App content → Data safety:

Data collected:
  ✅ Email address — collected, linked to user, required for account
  ✅ User IDs — collected, linked to user, required for app functionality
  
Data NOT collected:
  ❌ Location
  ❌ Photos/videos
  ❌ Contacts
  ❌ Financial info (Stripe handles this, not your app)

Data shared: No data shared with third parties
Data encrypted in transit: Yes
Users can request deletion: Yes (privacy@securescan.io)


## 3F — Build and submit to Play Store

    # Build AAB (Android App Bundle) for Play Store
    eas build --platform android --profile production

    # Build takes 10-15 min in EAS cloud

    # Submit to Play Store internal testing track first:
    eas submit --platform android --profile production

    # In Play Console, promote from Internal → Production when ready


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 4 — REVIEW TIMELINES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Apple App Store:    24–48 hours (first submission sometimes 1–3 days)
Google Play Store:  2–7 days for new apps, 1–3 days for updates

Common rejection reasons and fixes:

APPLE:
  "Guideline 2.1 - App Completeness"
  → Make sure all features work. Don't submit with placeholder content.

  "Guideline 5.1.1 - Data Collection and Storage"
  → Your privacy policy URL must be live before submission

  "Guideline 3.1.1 - In-App Purchase"
  → Stripe in-app subscriptions are fine on Android but Apple requires
    IAP for digital subscriptions sold in iOS apps. See note below.

GOOGLE:
  "Your app accesses sensitive permissions"
  → Camera and biometrics — just explain usage in the declaration

⚠️  IMPORTANT NOTE ON APPLE + STRIPE:
Apple requires that subscriptions for digital services sold in iOS apps
use Apple's In-App Purchase system (they take 15-30% cut).
You have two options:
  Option A: Use RevenueCat (already in your code! react-native-purchases)
            → This handles both Apple IAP and Google Play Billing
            → Set up at https://app.revenuecat.com (free up to $2.5k/mo revenue)
  Option B: Remove subscription purchase from iOS app, direct users to
            your website to subscribe (allowed by Apple guidelines)
The app.json already has RevenueCat API key fields ready to fill in.


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PART 5 — RECOMMENDED: TEST BEFORE FULL SUBMISSION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Before full store submission, test with real users via:

TestFlight (iOS):
    eas build --platform ios --profile preview
    # Upload to App Store Connect → TestFlight
    # Invite testers by email — they get a link to install

Play Internal Testing (Android):
    eas build --platform android --profile preview
    # Upload AAB to Play Console → Internal testing
    # Add tester emails

This lets you catch bugs before Apple/Google review.
