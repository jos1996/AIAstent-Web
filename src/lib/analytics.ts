declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

/** Must match Web stream Measurement ID in GA4 Admin (Admin → Data streams → your stream). */
export const GA_MEASUREMENT_ID =
  (typeof import.meta.env.VITE_GA_MEASUREMENT_ID === 'string' &&
    import.meta.env.VITE_GA_MEASUREMENT_ID.trim()) ||
  'G-T3T0N5C7YG'

function gtag(...args: unknown[]) {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    (window.gtag as (...args: unknown[]) => void)(...args);
  }
}

export function trackEvent(eventName: string, params?: Record<string, unknown>) {
  gtag('event', eventName, params ?? {});
}

/**
 * SPA navigations: GA4 expects a `page_view` event with path + URL (initial load uses gtag config in index.html).
 */
export function trackPageView(pagePath: string, pageTitle?: string) {
  if (typeof window === 'undefined') return;
  gtag('event', 'page_view', {
    page_path: pagePath,
    page_title: pageTitle ?? document.title,
    page_location: window.location.href,
  });
}

// ─── Auth Events ───────────────────────────────────────────────
export function trackSignUp(method = 'email') {
  trackEvent('sign_up', { method });
}

export function trackLogin(method = 'email') {
  trackEvent('login', { method });
}

export function trackLogout() {
  trackEvent('logout');
}

// ─── Download Events ───────────────────────────────────────────
export function trackDownload(platform: 'mac_apple_silicon' | 'mac_intel' | 'windows_msi' | 'windows_nsis') {
  trackEvent('download', { platform, event_category: 'downloads' });
}

// ─── CTA / Navigation Events ───────────────────────────────────
export function trackCTAClick(label: string, location: string) {
  trackEvent('cta_click', { label, location, event_category: 'engagement' });
}

export function trackNavClick(item: string) {
  trackEvent('nav_click', { item, event_category: 'navigation' });
}

// ─── Payment / Billing Events ──────────────────────────────────
export function trackUpgradeClick(source: string) {
  trackEvent('upgrade_click', { source, event_category: 'monetization' });
}

export function trackPlanSelected(plan: string) {
  trackEvent('plan_selected', { plan, event_category: 'monetization' });
}

export function trackPaymentStarted(plan: string) {
  trackEvent('begin_checkout', { plan, event_category: 'monetization' });
}

export function trackPaymentCompleted(plan: string, value: number, currency = 'INR') {
  trackEvent('purchase', { plan, value, currency, event_category: 'monetization' });
}

// ─── Job Search Events ─────────────────────────────────────────
export function trackJobSearch(query: string, location: string, resultsCount: number) {
  trackEvent('job_search', { query, location, results_count: resultsCount, event_category: 'job_search' });
}

export function trackJobSaved(jobTitle: string, company: string) {
  trackEvent('job_saved', { job_title: jobTitle, company, event_category: 'job_search' });
}

export function trackJobApplied(jobTitle: string, company: string, platform: string) {
  trackEvent('job_applied', { job_title: jobTitle, company, platform, event_category: 'job_search' });
}

export function trackJobViewed(jobTitle: string, company: string) {
  trackEvent('job_viewed', { job_title: jobTitle, company, event_category: 'job_search' });
}

// ─── Content Events ────────────────────────────────────────────
export function trackBlogRead(slug: string, title: string) {
  trackEvent('blog_read', { slug, title, event_category: 'content' });
}

export function trackVideoPlayed() {
  trackEvent('video_play', { video_name: 'hero_demo', event_category: 'content' });
}

export function trackVideoPaused() {
  trackEvent('video_pause', { video_name: 'hero_demo', event_category: 'content' });
}

// ─── Feature Events ────────────────────────────────────────────
export function trackReferralShared() {
  trackEvent('referral_shared', { event_category: 'engagement' });
}

export function trackResumeUploaded() {
  trackEvent('resume_uploaded', { event_category: 'engagement' });
}

export function trackSettingsOpened(tab: string) {
  trackEvent('settings_opened', { tab, event_category: 'engagement' });
}
