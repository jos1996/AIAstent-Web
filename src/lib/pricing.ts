// ── Geo-based Pricing System ─────────────────────────────────────────────────
// Detects user country via IP → maps to a pricing region → returns localized prices.
// Razorpay supports international cards in INR. Prices shown in local currency
// for clarity, but Razorpay always processes in INR (amountInPaise).

export type Region = 'IN' | 'ASIA' | 'LATAM' | 'EU' | 'US' | 'GULF' | 'DEFAULT';

export interface RegionalPlan {
  label: string;           // display e.g. "$10" or "€8"
  sub: string;             // suffix e.g. "/ hour"
  amountInPaise: number;   // Razorpay charge in INR paise
  savingsNote: string;
  badge: string;
}

export interface RegionalPricing {
  region: Region;
  countryCode: string;
  currencySymbol: string;
  currencyCode: string;
  note: string;
  free: RegionalPlan;
  credit_1hr: RegionalPlan;
  credit_3hr: RegionalPlan;
  credit_10hr: RegionalPlan;
}

// ── Country → Region ─────────────────────────────────────────────────────────
const COUNTRY_REGION: Record<string, Region> = {
  IN: 'IN',
  // South & Southeast Asia
  PK: 'ASIA', BD: 'ASIA', LK: 'ASIA', NP: 'ASIA', MM: 'ASIA',
  ID: 'ASIA', PH: 'ASIA', VN: 'ASIA', TH: 'ASIA', MY: 'ASIA',
  KH: 'ASIA', LA: 'ASIA', MN: 'ASIA',
  // Latin America
  BR: 'LATAM', MX: 'LATAM', CO: 'LATAM', AR: 'LATAM', CL: 'LATAM',
  PE: 'LATAM', EC: 'LATAM', BO: 'LATAM', PY: 'LATAM', UY: 'LATAM',
  VE: 'LATAM', GT: 'LATAM', CR: 'LATAM', PA: 'LATAM', DO: 'LATAM',
  // Europe
  GB: 'EU', DE: 'EU', FR: 'EU', IT: 'EU', ES: 'EU', NL: 'EU',
  SE: 'EU', NO: 'EU', DK: 'EU', FI: 'EU', CH: 'EU', AT: 'EU',
  BE: 'EU', PT: 'EU', PL: 'EU', CZ: 'EU', HU: 'EU', RO: 'EU',
  GR: 'EU', IE: 'EU', HR: 'EU', SK: 'EU', SI: 'EU', LT: 'EU',
  LV: 'EU', EE: 'EU',
  // USA & Canada + AU/NZ/East Asia (premium)
  US: 'US', CA: 'US', AU: 'US', NZ: 'US', JP: 'US', KR: 'US',
  SG: 'US', HK: 'US', TW: 'US',
  // Gulf
  AE: 'GULF', SA: 'GULF', QA: 'GULF', KW: 'GULF', BH: 'GULF', OM: 'GULF',
};

