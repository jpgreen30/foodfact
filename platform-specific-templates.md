# Platform-Specific Content Templates

## Exact Text Formats per Platform

These templates are used in the Make scenario's Transform module. Copy exact formulas.

---

## Pinterest

**Title field (max 100 chars):**
```
{{router_new_items.item.title | slice: 0, 100}}
```

**Description field (max 500 chars):**
```
{{router_new_items.item.description | slice: 0, 400}}... Read more: https://foodfactscanner.com{{router_new_items.item.link}} #BabyFoodSafety #Parenting
```

**Board routing logic:**
- If link contains "heavy-metals" → "Baby Food Safety"
- If link contains "organic" → "Baby Food Safety"
- If link contains "recall" → "Product Alerts"
- If link contains "prenatal" OR "vitamin" → "Prenatal Nutrition"
- If link contains "brand" OR "ranking" → "Baby Food Brands"
- Default → "Parenting Tips"

**Image:** From CSV `pinterest_image` column (1000×1500 vertical PNG)

---

## Twitter/X

**Tweet text (max 280 chars):**
```
{{router_new_items.item.title}} {{router_new_items.item.description | slice: 0, 80}}... https://foodfactscanner.com{{router_new_items.item.link}} #BabyFoodSafety #Parenting
```

**Fallback (if above still > 280):**
```
{{router_new_items.item.title | slice: 0, 100}}... https://foodfactscanner.com{{router_new_items.item.link}} #BabyFoodSafety
```

**Image:** From CSV `twitter_image` (1200×675 landscape or 1024×1024 square PNG)

---

## Facebook

**Post message (no strict limit, but keep < 1000 chars):**
```
{{router_new_items.item.title}}

{{router_new_items.item.description}}

Read the full guide: https://foodfactscanner.com{{router_new_items.item.link}}
```

**Image:** From CSV `facebook_image` (1080×1080 square or 1200×630 landscape PNG)

**Link preview:** Automatically enabled when URL is in message

---

## Instagram

**Post message (max 2200 chars, but keep brief):**
Same as Facebook template.

**Image:** From CSV `instagram_image` (1080×1080 square or 1080×1350 vertical PNG)

**Caption:** Same as Facebook

**Important:** Instagram Business must be linked to Facebook Page. Make's Facebook Pages module auto-posts to IG if connected.

---

## TikTok

**Video:** From CSV `tiktok_video` (1080×1920 vertical MP4, 15-60 seconds)

**Description (max 2200 chars, but keep first line visible):**
```
{{router_new_items.item.title}} ↓ Tap link in bio for full guide!

#BabyFoodSafety #ParentingTips #HealthyBaby #FoodFacts
```

**No direct link in description** (TikTok blocks them). User clicks bio link.

**Sound:** Optional - can add trending audio in Make (advanced)

---

## Hashtag Sets (Rotate Daily)

Store in Make as array variables, pick randomly:

**Set 1:**
```
#BabyFoodSafety #Parenting #HealthyBaby
```

**Set 2:**
```
#BabyFood #ToxinFree #CleanEating
```

**Set 3:**
```
#ParentingTips #BabyHealth #FoodFacts
```

**Set 4:**
```
#SafetyFirst #MamaLife #BabyNutrition
```

In Make transformation: `{{randomItem(hash_tag_sets)}}`

---

## Character Limits Summary

| Platform | Text Limit | Image Specs | Video |
|----------|-------------|-------------|-------|
| Pinterest | Title: 100, Desc: 500 | 1000×1500 (2:3) PNG/JPG | No |
| Twitter | 280 chars | 1200×675 (16:9) or 1024×1024 | No |
| Facebook | ~1000 recommended | 1080×1080 (1:1) or 1200×630 | No |
| Instagram | 2200 max | 1080×1080 (1:1) or 1080×1350 (4:5) | Yes (60s) |
| TikTok | 2200 max (bio link only) | 1080×1920 (9:16) | MP4, 9:16, 15-60s |

---

## Content Adaptation Rules

### From RSS to Platform:

**RSS fields available:**
- `title` - full title
- `description` - full description
- `link` - relative URL (e.g., "/blog/complete-guide-heavy-metals-baby-food")
- `guid` - unique ID (for deduplication)
- `pubDate` - publication date

**Transformation logic:**
1. Title: Truncate to platform limit (100 for Pinterest, 100-200 for Twitter preview)
2. Description: Truncate + add "Read more..." + full URL
3. Link: Always prepend `https://foodfactscanner.com`
4. Hashtags: Add platform-appropriate set
5. Images: Use pre-hosted URLs from CSV lookup
6. TikTok: Convert image to MP4 via Cloudinary video generation

---

## Cloudinary Transformations for Different Sizes

Use these URL patterns for your images:

**Original (upload once):**
```
https://res.cloudinary.com/YOUR-NAME/image/upload/v1234567890/original-filename.png
```

**Pinterest (1000×1500 vertical):**
```
https://res.cloudinary.com/YOUR-NAME/image/upload/w_1000,h_1500,c_fill/v1234567890/original-filename.png
```

