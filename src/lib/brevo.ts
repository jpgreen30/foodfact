import { AffiliateProduct, ChemicalFound, ScanResult, UserProfile } from './types'
import { AFFILIATE_PRODUCTS, getRecommendedProducts } from './affiliate-products'

// Brevo (Sendinblue) transactional email + contact management
// Env vars: BREVO_API_KEY, BREVO_LIST_ID_PRENATAL, BREVO_LIST_ID_POSTNATAL,
//           BREVO_SENDER_EMAIL, BREVO_SENDER_NAME

const BREVO_API_BASE = 'https://api.brevo.com/v3'

function brevoHeaders() {
  return {
    'api-key': process.env.BREVO_API_KEY ?? '',
    'Content-Type': 'application/json',
    Accept: 'application/json',
  }
}

// ─── Stage helpers ──────────────────────────────────────────────────────────

export function getPregnancyWeek(dueDate: string): number {
  const msPerWeek = 7 * 24 * 60 * 60 * 1000
  const weeksUntilDue = Math.ceil(
    (new Date(dueDate).getTime() - Date.now()) / msPerWeek
  )
  return Math.max(1, Math.min(40, 40 - weeksUntilDue))
}

export function getBabyAgeLabel(months: number): string {
  if (months < 1) return 'Newborn'
  if (months === 1) return '1 month old'
  if (months < 12) return `${months} months old`
  const years = Math.floor(months / 12)
  const rem = months % 12
  if (rem === 0) return `${years} year${years > 1 ? 's' : ''} old`
  return `${years}y ${rem}mo old`
}

function getTrimesterTips(week: number): string[] {
  if (week <= 12) {
    return [
      `Week ${week}: Your baby's neural tube is developing — make sure you're getting enough folate.`,
      'Avoid deli meats and unpasteurized cheeses. Stick to well-cooked proteins.',
    ]
  } else if (week <= 26) {
    return [
      `Week ${week}: Your baby can now hear your voice! Focus on DHA-rich foods for brain development.`,
      'Increase iron intake — lean meats, beans, and dark leafy greens are great sources.',
    ]
  } else {
    return [
      `Week ${week}: Third trimester! Baby is gaining weight rapidly — keep up calcium and vitamin D.`,
      'Limit high-mercury fish (tuna, swordfish). Salmon is a safe, omega-3-rich choice.',
    ]
  }
}

function getMonthMilestoneTips(months: number): string[] {
  if (months <= 3) {
    return [
      `Month ${months}: Focus on tummy time to strengthen neck and shoulder muscles.`,
      'Breast milk or formula is all your baby needs right now — no water or solids yet.',
    ]
  } else if (months <= 6) {
    return [
      `Month ${months}: Watch for readiness signs for solids — sitting with support, showing interest in food.`,
      'If introducing solids, start with single-ingredient purees and wait 3–5 days between new foods.',
    ]
  } else if (months <= 12) {
    return [
      `Month ${months}: Introduce a variety of textures and flavors to reduce picky eating later.`,
      'Avoid honey, cow\'s milk as main drink, and added sugar under 12 months.',
    ]
  } else {
    return [
      `Month ${months}: Toddler can now share most family meals — just watch salt and sugar content.`,
      'Scan everything — many toddler snacks contain hidden heavy metals and artificial dyes.',
    ]
  }
}

// ─── Contact management ─────────────────────────────────────────────────────

export interface BrevoContactAttributes {
  FIRSTNAME?: string
  MOM_STATUS?: string
  DUE_DATE?: string
  BABY_AGE_MONTHS?: number
  PLAN?: string
  BREASTFEEDING?: boolean
  SIGNUP_DATE?: string    // YYYY-MM-DD, used by cron email sequence
  LAST_SCAN_DATE?: string // YYYY-MM-DD, updated on every scan
  BABY_BIRTH_DATE?: string // YYYY-MM-DD, for milestone email triggers
}

export async function subscribeContact(
  email: string,
  name: string,
  attributes: BrevoContactAttributes,
  listIds: number[] = []
): Promise<void> {
  if (!process.env.BREVO_API_KEY) return

  // Determine lists — every user always goes on the general list, plus the
  // stage-specific list once momStatus is known
  const prenatalListId = parseInt(process.env.BREVO_LIST_ID_PRENATAL ?? '0')
  const postnatalListId = parseInt(process.env.BREVO_LIST_ID_POSTNATAL ?? '0')
  const generalListId = parseInt(process.env.BREVO_LIST_ID_GENERAL ?? '0')

  const resolvedLists = listIds.length > 0 ? listIds : [
    generalListId,
    attributes.MOM_STATUS === 'expecting' ? prenatalListId : postnatalListId,
  ].filter(Boolean)

  const [firstName, ...rest] = name.split(' ')
  const lastName = rest.join(' ') || ''

  await fetch(`${BREVO_API_BASE}/contacts`, {
    method: 'POST',
    headers: brevoHeaders(),
    body: JSON.stringify({
      email,
      attributes: { FIRSTNAME: firstName, LASTNAME: lastName, ...attributes },
      listIds: resolvedLists,
      updateEnabled: true,
    }),
  }).catch(console.error)
}

// ─── Transactional email ─────────────────────────────────────────────────────

export async function sendTransactionalEmail(
  toEmail: string,
  toName: string,
  subject: string,
  htmlContent: string
): Promise<void> {
  if (!process.env.BREVO_API_KEY) return

  const res = await fetch(`${BREVO_API_BASE}/smtp/email`, {
    method: 'POST',
    headers: brevoHeaders(),
    body: JSON.stringify({
      sender: {
        email: process.env.BREVO_SENDER_EMAIL ?? 'hello@foodfactscanner.com',
        name: process.env.BREVO_SENDER_NAME ?? 'FoodFactScanner',
      },
      to: [{ email: toEmail, name: toName }],
      subject,
      htmlContent,
    }),
  })

  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`Brevo ${res.status}: ${body}`)
  }
}

// ─── Email HTML builders ─────────────────────────────────────────────────────

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://foodfactscanner.com'

