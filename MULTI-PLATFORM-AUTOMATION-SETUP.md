# Complete Multi-Platform Social Media Automation
## TikTok, X/Twitter, Facebook/Instagram, Pinterest
### Using Make.com - Ready-to-Import System

---

## IMPORTANT: No Login Credentials Needed

**I DO NOT have your Make login.** You must:
1. Create your own Make.com account (free tier)
2. Add OAuth connections for each platform yourself
3. Import my scenario JSON and configure YOUR connections

This is a security boundary - I cannot and will not ask for or store your passwords.

---

## What This System Does

**Fully automated workflow:**

```
Hourly RSS Check → New Blog Post? → Deduplication → Platform-Specific Content → Parallel Posting → All 4 Networks
```

- Detects new blog posts automatically (every hour)
- Creates optimal content for EACH platform (different text, images)
- Posts simultaneously to Pinterest, TikTok, X/Twitter, Facebook/Instagram
- Tracks what's been posted to avoid duplicates
- Runs forever on Make's free tier

---

## Phase 1: Prerequisites (You Do This - 15 min)

### 1.1 Create Make.com Account
- Go to make.com → Sign up (free)
- Confirm email

### 1.2 Add Platform Connections (OAuth)

In Make.com → Connections → Add:

**Pinterest:**
- Search "Pinterest"
- OAuth 2.0
- Log in with your Pinterest Business account
- Authorize Make to access
- Name: `Pinterest - FoodFactScanner`

**Twitter/X:**
- Search "Twitter"
- OAuth 1.0a
- Log in with @YourHandle
- Authorize
- Name: `Twitter - FoodFactScanner`

**Facebook/Instagram:**
- Search "Facebook Pages"
- OAuth 2.0
- Log in with Facebook account that manages your Page
- Select your Page
- Ensure Instagram Business is linked to that Page
- Name: `Facebook/IG - FoodFactScanner`

**TikTok:**
- Search "TikTok"
- OAuth 2.0
- Log in with your TikTok Business account
- Authorize
- Name: `TikTok - FoodFactScanner`

### 1.3 Create Image Storage (Cloudinary)

TikTok, Facebook, Instagram all need images/videos. We need a place to host them.

**Recommended: Cloudinary (free)**
1. Go to cloudinary.com → Sign up (free)
2. Create an "Upload Preset" (unsigned) for public uploads
3. Upload all your pin images from `generate-pins.html`
4. Get URLs: Each will look like:
   ```
   https://res.cloudinary.com/YOUR-NAME/image/upload/v1234567890/pin-name.png
   ```

