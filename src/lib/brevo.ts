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

  await fetch(`${BREVO_API_BASE}/smtp/email`, {
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
  }).catch(console.error)
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
<body style="margin:0;padding:0;background:#f8f9fa;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f9fa;padding:32px 0;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.08);">
<!-- Header -->
<tr><td style="background:linear-gradient(135deg,#22c55e 0%,#16a34a 100%);padding:32px 40px;text-align:center;">
  <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:800;letter-spacing:-0.5px;">🥦 FoodFactScanner</h1>
  <p style="margin:8px 0 0;color:rgba(255,255,255,.85);font-size:14px;">${title}</p>
</td></tr>
<!-- Body -->
<tr><td style="padding:40px;">
${body}
</td></tr>
<!-- Footer -->
<tr><td style="background:#f1f5f9;padding:24px 40px;text-align:center;border-top:1px solid #e2e8f0;">
  <p style="margin:0;color:#94a3b8;font-size:12px;line-height:1.6;">
    FoodFactScanner · Food safety for families<br>
    <a href="${appUrl}" style="color:#22c55e;text-decoration:none;">Visit App</a> ·
    <a href="${appUrl}/unsubscribe" style="color:#94a3b8;text-decoration:none;">Unsubscribe</a><br><br>
    <em>As an Amazon Associate, FoodFactScanner earns from qualifying purchases.
    Product recommendations are based on safety ratings and user profiles.</em>
  </p>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`
}

function affiliateProductsHtml(products: AffiliateProduct[]): string {
  const cards = products.slice(0, 3).map(p => `
<td width="33%" style="padding:8px;vertical-align:top;">
  <div style="background:#f8f9fa;border-radius:12px;overflow:hidden;text-align:center;">
    <img src="${p.imageUrl}" alt="${p.title}" width="100%" style="height:140px;object-fit:cover;">
    <div style="padding:12px;">
      <p style="margin:0 0 4px;font-size:12px;font-weight:700;color:#1e293b;line-height:1.3;">${p.title.slice(0, 55)}${p.title.length > 55 ? '…' : ''}</p>
      <p style="margin:0 0 8px;font-size:14px;font-weight:800;color:#22c55e;">${p.price}</p>
      <a href="${p.affiliateUrl}" style="display:inline-block;background:#ff9900;color:#000;font-size:11px;font-weight:700;text-decoration:none;padding:6px 12px;border-radius:6px;">Buy on Amazon</a>
    </div>
  </div>
</td>`).join('')

  return `<table width="100%" cellpadding="0" cellspacing="0"><tr>${cards}</tr></table>`
}

// ─── Welcome email ───────────────────────────────────────────────────────────

export function buildWelcomeEmail(name: string, momStatus?: string): string {
  const products = getRecommendedProducts(
    momStatus === 'expecting' ? ['heavy-metals'] : ['bpa'],
    momStatus ?? 'other'
  )

  const body = `
<h2 style="margin:0 0 16px;color:#1e293b;font-size:22px;font-weight:800;">Welcome, ${name}! 🎉</h2>
<p style="margin:0 0 16px;color:#475569;font-size:15px;line-height:1.6;">
  You're now protected by FoodFactScanner — the #1 food safety app for families.
  Here's what you can do right now:
</p>
<table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
  <tr>
    <td style="padding:12px;background:#f0fdf4;border-radius:8px;margin-bottom:8px;">
      <strong style="color:#16a34a;">📷 Scan any food label</strong>
      <p style="margin:4px 0 0;color:#475569;font-size:13px;">Point your camera at any ingredient list to instantly detect heavy metals, pesticides, and harmful additives.</p>
    </td>
  </tr>
  <tr><td style="height:8px;"></td></tr>
  <tr>
    <td style="padding:12px;background:#f0fdf4;border-radius:8px;">
      <strong style="color:#16a34a;">🛡️ Get personalized alerts</strong>
      <p style="margin:4px 0 0;color:#475569;font-size:13px;">We flag risks specific to your stage — pregnancy, breastfeeding, or your baby's age.</p>
    </td>
  </tr>
  <tr><td style="height:8px;"></td></tr>
  <tr>
    <td style="padding:12px;background:#f0fdf4;border-radius:8px;">
      <strong style="color:#16a34a;">📬 Weekly safety newsletter</strong>
      <p style="margin:4px 0 0;color:#475569;font-size:13px;">FDA recall alerts and stage-based nutrition tips delivered to your inbox.</p>
    </td>
  </tr>
</table>
<div style="text-align:center;margin:0 0 32px;">
  <a href="${appUrl}/dashboard" style="display:inline-block;background:#22c55e;color:#fff;font-size:16px;font-weight:700;text-decoration:none;padding:14px 32px;border-radius:12px;">Start Scanning Now →</a>