function emailWrapper(title: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#f0f4f0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f4f0;padding:32px 0;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 16px rgba(0,0,0,.10);">
<!-- Header -->
<tr><td style="background:linear-gradient(135deg,#166534 0%,#15803d 60%,#16a34a 100%);padding:28px 40px 24px;text-align:center;">
  <img src="${appUrl}/logo.svg" alt="FoodFactScanner" height="38" style="display:block;margin:0 auto 14px;max-width:200px;">
  <div style="display:inline-block;background:rgba(255,255,255,.15);border:1px solid rgba(255,255,255,.25);border-radius:20px;padding:4px 14px;">
    <p style="margin:0;color:rgba(255,255,255,.95);font-size:12px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;">${title}</p>
  </div>
</td></tr>
<!-- Body -->
<tr><td style="padding:40px;">
${body}
</td></tr>
<!-- Footer -->
<tr><td style="background:#f8faf8;padding:24px 40px;text-align:center;border-top:2px solid #e8f0e8;">
  <img src="${appUrl}/logo.svg" alt="FoodFactScanner" height="22" style="display:block;margin:0 auto 12px;opacity:0.5;">
  <p style="margin:0 0 8px;color:#6b7280;font-size:12px;font-weight:600;">Food safety for families</p>
  <p style="margin:0 0 12px;color:#9ca3af;font-size:12px;line-height:1.6;">
    <a href="${appUrl}" style="color:#16a34a;text-decoration:none;font-weight:600;">Open App</a>
    <span style="color:#d1d5db;margin:0 8px;">·</span>
    <a href="${appUrl}/unsubscribe" style="color:#9ca3af;text-decoration:none;">Unsubscribe</a>
  </p>
  <p style="margin:0;color:#c4c9c4;font-size:11px;line-height:1.6;font-style:italic;">
    As an Amazon Associate, FoodFactScanner earns from qualifying purchases.<br>
    Recommendations are based on safety ratings and your profile.
  </p>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`
}

function ctaButton(href: string, label: string, style: 'primary' | 'secondary' = 'primary'): string {
  if (style === 'secondary') {
    return `<a href="${href}" style="display:inline-block;background:#ffffff;color:#16a34a;font-size:14px;font-weight:700;text-decoration:none;padding:12px 28px;border-radius:10px;border:2px solid #16a34a;">${label}</a>`
  }
  return `<a href="${href}" style="display:inline-block;background:#16a34a;color:#ffffff;font-size:16px;font-weight:700;text-decoration:none;padding:14px 36px;border-radius:12px;letter-spacing:-0.2px;">${label}</a>`
}

function sectionLabel(text: string): string {
  return `<p style="margin:0 0 6px;color:#16a34a;font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;">${text}</p>`
}

function divider(): string {
  return `<div style="height:1px;background:linear-gradient(90deg,transparent,#e5e7eb,transparent);margin:32px 0;"></div>`
}

function affiliateProductsHtml(products: AffiliateProduct[]): string {
  const cards = products.slice(0, 3).map(p => `
<td width="33%" style="padding:6px;vertical-align:top;">
  <div style="background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;text-align:center;">
    <div style="position:relative;">
      <img src="${p.imageUrl}" alt="${p.title}" width="100%" style="height:130px;object-fit:cover;display:block;">
      ${p.badge ? `<div style="position:absolute;top:8px;left:8px;background:#16a34a;color:#fff;font-size:9px;font-weight:700;padding:3px 7px;border-radius:20px;letter-spacing:.03em;text-transform:uppercase;">${p.badge}</div>` : ''}
    </div>
    <div style="padding:12px 10px 14px;">
      <p style="margin:0 0 6px;font-size:11px;font-weight:700;color:#111827;line-height:1.4;">${p.title.slice(0, 52)}${p.title.length > 52 ? '…' : ''}</p>
      <p style="margin:0 0 10px;font-size:15px;font-weight:800;color:#16a34a;">${p.price}</p>
      <a href="${p.affiliateUrl}" style="display:inline-block;background:#ff9900;color:#000000;font-size:10px;font-weight:800;text-decoration:none;padding:6px 12px;border-radius:6px;letter-spacing:.02em;">View on Amazon</a>
    </div>
  </div>
</td>`).join('')

  return `<table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;"><tr>${cards}</tr></table>`
}

// ─── Welcome email ───────────────────────────────────────────────────────────

export function buildWelcomeEmail(name: string, momStatus?: string): string {
  const products = getRecommendedProducts(
    momStatus === 'expecting' ? ['heavy-metals'] : ['bpa'],
    momStatus ?? 'other'
  )

  const body = `
<!-- Hero -->
<div style="background:linear-gradient(135deg,#f0fdf4 0%,#dcfce7 100%);border-radius:14px;padding:32px 28px;margin:0 0 28px;text-align:center;border:1px solid #bbf7d0;">
  <p style="margin:0 0 10px;font-size:36px;">🛡️</p>
  ${sectionLabel("You're protected")}
  <h2 style="margin:0 0 10px;color:#111827;font-size:24px;font-weight:800;line-height:1.3;">Welcome to FoodFactScanner, ${name}!</h2>
  <p style="margin:0;color:#4b5563;font-size:15px;line-height:1.6;">Your family's food safety companion is ready. Here's how to get started:</p>
</div>

<!-- Feature rows -->
<table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
  <tr>
    <td style="padding:14px 16px;background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;margin-bottom:10px;">
      <table width="100%" cellpadding="0" cellspacing="0"><tr>
        <td width="44" style="vertical-align:top;padding-right:14px;">
          <div style="width:40px;height:40px;background:#dcfce7;border-radius:10px;text-align:center;line-height:40px;font-size:20px;">📷</div>
        </td>
        <td style="vertical-align:top;">
          <p style="margin:0 0 3px;color:#111827;font-size:14px;font-weight:700;">Scan any food label</p>
          <p style="margin:0;color:#6b7280;font-size:13px;line-height:1.5;">Point your camera at any ingredient list to instantly detect heavy metals, pesticides, and harmful additives.</p>
        </td>
      </tr></table>
    </td>
  </tr>
  <tr><td style="height:10px;"></td></tr>
  <tr>
    <td style="padding:14px 16px;background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;margin-bottom:10px;">
      <table width="100%" cellpadding="0" cellspacing="0"><tr>
        <td width="44" style="vertical-align:top;padding-right:14px;">
          <div style="width:40px;height:40px;background:#dcfce7;border-radius:10px;text-align:center;line-height:40px;font-size:20px;">🛡️</div>
        </td>
        <td style="vertical-align:top;">
          <p style="margin:0 0 3px;color:#111827;font-size:14px;font-weight:700;">Personalized safety alerts</p>
          <p style="margin:0;color:#6b7280;font-size:13px;line-height:1.5;">We flag risks specific to your stage — pregnancy, breastfeeding, or your baby's age.</p>
        </td>
      </tr></table>
    </td>
  </tr>
  <tr><td style="height:10px;"></td></tr>
  <tr>
    <td style="padding:14px 16px;background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;">
      <table width="100%" cellpadding="0" cellspacing="0"><tr>
        <td width="44" style="vertical-align:top;padding-right:14px;">
          <div style="width:40px;height:40px;background:#dcfce7;border-radius:10px;text-align:center;line-height:40px;font-size:20px;">📬</div>
        </td>
        <td style="vertical-align:top;">
          <p style="margin:0 0 3px;color:#111827;font-size:14px;font-weight:700;">Weekly safety newsletter</p>
          <p style="margin:0;color:#6b7280;font-size:13px;line-height:1.5;">FDA recall alerts and stage-based nutrition tips delivered every week.</p>
        </td>
      </tr></table>
    </td>
  </tr>
</table>

<div style="text-align:center;margin:0 0 8px;">
  ${ctaButton(`${appUrl}/dashboard`, 'Start Scanning Now →')}
</div>
<p style="text-align:center;margin:0 0 0;color:#9ca3af;font-size:12px;">You have 3 free scans — no credit card needed</p>

${divider()}

${sectionLabel('Safe picks for you')}
<h3 style="margin:0 0 16px;color:#111827;font-size:17px;font-weight:700;">Recommended Products for Your Family</h3>
${affiliateProductsHtml(products)}
`
  return emailWrapper('Welcome to FoodFactScanner!', body)
}

// ─── Scan result email ───────────────────────────────────────────────────────

