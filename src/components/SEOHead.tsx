import { useEffect } from 'react';

export interface SEOHeadProps {
  title: string;
  description: string;
  keywords?: string;
  canonical?: string;
  ogType?: 'website' | 'article' | 'product';
  ogImage?: string;
  /**
   * One or more JSON-LD structured-data objects. They are stamped into
   * `<script type="application/ld+json" data-seo="route">` elements that we
   * fully replace each navigation so we never duplicate schema between routes.
   */
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
  /** Set to true to mark the page noindex (e.g. settings/auth screens). */
  noindex?: boolean;
}

const DEFAULT_OG_IMAGE =
  'https://beeptalk.s3.eu-north-1.amazonaws.com/520f487f-051a-47a0-b252-8b12dd857c7d.png';

function setMeta(name: string, content: string, property = false) {
  if (typeof document === 'undefined') return;
  const attr = property ? 'property' : 'name';
  let el = document.querySelector<HTMLMetaElement>(`meta[${attr}="${name}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.content = content;
}

function setLink(rel: string, href: string) {
  if (typeof document === 'undefined') return;
  let link = document.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!link) {
    link = document.createElement('link');
    link.rel = rel;
    document.head.appendChild(link);
  }
  link.href = href;
}

function applyJsonLd(payload: Record<string, unknown> | Record<string, unknown>[] | undefined) {
  if (typeof document === 'undefined') return;
  // Wipe previous SEO-managed JSON-LD (we never want stale schema for the wrong route).
  document
    .querySelectorAll<HTMLScriptElement>('script[data-seo="route"]')
    .forEach((s) => s.remove());
  if (!payload) return;
  const items = Array.isArray(payload) ? payload : [payload];
  for (const item of items) {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.dataset.seo = 'route';
    script.textContent = JSON.stringify(item);
    document.head.appendChild(script);
  }
}

export default function SEOHead({
  title,
  description,
  keywords,
  canonical,
  ogType = 'website',
  ogImage = DEFAULT_OG_IMAGE,
  jsonLd,
  noindex = false,
}: SEOHeadProps) {
  useEffect(() => {
    document.title = title;

    setMeta('description', description);
    setMeta(
      'robots',
      noindex
        ? 'noindex, nofollow'
        : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    );
    if (keywords) setMeta('keywords', keywords);

    setMeta('og:title', title, true);
    setMeta('og:description', description, true);
    setMeta('og:type', ogType, true);
    setMeta('og:image', ogImage, true);
    setMeta('og:site_name', 'HelplyAI', true);

    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:title', title, true);
    setMeta('twitter:description', description, true);
    setMeta('twitter:image', ogImage, true);

    if (canonical) {
      setLink('canonical', canonical);
      setMeta('og:url', canonical, true);
      setMeta('twitter:url', canonical, true);
    }

    applyJsonLd(jsonLd);
  }, [title, description, keywords, canonical, ogType, ogImage, jsonLd, noindex]);

  return null;
}

/* ─── JSON-LD builders (named exports so pages can compose schema cleanly) ── */

export function faqSchema(faqs: { q: string; a: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  };
}

export function breadcrumbSchema(crumbs: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      item: c.url,
    })),
  };
}

export function softwareAppSchema(args: {
  name: string;
  description: string;
  url: string;
  image?: string;
  price?: number;
  priceCurrency?: string;
  ratingValue?: string;
  ratingCount?: string;
  applicationCategory?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: args.name,
    description: args.description,
    url: args.url,
    image: args.image ?? DEFAULT_OG_IMAGE,
    applicationCategory: args.applicationCategory ?? 'BusinessApplication',
    operatingSystem: 'macOS, Windows',
    offers: {
      '@type': 'Offer',
      price: String(args.price ?? 0),
      priceCurrency: args.priceCurrency ?? 'USD',
    },
    author: { '@type': 'Organization', name: 'HelplyAI' },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: args.ratingValue ?? '4.9',
      ratingCount: args.ratingCount ?? '32178',
      bestRating: '5',
    },
  };
}

export function articleSchema(args: {
  headline: string;
  description: string;
  url: string;
  image?: string;
  datePublished?: string;
  dateModified?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: args.headline,
    description: args.description,
    image: args.image ?? DEFAULT_OG_IMAGE,
    author: { '@type': 'Organization', name: 'HelplyAI', url: 'https://www.helplyai.co' },
    publisher: {
      '@type': 'Organization',
      name: 'HelplyAI',
      logo: {
        '@type': 'ImageObject',
        url: 'https://www.helplyai.co/favicon.png',
      },
    },
    datePublished: args.datePublished ?? '2026-01-15',
    dateModified: args.dateModified ?? new Date().toISOString().slice(0, 10),
    mainEntityOfPage: { '@type': 'WebPage', '@id': args.url },
  };
}

export function howToSchema(args: {
  name: string;
  description: string;
  steps: { name: string; text: string }[];
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: args.name,
    description: args.description,
    step: args.steps.map((s, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      name: s.name,
      text: s.text,
    })),
  };
}
