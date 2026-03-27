# Quick Start: Pinterest Automation with Make (15-Minute Setup)

## TL;DR - Fastest Path

1. **Host your pin images** (5 min)
   - Upload PNGs from `generate-pins.html` to Cloudinary (free)
   - Get URLs (will look like: `https://res.cloudinary.com/.../pin.png`)

2. **Create Google Sheet** (3 min)
   - Open `pins-data-template.csv` in Google Sheets
   - Replace `https://YOUR-HOST/...` with your actual Cloudinary URLs
   - Get shareable CSV link (File → Share → Publish to web → CSV)

3. **Set up Make scenario** (5 min)
   - Create connection to Pinterest (OAuth)
   - Build scenario using modules below
   - Test with 1 pin
   - Run bulk upload

4. **Done!** All 50+ pins live on Pinterest.

---

## Detailed Steps

### 1. Prepare Images (5 min)

**Option A: Cloudinary (Recommended)**
1. Go to cloudinary.com, sign up (free)
2. Create a new "Upload Preset" (unsigned)
3. Upload all your PNGs from `generate-pins.html`
4. Copy each image's public URL
5. Replace placeholders in `pins-data-template.csv`

**Option B: GitHub Pages**
1. Create repo `foodfact-pins`
2. Upload PNGs
3. URLs: `https://YOUR-USERNAME.github.io/foodfact-pins/pin.png`

### 2. Prepare Data (3 min)

1. Open `pins-data-template.csv` in Google Sheets
2. Column B (image_url): Replace ALL with your real URLs
3. Optional: Customize descriptions
4. File → Share → Publish to web → Select "CSV" → Copy link

**Result:** You have a CSV URL like:
`https://docs.google.com/spreadsheets/d/e/.../pub?output=csv`

### 3. Build Make Scenario (5 min)

**A. Create Pinterest Connection**
- make.com → Connections → Add → Pinterest
- Log in via OAuth (use foodfactscanner@gmail.com)
- Name: `Pinterest - FoodFactScanner`

**B. Create Scenario**
1. "Create a new scenario" → Blank
2. Name: `Pinterest - Bulk Upload Pins`

**C. Add These 4 Modules:**

**Module 1: HTTP - Download CSV**
- HTTP → Make a request
- GET: Your Google Sheets CSV URL
- Response type: File

**Module 2: Tools - Parse CSV**
- Tools → Transform data
- Operation: Parse CSV
- CSV: `{{HTTP.body}}`
- Has headers: Yes

**Module 3: Tools - Iterator**
- Tools → Iterator
- Array: `{{Parse CSV}}`
- Batch size: 1

**Module 4: Pinterest - Create Pin**
- Pinterest → Create a pin
- Connection: `Pinterest - FoodFactScanner`
- Board: Select from dropdown (create boards first!)
- Image URL: `{{Iterator.image_url}}`
- Title: `{{Iterator.title}}`
- Description: `{{Iterator.description}}`
- Link: `https://foodfactscanner.com{{Iterator.link}}`
- Publish: Immediately

**D. Connect Modules**
Drag arrows:
- HTTP → Parse CSV
- Parse CSV → Iterator
- Iterator → Pinterest Create Pin

**E. Test**
1. Click "Run once"
2. Check Pinterest - 1 pin should appear
3. If error, check image URLs and board name

**F. Bulk Upload**
1. In Iterator module, change "Batch size" to "All items"
2. Click "Run once" again
3. All 50+ pins will upload (takes ~2-3 minutes)

---

## Boards to Create in Pinterest FIRST

Before running Make, create these 5 boards:

1. **Baby Food Safety**
2. **Prenatal Nutrition**
3. **Healthy Baby Recipes**
4. **Parenting Tips**
5. **Product Reviews**

In Pinterest:
- Profile → Boards → Create board → Name + Description → Create

---

## Optional: Auto-Schedule for Future Posts

To auto-post new blog articles:

1. Add another scenario: `Pinterest - Auto from RSS`
2. Modules:
   - **RSS Feed**: `https://foodfactscanner.com/blog/rss`
   - **Router**: Check which article → pick template
   - **Create Pin**: Pinterest

Runs every hour, posts new article pins automatically.

---

## Troubleshooting

**Error: "Invalid image URL"**
- Fix: Images must be publicly accessible. Check Cloudinary URLs work in incognito.

**Error: "Board not found"**
- Fix: Board name in Make must EXACTLY match Pinterest board name. Create board first.

**Error: "Rate limited"**
- Fix: Pinterest limits ~100 pins/day. We're posting 50, so fine. Don't run scenario multiple times.

**Pins not appearing?**
- Check Make execution log
- Check Pinterest account
- Pins may be "draft" - publish manually if needed

---

## Files Reference

| File | Purpose |
|------|---------|
| `MAKE-AUTOMATION-SETUP.md` | Full detailed guide |
| `pins-data-template.csv` | Data template - edit with your URLs |
| `pins-data-template.json` | Alternative JSON format |
| `generate-pins.html` | Pin image generator (already used) |
| `make-scenario-template.json` | Scenario structure reference |

---

## Complete in 3 Steps:

✅ **Step 1:** Upload images to Cloudinary → get URLs
✅ **Step 2:** Edit CSV with URLs → get Google Sheets CSV link
✅ **Step 3:** Build 4-module scenario in Make → Run

**Total time: 15 minutes**
**Cost: Free** (Make free tier + Cloudinary free)

**Everything is ready. Just follow the steps. Need help? Ask.**