</div>
<h3 style="margin:0 0 16px;color:#1e293b;font-size:16px;font-weight:700;">🛍️ Recommended Safe Products For You</h3>
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
  const scoreColor = scan.overallScore === 'safe' ? '#22c55e' : scan.overallScore === 'caution' ? '#f59e0b' : '#ef4444'
  const scoreLabel = scan.overallScore.toUpperCase()
  const scoreEmoji = scan.overallScore === 'safe' ? '✅' : scan.overallScore === 'caution' ? '⚠️' : '🚨'

  const chemicalsHtml = scan.chemicals.length > 0 ? `
<table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;border-collapse:collapse;">
  <tr style="background:#f1f5f9;">
    <th style="text-align:left;padding:10px 12px;font-size:12px;color:#64748b;font-weight:600;">Chemical</th>
    <th style="text-align:left;padding:10px 12px;font-size:12px;color:#64748b;font-weight:600;">Level</th>
    <th style="text-align:left;padding:10px 12px;font-size:12px;color:#64748b;font-weight:600;">Health Risk</th>
  </tr>
  ${scan.chemicals.map((c, i) => `
  <tr style="background:${i % 2 === 0 ? '#ffffff' : '#f8fafc'};">
    <td style="padding:10px 12px;font-size:13px;color:#1e293b;font-weight:600;">${c.name}</td>
    <td style="padding:10px 12px;">
      <span style="background:${c.level === 'high' ? '#fee2e2' : c.level === 'medium' ? '#fef3c7' : '#dcfce7'};color:${c.level === 'high' ? '#dc2626' : c.level === 'medium' ? '#d97706' : '#16a34a'};font-size:11px;font-weight:700;padding:2px 8px;border-radius:4px;">${c.level.toUpperCase()}</span>
    </td>
    <td style="padding:10px 12px;font-size:12px;color:#64748b;">${c.healthRisk}</td>
  </tr>`).join('')}
</table>` : '<p style="color:#22c55e;font-weight:600;">✅ No harmful chemicals detected!</p>'

  const concerns = userProfile?.concerns ?? []
  const saferProducts = getRecommendedProducts(
    scan.overallScore !== 'safe'
      ? [...concerns, scan.chemicals.some(c => ['Arsenic', 'Lead', 'Cadmium', 'Mercury'].includes(c.name)) ? 'heavy-metals' : 'bpa']
      : concerns,
    userProfile?.momStatus ?? 'other'
  )

  const body = `
<h2 style="margin:0 0 16px;color:#1e293b;font-size:20px;font-weight:800;">Hi ${name}, here's your scan result</h2>
<div style="background:#f8f9fa;border-radius:12px;padding:20px;margin:0 0 24px;">
  <div style="display:flex;align-items:center;gap:12px;">
    <div>
      <h3 style="margin:0;color:#1e293b;font-size:16px;font-weight:700;">${scan.productName}</h3>
      <p style="margin:4px 0 0;color:#64748b;font-size:13px;">${scan.brand}</p>
    </div>
    <div style="margin-left:auto;text-align:right;">
      <span style="display:inline-block;background:${scoreColor};color:#fff;font-size:14px;font-weight:800;padding:6px 16px;border-radius:8px;">${scoreEmoji} ${scoreLabel}</span>
    </div>
  </div>
</div>
<h3 style="margin:0 0 12px;color:#1e293b;font-size:15px;font-weight:700;">Chemicals Found</h3>
${chemicalsHtml}
${scan.overallScore !== 'safe' ? `
<h3 style="margin:0 0 16px;color:#1e293b;font-size:15px;font-weight:700;">🛡️ Safer Alternatives We Recommend</h3>
${affiliateProductsHtml(saferProducts)}
` : ''}
<div style="text-align:center;margin:24px 0 0;">
  <a href="${appUrl}/dashboard" style="display:inline-block;background:#22c55e;color:#fff;font-size:15px;font-weight:700;text-decoration:none;padding:12px 28px;border-radius:10px;">Scan Another Product →</a>
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
  let tips: string[] = ['Always scan food labels before feeding your baby.', 'Choose organic when possible for the dirty dozen produce.']

  if (userProfile.momStatus === 'expecting' && userProfile.dueDate) {
    const week = getPregnancyWeek(userProfile.dueDate)
    stageHeader = `Week ${week} of Pregnancy 🤰`
    tips = getTrimesterTips(week)
  } else if ((userProfile.momStatus === 'newborn' || userProfile.momStatus === 'toddler') && userProfile.babyAgeMonths !== undefined) {
    const ageLabel = getBabyAgeLabel(userProfile.babyAgeMonths)
    stageHeader = `${userProfile.babyName ? userProfile.babyName + ' is ' : ''}${ageLabel} 👶`
    tips = getMonthMilestoneTips(userProfile.babyAgeMonths)
  }

  const urgentRecalls = recalls.filter(r => r.severity === 'urgent').slice(0, 2)
  const recallsHtml = urgentRecalls.length > 0 ? `