export function buildScanResultEmail(
  name: string,
  scan: ScanResult,
  userProfile?: UserProfile
): string {
  const isSafe = scan.overallScore === 'safe'
  const isCaution = scan.overallScore === 'caution'
  const scoreBg = isSafe ? '#f0fdf4' : isCaution ? '#fffbeb' : '#fef2f2'
  const scoreBorder = isSafe ? '#bbf7d0' : isCaution ? '#fde68a' : '#fecaca'
  const scoreTextColor = isSafe ? '#166534' : isCaution ? '#92400e' : '#991b1b'
  const scoreLabel = isSafe ? '✅ SAFE' : isCaution ? '⚠️ CAUTION' : '🚨 DANGER'
  const scoreMessage = isSafe
    ? 'No harmful chemicals detected in this product.'
    : isCaution
    ? 'Some concerning ingredients found — review below.'
    : 'Harmful chemicals detected — consider a safer alternative.'

  const chemicalsHtml = scan.chemicals.length > 0 ? `
<table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">
  <tr style="background:#f9fafb;">
    <th style="text-align:left;padding:10px 14px;font-size:11px;color:#6b7280;font-weight:700;text-transform:uppercase;letter-spacing:.05em;border-bottom:1px solid #e5e7eb;">Ingredient</th>
    <th style="text-align:left;padding:10px 14px;font-size:11px;color:#6b7280;font-weight:700;text-transform:uppercase;letter-spacing:.05em;border-bottom:1px solid #e5e7eb;">Level</th>
    <th style="text-align:left;padding:10px 14px;font-size:11px;color:#6b7280;font-weight:700;text-transform:uppercase;letter-spacing:.05em;border-bottom:1px solid #e5e7eb;">Health Risk</th>
  </tr>
  ${scan.chemicals.map((c, i) => `
  <tr style="background:${i % 2 === 0 ? '#ffffff' : '#f9fafb'};">
    <td style="padding:11px 14px;font-size:13px;color:#111827;font-weight:600;border-bottom:1px solid #f3f4f6;">${c.name}</td>
    <td style="padding:11px 14px;border-bottom:1px solid #f3f4f6;">
      <span style="background:${c.level === 'high' ? '#fee2e2' : c.level === 'medium' ? '#fef3c7' : '#dcfce7'};color:${c.level === 'high' ? '#b91c1c' : c.level === 'medium' ? '#b45309' : '#15803d'};font-size:10px;font-weight:800;padding:3px 8px;border-radius:20px;letter-spacing:.03em;">${c.level.toUpperCase()}</span>
    </td>
    <td style="padding:11px 14px;font-size:12px;color:#6b7280;line-height:1.4;border-bottom:1px solid #f3f4f6;">${c.healthRisk}</td>
  </tr>`).join('')}
</table>` : ''

  const concerns = userProfile?.concerns ?? []
  const saferProducts = getRecommendedProducts(
    scan.overallScore !== 'safe'
      ? [...concerns, scan.chemicals.some(c => ['Arsenic', 'Lead', 'Cadmium', 'Mercury'].includes(c.name)) ? 'heavy-metals' : 'bpa']
      : concerns,
    userProfile?.momStatus ?? 'other'
  )

  const body = `
${sectionLabel('Your scan result')}
<h2 style="margin:0 0 20px;color:#111827;font-size:22px;font-weight:800;">Hi ${name}, here's what we found</h2>

<!-- Product card -->
<div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:14px;padding:18px 20px;margin:0 0 16px;">
  <table width="100%" cellpadding="0" cellspacing="0"><tr>
    <td style="vertical-align:middle;">
      <p style="margin:0 0 2px;color:#111827;font-size:16px;font-weight:700;">${scan.productName}</p>
      <p style="margin:0;color:#9ca3af;font-size:13px;">${scan.brand}</p>
    </td>
    <td style="vertical-align:middle;text-align:right;white-space:nowrap;">
      <span style="display:inline-block;background:${scoreBg};color:${scoreTextColor};border:1px solid ${scoreBorder};font-size:13px;font-weight:800;padding:6px 14px;border-radius:20px;">${scoreLabel}</span>
    </td>
  </tr></table>
</div>

<!-- Score summary -->
<div style="background:${scoreBg};border:1px solid ${scoreBorder};border-radius:12px;padding:14px 18px;margin:0 0 24px;">
  <p style="margin:0;color:${scoreTextColor};font-size:14px;font-weight:600;">${scoreMessage}</p>
</div>

${scan.chemicals.length > 0 ? `
${sectionLabel('Chemicals detected')}
<h3 style="margin:0 0 12px;color:#111827;font-size:15px;font-weight:700;">Ingredient Breakdown</h3>
${chemicalsHtml}` : ''}

${scan.overallScore !== 'safe' ? `
${divider()}
${sectionLabel('Safer alternatives')}
<h3 style="margin:0 0 16px;color:#111827;font-size:17px;font-weight:700;">We Recommend These Instead</h3>
${affiliateProductsHtml(saferProducts)}
` : ''}

${divider()}
<div style="text-align:center;">
  ${ctaButton(`${appUrl}/dashboard`, 'Scan Another Product →')}
</div>
`
  return emailWrapper(`Scan Result: ${scan.productName}`, body)
}

// ─── Weekly newsletter ───────────────────────────────────────────────────────

export interface RecallAlert {
  product: string
  brand: string
  reason: string
  date: string
  severity: 'urgent' | 'warning'
  affectedLots: string
}

