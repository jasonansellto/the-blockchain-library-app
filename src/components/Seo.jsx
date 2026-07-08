import { useEffect } from 'react';

const SITE_NAME = 'The Blockchain Library';
const SITE_URL = 'https://theblockchainlibrary.com';
const DEFAULT_DESC = 'The definitive educational resource for blockchain, cryptocurrency, Web3, AI, and decentralized technology. Thousands of articles, glossary terms, books, and research papers.';
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-default.png`;
const NOINDEX_ROUTES = ['/dashboard', '/admin', '/login', '/register', '/account', '/history'];

function setMeta(attr, key, content) {
  if (!content) return;
  let el = document.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function setLinkRel(rel, href, extraAttrs = {}) {
  let el = document.querySelector(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
  Object.entries(extraAttrs).forEach(([k, v]) => el.setAttribute(k, v));
}

export default function Seo({ title, description, image, type = 'website', schemas = [], robots }) {
  useEffect(() => {
    const fullTitle = title ? `${title} — ${SITE_NAME}` : `${SITE_NAME} — Definitive Blockchain Knowledge`;
    const desc = description || DEFAULT_DESC;
    const urlObj = new URL(window.location.href);
    const pageUrl = urlObj.origin + urlObj.pathname;
    const isNoindex = NOINDEX_ROUTES.some(r => urlObj.pathname.startsWith(r));
    const robotsContent = robots || (isNoindex ? 'noindex, nofollow' : 'index, follow');
    const ogImage = image || DEFAULT_OG_IMAGE;

    document.title = fullTitle;
    setMeta('name', 'description', desc);
    setMeta('name', 'robots', robotsContent);
    setMeta('property', 'og:title', fullTitle);
    setMeta('property', 'og:description', desc);
    setMeta('property', 'og:type', type);
    setMeta('property', 'og:site_name', SITE_NAME);
    setMeta('property', 'og:url', pageUrl);
    setMeta('property', 'og:image', ogImage);
    setMeta('property', 'og:locale', 'en_US');
    setMeta('name', 'twitter:title', fullTitle);
    setMeta('name', 'twitter:description', desc);
    setMeta('name', 'twitter:site', '@theblockchainlibrary');
    setMeta('name', 'twitter:creator', '@theblockchainlibrary');
    setMeta('name', 'twitter:image', ogImage);
    setMeta('name', 'twitter:card', image ? 'summary_large_image' : 'summary');
    setLinkRel('canonical', pageUrl);
    setLinkRel('alternate', pageUrl, { hreflang: 'en' });

    const schemaList = Array.isArray(schemas) ? schemas : [schemas];
    const scriptTags = [];
    schemaList.filter(Boolean).forEach((schema) => {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.setAttribute('data-seo-schema', 'true');
      script.textContent = JSON.stringify(schema);
      document.head.appendChild(script);
      scriptTags.push(script);
    });

    return () => {
      scriptTags.forEach(s => s.remove());
    };
  }, [title, description, image, type, robots, JSON.stringify(schemas)]);

  return null;
}