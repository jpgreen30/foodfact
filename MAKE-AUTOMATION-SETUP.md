# Make/Integromat Pinterest Automation Setup

## Overview
Automatically post all our Pinterest pins to your Pinterest account on a schedule using Make.com.

---

## Prerequisites

1. **Make.com account** (free tier available, paid for more operations)
2. **Pinterest Business account** (you already created)
3. **50+ pin images** (we created these in `generate-pins.html` - download them)
4. **Blog RSS feed** (already exists at foodfactscanner.com/blog/rss)

---

## Step 1: Pinterest Connection in Make

1. Log into [make.com](https://make.com)
2. Click **"Connections"** in left sidebar
3. Click **"Add connection"**
4. Search for **Pinterest**
5. Click **"Add"**
6. You'll be prompted to:
   - Log into Pinterest (use foodfactscanner@gmail.com)
   - Authorize Make to access your account (OAuth - NO PASSWORD NEEDED)
7. Connection name: `Pinterest - FoodFactScanner`
8. Save

---

## Step 2: Create the Scenario

### Scenario Structure:

```
RSS Feed (Blog) → Scheduler → Transform → Create Pin (Pinterest)
```

**OR** for bulk upload of existing pins:

```
Schedule (Daily) → Iterator (over 50 pins) → Transform → Create Pin
```

---

## Step 3: Scenario 1 - Auto-Post New Blog Articles

### Recommended: This posts when you publish new blog content

**Setup:**

1. Click **"Create a new scenario"**
2. Name: `Pinterest - Auto-post new blog articles`

#### Module 1: RSS Feed Trigger
- **Tool**: "HTTP" → "Watch RSS feed"
- **Configuration**:
  - RSS URL: `https://foodfactscanner.com/blog/rss`
  - Check every: 1 hour
  - Items to fetch: 1 (only new posts)

#### Module 2: Get Pin Template Data (Router)
- **Tool**: "Tools" → "Set variable"
- Create 5 variables (one for each article template):
  ```
  template_heavy_metals = {title: "...", description: "...", image: "path/to/heavy-metals.png", link: "/blog/complete-guide-heavy-metals-baby-food", board: "Baby Food Safety"}
  template_organic = {title: "...", ...}
  template_recalls = {...}
  template_prenatal = {...}
  template_brands = {...}
  ```

#### Module 3: Determine Which Template
- **Tool**: "Flow Control" → "Router"
- **Condition**: Check blog post URL/slug
  - If contains "heavy-metals" → use template_heavy_metals
  - If contains "organic" → use template_organic
  - etc.

#### Module 4: Create Pinterest Pin
- **Tool**: "Pinterest" → "Create a pin"
- **Connection**: Select your Pinterest connection
- **Configuration**:
  - Board: Select appropriate board (or create variable)
  - Image: From template variable (file path or URL)
  - Title: From template variable
  - Description: From template variable + blog URL
  - Link: `https://foodfactscanner.com` + template.link
  - Publish: Immediately (or schedule)

---

## Step 4: Scenario 2 - Bulk Upload All Pins (One-time)

### Use this to upload all 50+ pins at once

**Setup:**

1. Create new scenario: `Pinterest - Bulk upload all pins`
2. Use Google Sheets as data source:

#### Module 1: Google Sheets
- Connect your Google account
- Spreadsheet: Create a sheet with columns:
  ```
  title | description | image_url | link | board
  ```
- Fill with all 50+ pins (use data from PINTEREST-PIN-TEMPLATES.md)
- **Tool**: "Google Sheets" → "Search rows"

#### Module 2: Iterator
- **Tool**: "Tools" → "Iterator"
- Iterate over each row from Google Sheets

#### Module 3: Create Pin
- **Tool**: "Pinterest" → "Create a pin"
- Map fields from iterator:
  - Board: `{{iterator.row.board}}`
  - Image: `{{iterator.row.image_url}}` (must be public URL)
  - Title: `{{iterator.row.title}}`
  - Description: `{{iterator.row.description}}`
  - Link: `https://foodfactscanner.com{{iterator.row.link}}`

---

## Step 5: Pin Data Structure

Create a JSON file or Google Sheet with this format:

```json
[
  {
    "title": "95% OF BABY FOOD CONTAINS TOXIC HEAVY METALS",
    "description": "Shocking data: 95% of commercial baby food contains arsenic, lead, cadmium. Learn which brands are safe and protect your child. Full parent's guide with actionable steps.",
    "image_url": "https://your-hosted-image.com/heavy-metals-pin.png",
    "link": "/blog/complete-guide-heavy-metals-baby-food",
    "board": "Baby Food Safety"
  },
  {
    "title": "ORGANIC BABY FOOD ISN'T ALWAYS SAFE",
    "description": "Organic doesn't mean toxin-free. Independent testing shows organic baby foods often contain the same heavy metals. Learn what labels actually mean.",
    "image_url": "https://your-hosted-image.com/organic-myth-pin.png",
    "link": "/blog/organic-baby-food-not-safe",
    "board": "Baby Food Safety"
  }
]
```

**Need 50+ entries - one for each pin variation**

---

## Step 6: Hosting Pin Images

Make requires public URLs for images. Options:

1. **Upload to cloud storage** (free):
   - Cloudinary.com (free tier)
   - Imgur.com (free)
   - GitHub Pages (free)
   - Vercel Blob Storage (free)

2. **Upload process:**
   - Take PNGs from `generate-pins.html` downloads
   - Upload to chosen service
   - Get public URLs
   - Put in Google Sheet/JSON

---

## Step 7: Pinterest Boards Setup

Create these boards in Pinterest BEFORE running scenario:

1. **Baby Food Safety** (main)
2. **Prenatal Nutrition**
3. **Healthy Baby Recipes**
4. **Parenting Tips**
5. **Product Reviews**

Board names must match exactly in Make scenario.

---

## Step 8: Schedule (Optional)

To auto-schedule pins (not post immediately):

1. Add module: "Schedule" → "Schedule once"
2. Or: "Schedule" → "Loop" for multiple times
3. Configure: Post at optimal times (2-4 PM, 8-10 PM daily)

---

## Step 9: Test Scenario

1. Click **"Run once"** to test
2. Check Pinterest account - pin should appear
3. Verify image, title, link all correct
4. Fix any errors in mapping

---

## Step 10: Activate

1. Click **"Turn on scenario"**
2. For RSS scenario: Runs automatically every hour
3. For bulk upload: Run once, then turn off

---

## Expected Limits

- **Make Free Tier**: 1000 operations/month
- Each pin upload = ~10 operations
- 50 pins = 500 operations
- You have room for other automations

---

## Complete Pin List Generator

I can also create the complete JSON with all 50+ pins once you:
1. Download all pin images
2. Upload them somewhere
3. Give me the image URLs

Then I'll generate the full dataset ready for Make import.

---

## Next Steps

1. Sign up for Make.com (free)
2. Create Pinterest connection
3. Create Google Sheet with pin data
4. Build scenario using modules above
5. Test with 1 pin
6. Bulk upload all pins
7. Activate RSS auto-post for future blog posts

**Total setup time:** ~30 minutes
**Cost:** Free (Make) + possibly cloud storage ($0-10/mo)

---

## Need Help?

I can create:
- Complete Make scenario export file (JSON)
- Google Sheet template with all 50+ pins pre-filled
- Step-by-step video walkthrough
- Python script to bulk upload via Make API

Just say the word!