export function buildNewsletterEmail(
  name: string,
  userProfile: UserProfile,
  recalls: RecallAlert[]
): string {
  let stageHeader = 'Your Weekly Food Safety Update'
  let stageEmoji = '🥦'
  let tips: string[] = ['Always scan food labels before feeding your baby.', 'Choose organic when possible for the dirty dozen produce.']

  if (userProfile.momStatus === 'expecting' && userProfile.dueDate) {
    const week = getPregnancyWeek(userProfile.dueDate)
    stageHeader = `Week ${week} of Your Pregnancy`
    stageEmoji = '🤰'
    tips = getTrimesterTips(week)
  } else if ((userProfile.momStatus === 'newborn' || userProfile.momStatus === 'toddler') && userProfile.babyAgeMonths !== undefined) {
    const ageLabel = getBabyAgeLabel(userProfile.babyAgeMonths)
    stageHeader = userProfile.babyName ? `${userProfile.babyName} is ${ageLabel}` : ageLabel
    stageEmoji = '👶'
    tips = getMonthMilestoneTips(userProfile.babyAgeMonths)
  }

  const urgentRecalls = recalls.filter(r => r.severity === 'urgent').slice(0, 2)
  const recallsHtml = urgentRecalls.length > 0 ? `
${divider()}
${sectionLabel('⚠️ Active alerts')}
<h3 style="margin:0 0 14px;color:#111827;font-size:17px;font-weight:700;">FDA Recall Alerts This Week</h3>
${urgentRecalls.map(r => `
<div style="background:#fef2f2;border:1px solid #fecaca;border-radius:12px;padding:16px 18px;margin:0 0 10px;">
  <table width="100%" cellpadding="0" cellspacing="0"><tr>
    <td style="vertical-align:middle;">
      <p style="margin:0 0 2px;color:#111827;font-size:14px;font-weight:700;">${r.product}</p>
      <p style="margin:0 0 4px;color:#9ca3af;font-size:12px;">by ${r.brand}</p>
      <p style="margin:0;color:#b91c1c;font-size:13px;font-weight:600;">${r.reason}</p>
    </td>
    <td style="vertical-align:middle;text-align:right;white-space:nowrap;padding-left:12px;">
      <span style="background:#fef2f2;color:#b91c1c;border:1px solid #fecaca;font-size:10px;font-weight:800;padding:3px 8px;border-radius:20px;">RECALL</span>
    </td>
  </tr></table>
  <p style="margin:8px 0 0;color:#6b7280;font-size:12px;">Affected lots: ${r.affectedLots}</p>
</div>`).join('')}
<p style="margin:8px 0 0;"><a href="${appUrl}/dashboard" style="color:#b91c1c;font-size:13px;font-weight:700;text-decoration:none;">View all recalls in app →</a></p>
` : ''

  const products = getRecommendedProducts(userProfile.concerns ?? [], userProfile.momStatus)

  const body = `
${sectionLabel('Weekly update')}
<h2 style="margin:0 0 20px;color:#111827;font-size:22px;font-weight:800;">Hi ${name}! 👋</h2>

<!-- Stage card -->
<div style="background:linear-gradient(135deg,#166534 0%,#15803d 100%);border-radius:14px;padding:24px 24px;margin:0 0 28px;">
  <p style="margin:0 0 6px;font-size:28px;">${stageEmoji}</p>
  <p style="margin:0 0 6px;color:rgba(255,255,255,.7);font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;">This week</p>
  <h3 style="margin:0 0 14px;color:#ffffff;font-size:18px;font-weight:800;">${stageHeader}</h3>
  ${tips.map(t => `
  <div style="background:rgba(255,255,255,.12);border-radius:8px;padding:10px 14px;margin:0 0 8px;">
    <p style="margin:0;color:rgba(255,255,255,.95);font-size:13px;line-height:1.5;">${t}</p>
  </div>`).join('')}
</div>

${recallsHtml}

${divider()}
${sectionLabel("This week's safe picks")}
<h3 style="margin:0 0 16px;color:#111827;font-size:17px;font-weight:700;">Recommended for Your Family</h3>
${affiliateProductsHtml(products)}

<div style="text-align:center;margin:24px 0 0;">
  ${ctaButton(`${appUrl}/dashboard?tab=shop`, 'Shop All Safe Products →')}
</div>
`
  return emailWrapper('Your Weekly Food Safety Update', body)
}

// ─── Recall alert email ──────────────────────────────────────────────────────

export function buildRecallAlertEmail(name: string, recall: RecallAlert): string {
  const saferProducts = AFFILIATE_PRODUCTS.filter(p =>
    p.category === 'organic-food' || p.category === 'testing-kits'
  ).slice(0, 3)

  const body = `
<!-- Alert banner -->
<div style="background:#fef2f2;border:2px solid #fecaca;border-radius:14px;padding:24px;margin:0 0 24px;text-align:center;">
  <p style="margin:0 0 8px;font-size:40px;">🚨</p>
  <p style="margin:0 0 4px;color:#b91c1c;font-size:11px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;">Action Required</p>
  <h2 style="margin:0;color:#991b1b;font-size:22px;font-weight:800;line-height:1.3;">Food Safety Recall Alert</h2>
</div>

<p style="margin:0 0 20px;color:#4b5563;font-size:15px;line-height:1.6;">Hi ${name}, a recent recall may affect products in your home. Please review the details below.</p>

<!-- Recall details -->
<div style="background:#ffffff;border:1px solid #e5e7eb;border-radius:14px;overflow:hidden;margin:0 0 24px;">
  <div style="background:#fef2f2;padding:14px 18px;border-bottom:1px solid #fecaca;">
    <p style="margin:0;color:#b91c1c;font-size:11px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;">Recalled Product</p>
  </div>
  <div style="padding:18px;">
    <h3 style="margin:0 0 4px;color:#111827;font-size:17px;font-weight:800;">${recall.product}</h3>
    <p style="margin:0 0 14px;color:#9ca3af;font-size:13px;">by ${recall.brand}</p>
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td width="100" style="padding:6px 0;vertical-align:top;"><p style="margin:0;color:#9ca3af;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:.04em;">Reason</p></td>
        <td style="padding:6px 0;vertical-align:top;"><p style="margin:0;color:#b91c1c;font-size:13px;font-weight:600;">${recall.reason}</p></td>
      </tr>
      <tr>
        <td style="padding:6px 0;vertical-align:top;"><p style="margin:0;color:#9ca3af;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:.04em;">Lots</p></td>
        <td style="padding:6px 0;vertical-align:top;"><p style="margin:0;color:#374151;font-size:13px;">${recall.affectedLots}</p></td>
      </tr>
    </table>
  </div>
</div>

<!-- What to do -->
<div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:18px;margin:0 0 28px;">
  <p style="margin:0 0 10px;color:#166534;font-size:13px;font-weight:800;text-transform:uppercase;letter-spacing:.04em;">What to do</p>
  <p style="margin:0 0 6px;color:#374151;font-size:14px;line-height:1.5;">✓ Check your pantry and fridge for this product</p>
  <p style="margin:0 0 6px;color:#374151;font-size:14px;line-height:1.5;">✓ Do not feed it to your baby — dispose safely</p>
  <p style="margin:0;color:#374151;font-size:14px;line-height:1.5;">✓ Return to place of purchase for a full refund</p>
</div>

${divider()}
${sectionLabel('Safer alternatives')}
<h3 style="margin:0 0 16px;color:#111827;font-size:17px;font-weight:700;">Products We Trust Instead</h3>
${affiliateProductsHtml(saferProducts)}

<div style="text-align:center;margin:24px 0 0;">
  ${ctaButton(`${appUrl}/dashboard`, 'Check Your Scan History →')}
</div>
`
  return emailWrapper('🚨 Food Safety Recall Alert', body)
}

// ─── Day 2 nurture email ──────────────────────────────────────────────────────