// ── Pricing table (all amounts in INR paise for Razorpay) ────────────────────
// USD ~₹85 | EUR ~₹92 | GBP ~₹108
const PRICING_TABLE: Record<Region, RegionalPricing> = {
  IN: {
    region: 'IN', countryCode: 'IN', currencySymbol: '₹', currencyCode: 'INR', note: '',
    free:        { label: 'Free',    sub: '15 min',   amountInPaise: 0,      savingsNote: '',         badge: '' },
    credit_1hr:  { label: '₹399',   sub: '/ hour',   amountInPaise: 39900,  savingsNote: '',         badge: '' },
    credit_3hr:  { label: '₹599',   sub: '/ 3 hrs',  amountInPaise: 59900,  savingsNote: 'Save 50%', badge: 'BEST VALUE' },
    credit_10hr: { label: '₹1,999', sub: '/ 10 hrs', amountInPaise: 199900, savingsNote: 'Save 50%', badge: '' },
  },
  ASIA: {
    region: 'ASIA', countryCode: '', currencySymbol: '$', currencyCode: 'USD',
    note: 'Charged in INR equivalent via Razorpay',
    free:        { label: 'Free', sub: '15 min',   amountInPaise: 0,      savingsNote: '',         badge: '' },
    credit_1hr:  { label: '$4',   sub: '/ hour',   amountInPaise: 34000,  savingsNote: '',         badge: '' },
    credit_3hr:  { label: '$10',  sub: '/ 3 hrs',  amountInPaise: 85000,  savingsNote: 'Save 17%', badge: 'BEST VALUE' },
    credit_10hr: { label: '$30',  sub: '/ 10 hrs', amountInPaise: 255000, savingsNote: 'Save 25%', badge: '' },
  },
  LATAM: {
    region: 'LATAM', countryCode: '', currencySymbol: '$', currencyCode: 'USD',
    note: 'Charged in INR equivalent via Razorpay',
    free:        { label: 'Free', sub: '15 min',   amountInPaise: 0,      savingsNote: '',         badge: '' },
    credit_1hr:  { label: '$6',   sub: '/ hour',   amountInPaise: 51000,  savingsNote: '',         badge: '' },
    credit_3hr:  { label: '$15',  sub: '/ 3 hrs',  amountInPaise: 127500, savingsNote: 'Save 17%', badge: 'BEST VALUE' },
    credit_10hr: { label: '$45',  sub: '/ 10 hrs', amountInPaise: 382500, savingsNote: 'Save 12%', badge: '' },
  },
  EU: {
    region: 'EU', countryCode: '', currencySymbol: '€', currencyCode: 'EUR',
    note: 'Charged in INR equivalent via Razorpay',
    free:        { label: 'Free', sub: '15 min',   amountInPaise: 0,      savingsNote: '',         badge: '' },
    credit_1hr:  { label: '€8',   sub: '/ hour',   amountInPaise: 73600,  savingsNote: '',         badge: '' },
    credit_3hr:  { label: '€20',  sub: '/ 3 hrs',  amountInPaise: 184000, savingsNote: 'Save 17%', badge: 'BEST VALUE' },
    credit_10hr: { label: '€60',  sub: '/ 10 hrs', amountInPaise: 552000, savingsNote: 'Save 25%', badge: '' },
  },
  US: {
    region: 'US', countryCode: '', currencySymbol: '$', currencyCode: 'USD',
    note: 'Charged in INR equivalent via Razorpay',
    free:        { label: 'Free', sub: '15 min',   amountInPaise: 0,      savingsNote: '',         badge: '' },
    credit_1hr:  { label: '$10',  sub: '/ hour',   amountInPaise: 85000,  savingsNote: '',         badge: '' },
    credit_3hr:  { label: '$25',  sub: '/ 3 hrs',  amountInPaise: 212500, savingsNote: 'Save 17%', badge: 'BEST VALUE' },
    credit_10hr: { label: '$75',  sub: '/ 10 hrs', amountInPaise: 637500, savingsNote: 'Save 25%', badge: '' },
  },
  GULF: {
    region: 'GULF', countryCode: '', currencySymbol: '$', currencyCode: 'USD',
    note: 'Charged in INR equivalent via Razorpay',
    free:        { label: 'Free', sub: '15 min',   amountInPaise: 0,      savingsNote: '',         badge: '' },
    credit_1hr:  { label: '$8',   sub: '/ hour',   amountInPaise: 68000,  savingsNote: '',         badge: '' },
    credit_3hr:  { label: '$20',  sub: '/ 3 hrs',  amountInPaise: 170000, savingsNote: 'Save 17%', badge: 'BEST VALUE' },
    credit_10hr: { label: '$60',  sub: '/ 10 hrs', amountInPaise: 510000, savingsNote: 'Save 25%', badge: '' },
  },
  DEFAULT: {
    region: 'DEFAULT', countryCode: '', currencySymbol: '$', currencyCode: 'USD',
    note: 'Charged in INR equivalent via Razorpay',
    free:        { label: 'Free', sub: '15 min',   amountInPaise: 0,      savingsNote: '',         badge: '' },
    credit_1hr:  { label: '$6',   sub: '/ hour',   amountInPaise: 51000,  savingsNote: '',         badge: '' },
    credit_3hr:  { label: '$15',  sub: '/ 3 hrs',  amountInPaise: 127500, savingsNote: 'Save 17%', badge: 'BEST VALUE' },
    credit_10hr: { label: '$45',  sub: '/ 10 hrs', amountInPaise: 382500, savingsNote: 'Save 12%', badge: '' },
  },
};

// ── Cache to avoid repeated API calls ────────────────────────────────────────
let _cachedPricing: RegionalPricing | null = null;

export async function detectRegionalPricing(): Promise<RegionalPricing> {
  if (_cachedPricing) return _cachedPricing;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000); // 3s timeout
    const res = await fetch('https://ipapi.co/json/', { signal: controller.signal });
    clearTimeout(timeout);
    const data = await res.json();
    const countryCode: string = data.country_code || '';
    const region: Region = COUNTRY_REGION[countryCode] || 'DEFAULT';
    _cachedPricing = { ...PRICING_TABLE[region], countryCode };
    return _cachedPricing;
  } catch {
    // Fallback to India pricing if detection fails (safe default)
    _cachedPricing = { ...PRICING_TABLE['IN'], countryCode: 'IN' };
    return _cachedPricing;
  }
}

export function getDefaultPricing(): RegionalPricing {
  return PRICING_TABLE['IN'];
}