**Twitter (1200×675 landscape):**
```
https://res.cloudinary.com/YOUR-NAME/image/upload/w_1200,h_675,c_fill/v1234567890/original-filename.png
```

**Twitter Square (1024×1024):**
```
https://res.cloudinary.com/YOUR-NAME/image/upload/w_1024,h_1024,c_fill/v1234567890/original-filename.png
```

**Facebook/Instagram Feed (1080×1080 square):**
```
https://res.cloudinary.com/YOUR-NAME/image/upload/w_1080,h_1080,c_fill/v1234567890/original-filename.png
```

**Instagram Stories/Reels/TikTok (1080×1920 vertical):**
```
https://res.cloudinary.com/YOUR-NAME/image/upload/w_1080,h_1920,c_fill/v1234567890/original-filename.png
```

**TikTok Video from Image (15s zoom effect):**
```
https://res.cloudinary.com/YOUR-NAME/image/upload/w_1080,h_1920,eo_20,dur_15,sp_10/v1234567890/original-filename.png
```

Transformations:
- `w_` = width
- `h_` = height
- `c_fill` = crop to fill (no distortion)
- `eo_20` = ease out over 20%
- `dur_15` = 15 second duration
- `sp_10` = 10 second pause before zoom

---

## Template Replacement Strategy

In Make's Transform module, use these variable assignments:

```json
{
  "article_title": "{{router_new_items.item.title}}",
  "article_description": "{{router_new_items.item.description}}",
  "article_url": "https://foodfactscanner.com{{router_new_items.item.link}}",
  "article_guid": "{{router_new_items.item.guid}}",
  "pinterest_title": "{{router_new_items.item.title | slice: 0, 100}}",
  "pinterest_desc": "{{router_new_items.item.description | slice: 0, 400}}... Read more: https://foodfactscanner.com{{router_new_items.item.link}} #BabyFoodSafety #Parenting",
  "twitter_text": "{{router_new_items.item.title}} {{router_new_items.item.description | slice: 0, 80}}... https://foodfactscanner.com{{router_new_items.item.link}} #BabyFoodSafety #Parenting",
  "twitter_text_short": "{{router_new_items.item.title | slice: 0, 100}}... https://foodfactscanner.com{{router_new_items.item.link}} #BabyFoodSafety",
  "facebook_message": "{{router_new_items.item.title}}\n\n{{router_new_items.item.description}}\n\nRead the full guide: https://foodfactscanner.com{{router_new_items.item.link}}",
  "tiktok_desc": "{{router_new_items.item.title}} ↓ Tap link in bio for full guide!\n\n#BabyFoodSafety #ParentingTips #HealthyBaby #FoodFacts"
}
```

---

## Handling Long Titles/Descriptions

Make's string functions:
- `slice: 0, N` - first N characters
- `length(variable)` - get length
- Ternary: `condition ? value_if_true : value_if_false`

Example for Twitter (280 chars total):
```
{% set title_max = 100 %}
{% set desc_max = 280 - title_max - 50 - 24 - hashtags_length %}
{{router_new_items.item.title | slice: 0, title_max}} {{router_new_items.item.description | slice: 0, desc_max}}... https://foodfactscanner.com{{router_new_items.item.link}} #BabyFoodSafety
```

Make now supports Jinja-like templating in most modules.

---

## Content Variations for Frequency

To avoid repeating the same format, create multiple template sets:

**Set A (Direct):** "Read our guide on X"
**Set B (Question):** "Did you know X? Learn more"
**Set C (Stat):** "95% of baby food contains X. Here's what to do"

Rotate by article count modulo 3:
```
{% set template_set = (article_count % 3) %}
```

---

## Final Output Examples

### Pinterest
- **Title:** 95% OF BABY FOOD CONTAINS TOXIC HEAVY METALS
- **Description:** Shocking new data reveals most commercial baby foods contain arsenic, lead, and cadmium. Learn which brands are safe and how to protect your child. Full parent's guide with actionable steps. Read the full guide on FoodFactScanner. Read more: https://foodfactscanner.com/blog/... #BabyFoodSafety #Parenting
- **Board:** Baby Food Safety

### Twitter
- **Text:** 95% OF BABY FOOD CONTAINS TOXIC HEAVY METALS Shocking data reveals dangerous levels in commercial products. Protect your child with our complete parent's guide... https://foodfactscanner.com/blog/... #BabyFoodSafety #Parenting
- **Image:** Horizontal graphic

### Facebook
- **Message:**
  ```
  95% OF BABY FOOD CONTAINS TOXIC HEAVY METALS

  Independent lab testing shows concerning levels of arsenic, lead, and cadmium in most commercial baby foods. Here's what every parent needs to know.

  Read the full guide: https://foodfactscanner.com/blog/...
  ```

### Instagram
Same as Facebook (auto-posted via Facebook Pages module)

### TikTok
- **Video:** 15-second MP4 with zoom effect on pin graphic
- **Description:**
  ```
  95% OF BABY FOOD CONTAINS TOXIC HEAVY METALS ↓ Tap link in bio for full guide!

  #BabyFoodSafety #ParentingTips #HealthyBaby #FoodFacts
  ```

---

All templates ready to copy into Make's Transform module directly.