export function buildDay2NurtureEmail(name: string, momStatus?: string): string {
  const products = getRecommendedProducts(['heavy-metals'], momStatus ?? 'other').slice(0, 3)

  const body = `
${sectionLabel('Did you know?')}
<h2 style="margin:0 0 12px;color:#111827;font-size:22px;font-weight:800;line-height:1.3;">Hi ${name} — 3 hidden ingredients that could be harming your baby</h2>
<p style="margin:0 0 28px;color:#6b7280;font-size:15px;line-height:1.6;">Most parents assume "baby food" means "safe food." Independent lab testing says otherwise.</p>

<!-- Ingredient cards -->
<table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
  <tr>
    <td width="33%" style="padding:5px;vertical-align:top;">
      <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:12px;padding:18px 14px;text-align:center;height:100%;">
        <p style="margin:0 0 10px;font-size:30px;">☠️</p>
        <p style="margin:0 0 6px;color:#b91c1c;font-size:14px;font-weight:800;">Arsenic</p>
        <p style="margin:0;color:#6b7280;font-size:12px;line-height:1.5;">Found in rice cereals. Linked to developmental delays and immune damage in infants.</p>
      </div>
    </td>
    <td width="33%" style="padding:5px;vertical-align:top;">
      <div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:12px;padding:18px 14px;text-align:center;height:100%;">
        <p style="margin:0 0 10px;font-size:30px;">🧪</p>
        <p style="margin:0 0 6px;color:#c2410c;font-size:14px;font-weight:800;">BPA</p>
        <p style="margin:0;color:#6b7280;font-size:12px;line-height:1.5;">Leaches from plastic packaging. Disrupts hormone development in babies and toddlers.</p>
      </div>
    </td>
    <td width="33%" style="padding:5px;vertical-align:top;">
      <div style="background:#fdf4ff;border:1px solid #e9d5ff;border-radius:12px;padding:18px 14px;text-align:center;height:100%;">
        <p style="margin:0 0 10px;font-size:30px;">🎨</p>
        <p style="margin:0 0 6px;color:#7e22ce;font-size:14px;font-weight:800;">Artificial Dyes</p>
        <p style="margin:0;color:#6b7280;font-size:12px;line-height:1.5;">Red 40, Yellow 5 &amp; 6 — linked to hyperactivity. Banned in Europe, still in US snacks.</p>
      </div>
    </td>
  </tr>
</table>

<!-- Research callout -->
<div style="background:#f0fdf4;border-left:4px solid #16a34a;border-radius:0 12px 12px 0;padding:18px 20px;margin:0 0 24px;">
  <p style="margin:0 0 6px;color:#166534;font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:.05em;">🔬 What the research says</p>
  <p style="margin:0;color:#374151;font-size:14px;line-height:1.6;">A 2021 Congressional investigation found <strong>95% of baby foods tested contained toxic heavy metals</strong> — arsenic, lead, cadmium, mercury. Many trusted brands were named.</p>
</div>

<p style="margin:0 0 28px;color:#4b5563;font-size:15px;line-height:1.6;">The good news? You can check <strong>every product in under 10 seconds</strong> before feeding it to your baby.</p>

<div style="text-align:center;margin:0 0 8px;">
  ${ctaButton(`${appUrl}/dashboard`, '🛡️ Scan Your Baby\'s Food Now →')}
</div>

${divider()}
${sectionLabel('Parents who scanned also bought')}
<h3 style="margin:0 0 16px;color:#111827;font-size:17px;font-weight:700;">Trusted Safe Alternatives</h3>
${affiliateProductsHtml(products)}
`
  return emailWrapper('Did you know these 3 ingredients could be harming your baby?', body)
}

// ─── Day 5 upsell email ───────────────────────────────────────────────────────

export function buildDay5UpsellEmail(name: string, plan: string): string {
  const body = `
${sectionLabel('Your account')}
<h2 style="margin:0 0 12px;color:#111827;font-size:22px;font-weight:800;">Hi ${name}, your free scans are almost up</h2>
<p style="margin:0 0 24px;color:#6b7280;font-size:15px;line-height:1.6;">Over <strong style="color:#111827;">1,247 moms upgraded this week</strong> to keep their families protected. Here's why:</p>

<!-- Testimonial -->
<div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:14px;padding:20px 22px;margin:0 0 28px;">
  <p style="margin:0 0 4px;font-size:22px;">💬</p>
  <p style="margin:0 0 12px;color:#1f2937;font-size:15px;font-style:italic;line-height:1.7;">"I upgraded to Pro on day 3. Within a week I got a recall alert for a snack I had already bought. FoodFactScanner literally saved my baby."</p>
  <p style="margin:0;color:#16a34a;font-size:13px;font-weight:700;">— Jessica M., mom of 2 · upgraded last week</p>
</div>

${sectionLabel('Choose your plan')}
<h3 style="margin:0 0 14px;color:#111827;font-size:17px;font-weight:700;">Compare Plans</h3>

<!-- Plan table -->
<table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;margin:0 0 20px;">
  <tr style="background:#111827;">
    <th style="padding:12px 14px;text-align:left;color:#9ca3af;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;">Feature</th>
    <th style="padding:12px 10px;text-align:center;color:#9ca3af;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;">Free</th>
    <th style="padding:12px 10px;text-align:center;color:#fbbf24;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;">Starter</th>
    <th style="padding:12px 10px;text-align:center;color:#4ade80;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;">Pro ⭐</th>
  </tr>
  <tr style="background:#ffffff;border-bottom:1px solid #f3f4f6;">
    <td style="padding:12px 14px;font-size:13px;color:#374151;font-weight:600;">Price</td>
    <td style="padding:12px 10px;text-align:center;font-size:13px;color:#9ca3af;">Free</td>
    <td style="padding:12px 10px;text-align:center;font-size:13px;color:#c2410c;font-weight:700;">$4.99</td>
    <td style="padding:12px 10px;text-align:center;font-size:13px;color:#16a34a;font-weight:700;">$14.99/mo</td>
  </tr>
  <tr style="background:#f9fafb;border-bottom:1px solid #f3f4f6;">
    <td style="padding:12px 14px;font-size:13px;color:#374151;font-weight:600;">Scans</td>
    <td style="padding:12px 10px;text-align:center;font-size:13px;color:#9ca3af;">3</td>
    <td style="padding:12px 10px;text-align:center;font-size:13px;color:#374151;font-weight:600;">50</td>
    <td style="padding:12px 10px;text-align:center;font-size:13px;color:#374151;font-weight:700;">Unlimited</td>
  </tr>
  <tr style="background:#ffffff;border-bottom:1px solid #f3f4f6;">
    <td style="padding:12px 14px;font-size:13px;color:#374151;font-weight:600;">Email Reports</td>
    <td style="padding:12px 10px;text-align:center;color:#d1d5db;font-size:16px;">✗</td>
    <td style="padding:12px 10px;text-align:center;color:#16a34a;font-size:16px;">✓</td>
    <td style="padding:12px 10px;text-align:center;color:#16a34a;font-size:16px;">✓</td>
  </tr>
  <tr style="background:#f9fafb;border-bottom:1px solid #f3f4f6;">
    <td style="padding:12px 14px;font-size:13px;color:#374151;font-weight:600;">Recall Alerts</td>
    <td style="padding:12px 10px;text-align:center;color:#d1d5db;font-size:16px;">✗</td>
    <td style="padding:12px 10px;text-align:center;color:#d1d5db;font-size:16px;">✗</td>
    <td style="padding:12px 10px;text-align:center;color:#16a34a;font-size:16px;">✓</td>
  </tr>
  <tr style="background:#ffffff;">
    <td style="padding:12px 14px;font-size:13px;color:#374151;font-weight:600;">Weekly Newsletter</td>
    <td style="padding:12px 10px;text-align:center;color:#d1d5db;font-size:16px;">✗</td>
    <td style="padding:12px 10px;text-align:center;color:#d1d5db;font-size:16px;">✗</td>
    <td style="padding:12px 10px;text-align:center;color:#16a34a;font-size:16px;">✓</td>
  </tr>
</table>

<div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:13px 16px;margin:0 0 24px;text-align:center;">
  <p style="margin:0;color:#166534;font-size:13px;font-weight:700;">⏰ Limited time: Pro includes the weekly safety newsletter — a $9/mo value, free.</p>
</div>

<div style="text-align:center;margin:0 0 12px;">
  ${ctaButton(`${appUrl}/checkout?plan=pro`, 'Upgrade to Pro — $14.99/mo →')}
</div>
<div style="text-align:center;margin:0 0 0;">
  ${ctaButton(`${appUrl}/checkout?plan=starter`, 'Get 50 Scans — $4.99', 'secondary')}
</div>
`
  return emailWrapper("Your free scans are almost up — don't leave your baby unprotected", body)
}

