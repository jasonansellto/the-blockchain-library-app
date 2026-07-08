import { useEffect } from 'react';

const SITE_NAME = 'The Blockchain Library';
const DEFAULT_DESC = 'The definitive educational resource for blockchain, cryptocurrency, Web3, AI, and decentralized technology. Thousands of articles, glossary terms, books, and research papers.';
const LOGO_URL = 'https://theblockchainlibrary.com/logo.png';

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

function setCanonical(url) {
  let el = document.querySelector('link[rel="canonical"]');
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', 'canonical');
    document.head.appendChild(el);
  }
  el.setAttribute('href', url);
}

export default function Seo({ title, description, image, type = 'website', schemas = [] }) {
  useEffect(() => {
    const fullTitle = title ? `${title} — ${SITE_NAME}` : `${SITE_NAME} — Definitive Blockchain Knowledge`;
    const desc = description || DEFAULT_DESC;
    const pageUrl = window.location.href;

    document.title = fullTitle;
    setMeta('name', 'description', desc);
    setMeta('property', 'og:title', fullTitle);
    setMeta('property', 'og:description', desc);
    setMeta('property', 'og:type', type);
    setMeta('property', 'og:site_name', SITE_NAME);
    setMeta('property', 'og:url', pageUrl);
    setMeta('name', 'twitter:title', fullTitle);
    setMeta('name', 'twitter:description', desc);
    if (image) {
      setMeta('property', 'og:image', image);
      setMeta('name', 'twitter:image', image);
      setMeta('name', 'twitter:card', 'summary_large_image');
    } else {
      setMeta('name', 'twitter:card', 'summary');
    }
    setCanonical(pageUrl);

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
  }, [title, description, image, type, JSON.stringify(schemas)]);

  return null;
}