<div style="background:#fef2f2;border:1px solid #fecaca;border-radius:12px;padding:20px;margin:0 0 24px;">
  <h3 style="margin:0 0 12px;color:#dc2626;font-size:15px;font-weight:700;">🚨 Active Recall Alerts</h3>
  ${urgentRecalls.map(r => `
  <div style="border-top:1px solid #fecaca;padding:12px 0;">
    <strong style="color:#1e293b;">${r.product}</strong> by ${r.brand}<br>
    <span style="color:#dc2626;font-size:13px;">${r.reason}</span><br>
    <span style="color:#64748b;font-size:12px;">Lots: ${r.affectedLots}</span>
  </div>`).join('')}
  <a href="${appUrl}/dashboard" style="display:inline-block;margin-top:12px;color:#dc2626;font-size:13px;font-weight:700;text-decoration:none;">View All Recalls in App →</a>
</div>` : ''

  const products = getRecommendedProducts(userProfile.concerns ?? [], userProfile.momStatus)

  const body = `
<h2 style="margin:0 0 4px;color:#1e293b;font-size:22px;font-weight:800;">Hi ${name}! 👋</h2>
<p style="margin:0 0 24px;color:#64748b;font-size:13px;">Your weekly FoodFactScanner update</p>
<div style="background:linear-gradient(135deg,#f0fdf4,#dcfce7);border-radius:12px;padding:20px;margin:0 0 24px;">
  <h3 style="margin:0 0 12px;color:#16a34a;font-size:16px;font-weight:700;">${stageHeader}</h3>
  ${tips.map(t => `<p style="margin:0 0 8px;color:#1e293b;font-size:14px;line-height:1.6;">• ${t}</p>`).join('')}
</div>
${recallsHtml}
<h3 style="margin:0 0 16px;color:#1e293b;font-size:15px;font-weight:700;">🛍️ This Week's Safe Picks For You</h3>
${affiliateProductsHtml(products)}
<div style="text-align:center;margin:24px 0 0;">
  <a href="${appUrl}/dashboard?tab=shop" style="display:inline-block;background:#22c55e;color:#fff;font-size:15px;font-weight:700;text-decoration:none;padding:12px 28px;border-radius:10px;">View Full Safe Shop →</a>
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
<div style="background:#fef2f2;border-radius:12px;padding:20px;margin:0 0 24px;text-align:center;">
  <p style="margin:0;font-size:32px;">🚨</p>
  <h2 style="margin:8px 0 4px;color:#dc2626;font-size:20px;font-weight:800;">Food Safety Recall Alert</h2>
  <p style="margin:0;color:#64748b;font-size:13px;">Action may be required</p>
</div>
<p style="margin:0 0 16px;color:#475569;font-size:15px;">Hi ${name}, we wanted to alert you about a recent recall that may affect products you use:</p>
<div style="background:#f8f9fa;border-radius:12px;padding:20px;margin:0 0 24px;">
  <h3 style="margin:0 0 4px;color:#1e293b;font-size:16px;font-weight:700;">${recall.product}</h3>
  <p style="margin:0 0 8px;color:#64748b;font-size:13px;">by ${recall.brand}</p>
  <p style="margin:0 0 8px;color:#dc2626;font-size:14px;font-weight:600;">Reason: ${recall.reason}</p>
  <p style="margin:0;color:#64748b;font-size:13px;">Affected lots: ${recall.affectedLots}</p>
</div>
<p style="margin:0 0 24px;color:#475569;font-size:14px;line-height:1.6;">
  <strong>What to do:</strong> Check your pantry for this product. If you have it, do not use it — dispose of it safely or return to place of purchase for a refund.
</p>
<h3 style="margin:0 0 16px;color:#1e293b;font-size:15px;font-weight:700;">🛡️ Safer Alternatives</h3>
${affiliateProductsHtml(saferProducts)}
<div style="text-align:center;margin:24px 0 0;">
  <a href="${appUrl}/dashboard" style="display:inline-block;background:#22c55e;color:#fff;font-size:15px;font-weight:700;text-decoration:none;padding:12px 28px;border-radius:10px;">Check Your Scan History →</a>
</div>
`
  return emailWrapper('🚨 Food Safety Recall Alert', body)
}