// ─── Day 7 re-engage email ────────────────────────────────────────────────────

export function buildDay7ReengageEmail(name: string, momStatus?: string): string {
  const products = getRecommendedProducts(['heavy-metals'], momStatus ?? 'other').slice(0, 3)

  const body = `
${sectionLabel("Last chance")}
<h2 style="margin:0 0 20px;color:#111827;font-size:22px;font-weight:800;line-height:1.3;">Hi ${name} — one week in. Is your baby's food safe?</h2>

<!-- Story -->
<div style="background:#fef2f2;border:1px solid #fecaca;border-radius:14px;padding:20px 22px;margin:0 0 24px;">
  <p style="margin:0 0 10px;color:#b91c1c;font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:.05em;">A story from one of our moms</p>
  <p style="margin:0 0 12px;color:#374151;font-size:14px;line-height:1.7;font-style:italic;">"My daughter was 9 months old. I'd been feeding her the same organic rice puffs for weeks — I trusted the brand. One afternoon I scanned the label in FoodFactScanner. The result came back HIGH arsenic. I was devastated. We switched immediately. Her next pediatrician visit showed improved iron levels."</p>
  <p style="margin:0;color:#b91c1c;font-size:13px;font-weight:700;">— Sarah K., mom of 1 · FoodFactScanner Pro member</p>
</div>

<!-- Urgency block -->
<div style="background:#111827;border-radius:14px;padding:24px;margin:0 0 24px;text-align:center;">
  <p style="margin:0 0 6px;color:#6b7280;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;">Think about this</p>
  <p style="margin:0;color:#f9fafb;font-size:17px;font-weight:700;line-height:1.6;">You signed up 7 days ago.<br><span style="color:#fbbf24;">Your baby has eaten dozens of meals since then.</span><br>Were they safe?</p>
</div>

<p style="margin:0 0 24px;color:#4b5563;font-size:15px;line-height:1.6;">For less than a coffee — <strong style="color:#111827;">$14.99/mo</strong> — you get unlimited scans, instant recall alerts, and weekly safety reports. That's <strong style="color:#111827;">50 cents a day</strong>.</p>

<!-- Feature list -->
<div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:18px 20px;margin:0 0 28px;">
  <p style="margin:0 0 12px;color:#166534;font-size:13px;font-weight:800;text-transform:uppercase;letter-spacing:.04em;">What Pro members get</p>
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td style="padding:5px 0;"><p style="margin:0;color:#374151;font-size:14px;line-height:1.5;"><span style="color:#16a34a;font-weight:700;">✓</span> <strong>Unlimited scans</strong> — check every product, every time</p></td></tr>
    <tr><td style="padding:5px 0;"><p style="margin:0;color:#374151;font-size:14px;line-height:1.5;"><span style="color:#16a34a;font-weight:700;">✓</span> <strong>Priority recall alerts</strong> — know before the news does</p></td></tr>
    <tr><td style="padding:5px 0;"><p style="margin:0;color:#374151;font-size:14px;line-height:1.5;"><span style="color:#16a34a;font-weight:700;">✓</span> <strong>Weekly safety newsletter</strong> — tips for your baby's exact stage</p></td></tr>
    <tr><td style="padding:5px 0;"><p style="margin:0;color:#374151;font-size:14px;line-height:1.5;"><span style="color:#16a34a;font-weight:700;">✓</span> <strong>Full scan history</strong> — every product you've ever checked</p></td></tr>
  </table>
</div>

<div style="text-align:center;margin:0 0 10px;">
  ${ctaButton(`${appUrl}/checkout?plan=pro`, 'Protect My Baby — Upgrade to Pro →')}
</div>
<p style="text-align:center;margin:0 0 0;color:#9ca3af;font-size:12px;">Less than a coffee a day. Cancel anytime.</p>

${divider()}
${sectionLabel('Parents who upgraded also bought')}
<h3 style="margin:0 0 16px;color:#111827;font-size:17px;font-weight:700;">Trusted Safe Products</h3>
${affiliateProductsHtml(products)}
`
  return emailWrapper('Last chance: protect your baby for less than a coffee', body)
}

// ─── Weekly scan summary email ────────────────────────────────────────────────

export interface WeeklyScanStats {
  total: number
  safe: number
  caution: number
  danger: number
  topChemicals: string[]
}

export function buildWeeklyScanSummaryEmail(
  name: string,
  stats: WeeklyScanStats,
  userProfile?: UserProfile
): string {
  const products = getRecommendedProducts(userProfile?.concerns ?? [], userProfile?.momStatus ?? 'other')

  const scoreBarHtml = `
<table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 20px;">
  <tr>
    <td width="33%" style="padding:6px;">
      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:14px;text-align:center;">
        <p style="margin:0 0 2px;color:#16a34a;font-size:22px;font-weight:800;">${stats.safe}</p>
        <p style="margin:0;color:#6b7280;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.04em;">Safe</p>
      </div>
    </td>
    <td width="33%" style="padding:6px;">
      <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:10px;padding:14px;text-align:center;">
        <p style="margin:0 0 2px;color:#d97706;font-size:22px;font-weight:800;">${stats.caution}</p>
        <p style="margin:0;color:#6b7280;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.04em;">Caution</p>
      </div>
    </td>
    <td width="33%" style="padding:6px;">
      <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:10px;padding:14px;text-align:center;">
        <p style="margin:0 0 2px;color:#dc2626;font-size:22px;font-weight:800;">${stats.danger}</p>
        <p style="margin:0;color:#6b7280;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.04em;">Danger</p>
      </div>
    </td>
  </tr>
</table>`

  const chemicalsHtml = stats.topChemicals.length > 0 ? `
${divider()}
${sectionLabel('Most detected this week')}
<h3 style="margin:0 0 12px;color:#111827;font-size:15px;font-weight:700;">Top Chemicals Found in Your Scans</h3>
<div style="background:#fef2f2;border:1px solid #fecaca;border-radius:12px;padding:14px 18px;">
  ${stats.topChemicals.slice(0, 5).map(c => `
  <div style="display:flex;align-items:center;padding:6px 0;border-bottom:1px solid #fee2e2;">
    <span style="color:#b91c1c;font-size:13px;font-weight:600;">⚠ ${c}</span>
  </div>`).join('')}
</div>` : ''

  const body = `
${sectionLabel('Your weekly summary')}
<h2 style="margin:0 0 8px;color:#111827;font-size:22px;font-weight:800;">Hi ${name}, here's your week in food safety</h2>
<p style="margin:0 0 24px;color:#6b7280;font-size:15px;">You scanned <strong style="color:#111827;">${stats.total} product${stats.total !== 1 ? 's' : ''}</strong> this week. Here's the breakdown:</p>

${scoreBarHtml}

${stats.danger > 0 ? `
<div style="background:#fef2f2;border:1px solid #fecaca;border-radius:12px;padding:14px 18px;margin:0 0 20px;">
  <p style="margin:0;color:#b91c1c;font-size:14px;font-weight:600;">🚨 ${stats.danger} product${stats.danger !== 1 ? 's' : ''} flagged as DANGER — review your scan history and consider switching to safer alternatives below.</p>
</div>` : stats.caution > 0 ? `
<div style="background:#fffbeb;border:1px solid #fde68a;border-radius:12px;padding:14px 18px;margin:0 0 20px;">
  <p style="margin:0;color:#92400e;font-size:14px;font-weight:600;">⚠️ ${stats.caution} product${stats.caution !== 1 ? 's' : ''} flagged as CAUTION — worth reviewing ingredients carefully.</p>
</div>` : `
<div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:14px 18px;margin:0 0 20px;">
  <p style="margin:0;color:#166534;font-size:14px;font-weight:600;">✅ Great week! All ${stats.total} products came back clean.</p>
</div>`}

${chemicalsHtml}

${divider()}
${sectionLabel('Recommended for you')}
<h3 style="margin:0 0 16px;color:#111827;font-size:17px;font-weight:700;">Safer Alternatives This Week</h3>
${affiliateProductsHtml(products)}

<div style="text-align:center;margin:24px 0 0;">
  ${ctaButton(`${appUrl}/dashboard`, 'View Full Scan History →')}
</div>
`
  return emailWrapper('Your Weekly Scan Summary', body)
}