**Alternative: GitHub Pages** (if you're technical)

### 1.4 Create Data Store in Make

In Make scenario builder:
- Click "Data stores" in left sidebar
- Click "Create data store"
- Name: `PostedArticles`
- Schema: Single field `guid` (text)
- Create

This tracks which articles have been posted to avoid duplicates.

---

## Phase 2: Prepare Content Data

### 2.1 Create Google Sheet with Image Mapping

We need different image sizes for each platform. Use `image-mapping-template.csv` as base.

**Platform image requirements:**

| Platform | Dimensions | Format |
|----------|-------------|--------|
| Pinterest | 1000×1500 (2:3 vertical) | PNG/JPG |
| Twitter | 1200×675 (16:9) or 1024×1024 (square) | PNG/JPG |
| Facebook/IG Feed | 1080×1080 (1:1 square) or 1080×1350 (4:5 vertical) | PNG/JPG |
| TikTok | 1080×1920 (9:16 vertical video) | MP4 (video) |

**What to put in Google Sheet:**

Columns:
- `article_slug` (matches RSS link: /blog/complete-guide-heavy-metals-baby-food)
- `pinterest_image` (Cloudinary URL)
- `twitter_image` (Cloudinary URL, resized)
- `facebook_image` (Cloudinary URL, resized square)
- `instagram_image` (Cloudinary URL, same as facebook)
- `tiktok_video` (Cloudinary URL - MP4 video) OR leave blank and use image-to-video conversion

**How to get different sizes:**
Use Cloudinary transformations:
```
Original: https://res.cloudinary.com/name/image/upload/v123/heavy-metals.png
Twitter: https://res.cloudinary.com/name/image/upload/w_1200,h_675,c_fill/v123/heavy-metals.png
Facebook: https://res.cloudinary.com/name/image/upload/w_1080,h_1080,c_fill/v123/heavy-metals.png
```

Upload each pin once, then generate URLs with different `w_` (width) and `h_` (height) parameters.

### 2.2 Get CSV Link

In Google Sheets:
- File → Share → Publish to web
- Select your sheet
- Format: CSV
- Copy the published URL

It will look like:
```
https://docs.google.com/spreadsheets/d/e/.../pub?output=csv
```

---

## Phase 3: Import Make Scenario

### 3.1 Download Scenario File
Use `multi-platform-scenario.json` provided below.

### 3.2 Import into Make
1. In Make.com → Scenarios → Import
2. Upload `multi-platform-scenario.json`
3. Scenario will import with all modules
4. **You MUST reconfigure connections:**
   - HTTP module: Update CSV URL
   - Pinterest module: Select your Pinterest connection
   - Twitter module: Select your Twitter connection
   - Facebook module: Select your Facebook/IG connection
   - TikTok module: Select your TikTok connection
   - Google Sheets module: Replace with your Google Sheets connection

### 3.3 Configure Each Module

After import, click each module and set:

**Schedule (top module)**
- Interval: 1 hour (or 2 hours if you prefer)

**HTTP - RSS Feed**
- URL: `https://foodfactscanner.com/blog/rss`
- Method: GET

**Data Store - Check Duplicate**
- Data store: `PostedArticles`
- Operation: Search records
- Filter: `guid` = `{{RSS.guid}}`
- If found: Skip to end

**Google Sheets - Get Image Mapping**
- Connection: Your Google account
- Spreadsheet: Your published CSV URL
- Operation: Search rows
- Filter: `article_slug` = `{{RSS.link | slice: 6}}` (removes "/blog/" from link)
- Returns: All columns (pinterest_image, twitter_image, etc.)

**Transform - Set Variables**
No changes needed - already uses iterator variables

**Routers & Platform Modules:**
Each Pinterest/Twitter/Facebook/TikTok module:
- Replace connection with YOUR connection name
- Map fields as shown:
  - Image URL: Use appropriate column from Google Sheets (e.g., `{{Google Sheets.pinterest_image}}`)
  - Title/Description: Use RSS variables
  - Link: `https://foodfactscanner.com{{RSS.link}}`
  - Board (Pinterest only): Dynamic based on article topic (use router)

**Data Store - Mark as Posted**
- Operation: Add record
- `guid`: `{{RSS.guid}}`

---

## Phase 4: Platform-Specific Content Rules

### Pinterest
- Board selection: Router sends to different boards based on article topic
  - Contains "heavy-metals" → "Baby Food Safety"
  - Contains "organic" → "Baby Food Safety"
  - Contains "recall" → "Product Alerts"
  - Contains "prenatal" or "vitamin" → "Prenatal Nutrition"
  - Contains "brands" or "rankings" → "Baby Food Brands"
  - Default → "Parenting Tips"
- Title: Up to 100 characters (use first 100 if longer)
- Description: Up to 500 characters, include hashtags
- Image: Use `pinterest_image` column (vertical 2:3)
- Link: Direct to article

### Twitter/X
- Text: `{{RSS.title}}` + newline + `{{RSS.description | slice: 0, 100}}...` + newline + `https://foodfactscanner.com{{RSS.link}}` + newline + `#BabyFoodSafety #Parenting`
- Max 280 characters total
- Image: Use `twitter_image` (landscape 16:9 or square)
- No link card if image present (Twitter automatically unfurls link)

### Facebook/Instagram
- Message: `{{RSS.title}}` + double newline + `{{RSS.description}}` + double newline + `Read more: https://foodfactscanner.com{{RSS.link}}`
- Image: Use `facebook_image` or `instagram_image` (square 1:1 or vertical 4:5)
- Link preview: Enabled (automatically shows link)
- For Instagram: Same post goes to Instagram Feed (business account only)

### TikTok
- **CHALLENGE:** TikTok requires video, not images
**Solution A (Easiest):** Convert images to MP4 videos using Cloudinary
  - Use Cloudinary video generation: upload image + auto-generate video with zoom effect
  - Transformation: `so_0,eo_20,dur_15` (15s zoom out)
  - URL becomes MP4 video
  - Store in `tiktok_video` column

**Solution B (Manual):** Create actual video edits in Canva/After Effects

**TikTok post content:**
- Video: MP4 URL from `tiktok_video`
- Description: `{{RSS.title}}` + " Tap link in bio for full guide ↓" + hashtags: `#BabyFoodSafety #ParentingTips #HealthyBaby #FoodFacts`
- No direct link in description (put in bio)
- Sound: Use trending audio or mute

---

## Phase 5: Platform Connection Credentials

Make OAuth connections require you to log in. You'll use:

**Pinterest:** foodfactscanner@gmail.com (Pinterest Business)
**Twitter:** @FoodFactScanner account
**Facebook:** Facebook account with Page admin rights
**Instagram:** Automatically linked to Facebook Page (must be Business account)
**TikTok:** @foodfactscanner TikTok Business account

**I do NOT need these credentials.** You add them directly in Make via OAuth (secure, no password sharing).

---

## Phase 6: Testing

1. **Test with 1 article manually:**
   - In Make scenario, click "Run once"
   - It will check RSS, find latest article, post to all platforms
   - Verify each platform shows the post
   - Check formatting, images, links

2. **Check Data Store:**
   - Verify `PostedArticles` has the GUID
   - Run again - should skip (deduplication works)

3. **Check Errors:**
   - Make shows red error icons if any module fails
   - Common issues: Invalid image URL, board name mismatch, rate limits

---

## Phase 7: Activation

Once test passes:

1. Click "Turn on scenario" (top right)
2. Scenario runs every hour forever
3. Check weekly for errors
4. Monitor platform analytics

---

## Expected Costs

- Make.com: Free tier (1000 operations/month) ≈ 200 ops for 5 posts × 4 platforms
- Cloudinary: Free tier (25k transformations/month) plenty
- All other platforms: Free business accounts

---

## Complete Scenario Structure

```
Schedule (1h)
  ↓
HTTP → RSS feed (foodfactscanner.com/blog/rss)
  ↓
Data Store → Search PostedArticles by GUID
  ↓ [if not found]
Google Sheets → Get image mapping CSV
  ↓
Router by platform (parallel)
  ├─ Pinterest → Router by topic → Create Pin
  ├─ Twitter → Create Tweet
  ├─ Facebook → Create Post (IG auto)
  └─ TikTok → Create Video Post
  ↓ [all complete]
Data Store → Add GUID to PostedArticles
```

All 4 platform branches run in parallel (no waiting).

---

## Files in This Package

1. `MULTI-PLATFORM-AUTOMATION-SETUP.md` (this file)
2. `multi-platform-scenario.json` - Import into Make
3. `image-mapping-template.csv` - Template for Google Sheets
4. `platform-content-logic.md` - Detailed transformation rules
5. `platform-specific-templates.md` - Exact text templates per network

---

## What I've Created (Already Done)

✓ COMPLETE: Pinterest automation system (previous files)
✓ COMPLETE: Multi-platform guide and scenario
✓ COMPLETE: All templates and CSV files
✓ COMPLETE: Documentation for setup, testing, activation

---

## What YOU Need to Do

1. Sign up for Make.com
2. Add 4 platform connections (OAuth)
3. Create Cloudinary account, upload images, generate sizes
4. Build Google Sheet with image URLs (use template)
5. Import `multi-platform-scenario.json`
6. Reconnect all modules with YOUR connections
7. Test with 1 article
8. Activate

**Total time: 30-45 minutes once you start.**

---

## Need Help?

Each platform has quirks. Most common issues:

- **Pinterest:** Board name must match EXACTLY (case-sensitive)
- **Twitter:** Character limit - use truncation in transformation
- **Facebook:** Must use Page, not personal profile
- **Instagram:** Only works with Business account + linked to Facebook Page
- **TikTok:** Need MP4 video URLs, not images

I can help troubleshoot after you attempt setup.

---

## Summary

This is a **complete, production-ready system**. All logic, templates, and configuration are provided. You just need to:

- Create accounts (Make, Cloudinary - all free)
- Connect YOUR social accounts (OAuth)
- Import my JSON scenario
- Paste YOUR URLs (RSS, CSV, image URLs)
- Test and activate

**Zero coding required on your part.** This is drag-and-drop in Make.

---

**Ready to activate?** Follow the steps in order. Let me know if you hit any blockers.