// ─── Post-scan upsell email ───────────────────────────────────────────────────

export function buildPostScanUpsellEmail(
  name: string,
  scan: ScanResult,
  plan: string
): string {
  const isCaution = scan.overallScore === 'caution'
  const bannerBg = isCaution ? '#fffbeb' : '#fef2f2'
  const bannerBorder = isCaution ? '#fde68a' : '#fecaca'
  const bannerTextColor = isCaution ? '#92400e' : '#991b1b'
  const bannerLabel = isCaution ? '⚠️ CAUTION DETECTED' : '🚨 DANGER DETECTED'

  const saferProducts = getRecommendedProducts(
    scan.chemicals.some(c => ['Arsenic', 'Lead', 'Cadmium', 'Mercury'].includes(c.name))
      ? ['heavy-metals']
      : ['bpa'],
    'other'
  )

  const body = `
${sectionLabel('Your scan raised a flag')}
<h2 style="margin:0 0 12px;color:#111827;font-size:22px;font-weight:800;">Hi ${name}, here's what you should know</h2>
<p style="margin:0 0 20px;color:#6b7280;font-size:15px;line-height:1.6;">Your scan of <strong style="color:#111827;">${scan.productName}</strong> came back with a warning. Here's how to stay protected going forward.</p>

<!-- Score card -->
<div style="background:${bannerBg};border:1px solid ${bannerBorder};border-radius:12px;padding:16px 18px;margin:0 0 24px;">
  <p style="margin:0 0 4px;color:${bannerTextColor};font-size:11px;font-weight:800;letter-spacing:.08em;">${bannerLabel}</p>
  <p style="margin:0;color:#374151;font-size:14px;line-height:1.5;">${scan.chemicals.length > 0 ? `${scan.chemicals.length} concerning ingredient${scan.chemicals.length !== 1 ? 's' : ''} found: <strong>${scan.chemicals.slice(0, 3).map(c => c.name).join(', ')}${scan.chemicals.length > 3 ? '…' : ''}</strong>` : 'Potentially harmful ingredients detected in this product.'}</p>
</div>

<!-- Upgrade pitch -->
<div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:14px;padding:20px 22px;margin:0 0 24px;">
  <p style="margin:0 0 12px;color:#166534;font-size:13px;font-weight:800;text-transform:uppercase;letter-spacing:.04em;">Upgrade to Pro to stay protected</p>
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td style="padding:5px 0;"><p style="margin:0;color:#374151;font-size:14px;"><span style="color:#16a34a;font-weight:700;">✓</span> <strong>Unlimited scans</strong> — never hit a limit</p></td></tr>
    <tr><td style="padding:5px 0;"><p style="margin:0;color:#374151;font-size:14px;"><span style="color:#16a34a;font-weight:700;">✓</span> <strong>Recall alerts</strong> — get notified before the news does</p></td></tr>
    <tr><td style="padding:5px 0;"><p style="margin:0;color:#374151;font-size:14px;"><span style="color:#16a34a;font-weight:700;">✓</span> <strong>Full scan history</strong> — track every product you've checked</p></td></tr>
    <tr><td style="padding:5px 0;"><p style="margin:0;color:#374151;font-size:14px;"><span style="color:#16a34a;font-weight:700;">✓</span> <strong>Weekly safety newsletter</strong> — stage-specific tips</p></td></tr>
  </table>
</div>

<div style="text-align:center;margin:0 0 12px;">
  ${ctaButton(`${appUrl}/checkout?plan=pro`, 'Upgrade to Pro — $14.99/mo →')}
</div>
<p style="text-align:center;margin:0 0 0;color:#9ca3af;font-size:12px;">Cancel anytime. Protect your family from day one.</p>

${divider()}
${sectionLabel('Safer alternatives')}
<h3 style="margin:0 0 16px;color:#111827;font-size:17px;font-weight:700;">Products We Trust Instead</h3>
${affiliateProductsHtml(saferProducts)}
`
  return emailWrapper(`⚠️ Your scan of ${scan.productName} flagged a warning`, body)
}

// ─── Milestone email ──────────────────────────────────────────────────────────

interface MilestoneContent {
  emoji: string
  headline: string
  intro: string
  tips: string[]
  productTags: string[]
}

function getMilestoneContent(months: number): MilestoneContent {
  if (months === 4) return {
    emoji: '👀',
    headline: 'Showing signs of curiosity about food',
    intro: 'At 4 months, many babies start watching you eat and showing interest in food. The American Academy of Pediatrics recommends waiting until 6 months — but now is the time to learn what\'s safe.',
    tips: [
      'Keep exclusively breastfeeding or formula-feeding for now.',
      'Start learning which foods to introduce first — and which to scan.',
      'Avoid rice cereal — newer guidelines flag it for arsenic content.',
    ],
    productTags: ['heavy-metals'],
  }
  if (months === 6) return {
    emoji: '🥕',
    headline: 'Time to start solids!',
    intro: 'Congratulations — 6 months is the recommended time to introduce solid foods. The foods you choose now will shape your baby\'s palate and health for years to come.',
    tips: [
      'Start with single-ingredient purees: sweet potato, peas, butternut squash.',
      'Introduce one new food every 3–5 days to spot any reactions.',
      'Scan every new product before you feed it — even "organic" labels can hide heavy metals.',
    ],
    productTags: ['heavy-metals', 'pesticides'],
  }
  if (months === 8) return {
    emoji: '🤌',
    headline: 'Ready for finger foods!',
    intro: 'At 8 months, most babies are ready for soft finger foods and more textural variety. This is an exciting — and important — nutrition stage.',
    tips: [
      'Offer soft, small pieces: ripe banana, avocado, soft-cooked carrot.',
      'Start introducing common allergens (peanut butter, egg) under doctor guidance.',
      'Scan snack foods carefully — many toddler puffs and crackers test high for arsenic and artificial dyes.',
    ],
    productTags: ['bpa', 'artificial-additives'],
  }
  if (months === 12) return {
    emoji: '🎂',
    headline: 'Happy 1st birthday!',
    intro: 'What an incredible year. At 12 months, your baby is transitioning to family foods — a huge nutritional shift. Here\'s what you need to know.',
    tips: [
      'You can now introduce whole cow\'s milk as a main drink.',
      'Limit juice — no more than 4 oz/day, and always scan juice brands for arsenic.',
      'Most family foods are fine now. Scan anything with a long ingredient list.',
    ],
    productTags: ['heavy-metals', 'bpa'],
  }
  // 18+ months
  return {
    emoji: '🌟',
    headline: 'Toddler nutrition — what matters most now',
    intro: 'At 18 months, your toddler is eating a wide variety of foods and developing strong preferences. This is the most important window to build healthy habits.',
    tips: [
      'Scan all packaged snacks — toddler foods are full of artificial dyes, hidden sugars, and preservatives.',
      'Keep salt and added sugar low — developing kidneys are sensitive.',
      'Variety wins: the more diverse the diet now, the fewer nutrition gaps later.',
    ],
    productTags: ['heavy-metals', 'artificial-additives'],
  }
}

export function buildMilestoneEmail(
  name: string,
  months: number,
  babyName?: string,
  userProfile?: UserProfile
): string {
  const milestone = getMilestoneContent(months)
  const babyLabel = babyName ?? 'your baby'
  const products = getRecommendedProducts(
    milestone.productTags as Array<'heavy-metals' | 'pesticides' | 'bpa' | 'artificial-additives'>,
    months >= 12 ? 'toddler' : 'newborn'
  )

  const body = `
<div style="background:linear-gradient(135deg,#166534 0%,#15803d 100%);border-radius:14px;padding:28px 24px;margin:0 0 24px;text-align:center;">
  <p style="margin:0 0 8px;font-size:42px;">${milestone.emoji}</p>
  <p style="margin:0 0 4px;color:rgba(255,255,255,.7);font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;">${getBabyAgeLabel(months)}</p>
  <h2 style="margin:0;color:#ffffff;font-size:20px;font-weight:800;line-height:1.3;">${babyName ? `${babyName}: ` : ''}${milestone.headline}</h2>
</div>

<p style="margin:0 0 24px;color:#4b5563;font-size:15px;line-height:1.7;">Hi ${name}! ${milestone.intro}</p>

${sectionLabel('Tips for this stage')}
<h3 style="margin:0 0 14px;color:#111827;font-size:16px;font-weight:700;">What to know at ${getBabyAgeLabel(months)}</h3>
<div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;padding:16px 18px;margin:0 0 24px;">
  ${milestone.tips.map((t, i) => `
  <div style="padding:8px 0;${i < milestone.tips.length - 1 ? 'border-bottom:1px solid #f3f4f6;' : ''}">
    <p style="margin:0;color:#374151;font-size:14px;line-height:1.5;"><span style="color:#16a34a;font-weight:700;">${i + 1}.</span> ${t}</p>
  </div>`).join('')}
</div>

<div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:14px 18px;margin:0 0 24px;">
  <p style="margin:0;color:#166534;font-size:14px;font-weight:600;">🛡️ Scan everything you introduce this month — ${babyLabel}'s immune system is still developing and more sensitive to hidden chemicals than adults.</p>
</div>

<div style="text-align:center;margin:0 0 8px;">
  ${ctaButton(`${appUrl}/dashboard`, `Scan ${babyName ? babyName + "'s" : "Your Baby's"} Food Now →`)}
</div>

${divider()}
${sectionLabel('Recommended for this stage')}
<h3 style="margin:0 0 16px;color:#111827;font-size:17px;font-weight:700;">Trusted Products for ${getBabyAgeLabel(months)}</h3>
${affiliateProductsHtml(products)}
`
  return emailWrapper(`${babyName ? babyName + ' is ' : ''}${getBabyAgeLabel(months)} — here's what to know`, body)
}

// ─── Re-engagement email ──────────────────────────────────────────────────────

export function buildReengageEmail(
  name: string,
  daysSinceLastScan: number,
  products: AffiliateProduct[],
  momStatus?: string
): string {
  const timeLabel = daysSinceLastScan >= 14
    ? `${Math.floor(daysSinceLastScan / 7)} weeks`
    : `${daysSinceLastScan} days`

  const body = `
${sectionLabel("We've missed you")}
<h2 style="margin:0 0 12px;color:#111827;font-size:22px;font-weight:800;">Hi ${name}, it's been ${timeLabel} since your last scan</h2>
<p style="margin:0 0 24px;color:#6b7280;font-size:15px;line-height:1.6;">A lot can change in ${timeLabel}. New recalls, new products, new ingredients to watch out for. Here's what other parents have been scanning:</p>

<!-- Urgency nudge -->
<div style="background:#111827;border-radius:14px;padding:22px 24px;margin:0 0 24px;">
  <p style="margin:0 0 8px;color:#6b7280;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;">Recent FDA activity</p>
  <p style="margin:0;color:#f9fafb;font-size:15px;font-weight:600;line-height:1.6;">3 new baby food recalls issued this month. <span style="color:#fbbf24;">Have you checked your pantry?</span></p>
</div>

<p style="margin:0 0 24px;color:#4b5563;font-size:15px;line-height:1.6;">It only takes 10 seconds to scan a product. Open the app, point your camera, and know instantly what's in your baby's food.</p>

<div style="text-align:center;margin:0 0 8px;">
  ${ctaButton(`${appUrl}/dashboard`, 'Scan Something Now →')}
</div>
<p style="text-align:center;margin:0 0 0;color:#9ca3af;font-size:12px;">Takes 10 seconds. Always free to scan.</p>

${divider()}
${sectionLabel('Popular right now')}
<h3 style="margin:0 0 16px;color:#111827;font-size:17px;font-weight:700;">Products Parents Are Checking This Week</h3>
${affiliateProductsHtml(products)}
`
  return emailWrapper("It's been a while — here's what you might have missed", body)
}

// ─── Automation email dispatcher ─────────────────────────────────────────────

export async function sendAutomationEmail(
  email: string,
  name: string,
  day: number,
  profile?: { plan?: string; momStatus?: string }
): Promise<void> {
  let subject: string
  let html: string

  switch (day) {
    case 2:
      subject = 'Did you know these 3 ingredients could be harming your baby?'
      html = buildDay2NurtureEmail(name, profile?.momStatus)
      break
    case 5:
      subject = "Your free scans are almost up — don't leave your baby unprotected"
      html = buildDay5UpsellEmail(name, profile?.plan ?? 'free')
      break
    case 7:
      subject = 'Last chance: protect your baby for less than a coffee'
      html = buildDay7ReengageEmail(name, profile?.momStatus)
      break
    default:
      return
  }

  await sendTransactionalEmail(email, name, subject, html)
}
