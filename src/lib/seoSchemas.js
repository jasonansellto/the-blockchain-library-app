import { pathEstimatedTime } from '@/lib/duration';

const SITE_URL = typeof window !== 'undefined' ? window.location.origin : 'https://theblockchainlibrary.com';
const SITE_NAME = 'The Blockchain Library';
const LOGO_URL = `${SITE_URL}/logo.png`;

export function buildOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": SITE_NAME,
    "url": SITE_URL,
    "logo": { "@type": "ImageObject", "url": LOGO_URL },
    "description": "The definitive educational resource for blockchain, cryptocurrency, Web3, AI, and decentralized technology.",
    "sameAs": []
  };
}

export function buildWebSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": SITE_NAME,
    "url": SITE_URL,
    "description": "The definitive educational resource for blockchain, cryptocurrency, Web3, AI, and decentralized technology.",
    "potentialAction": {
      "@type": "SearchAction",
      "target": `${SITE_URL}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string"
    }
  };
}

export function buildBreadcrumbSchema(items) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, i) => ({
      "@type": "ListItem",
      "position": i + 1,
      "name": item.name,
      ...(item.url ? { "item": `${SITE_URL}${item.url}` } : {})
    }))
  };
}

export function buildCollectionPageSchema(name, description, url, items = []) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": name,
    "description": description,
    "url": `${SITE_URL}${url}`,
    "isPartOf": { "@type": "WebSite", "name": SITE_NAME, "url": SITE_URL }
  };
  if (items.length > 0) {
    schema.mainEntity = {
      "@type": "ItemList",
      "numberOfItems": items.length,
      "itemListElement": items.slice(0, 10).map((item, i) => ({
        "@type": "ListItem",
        "position": i + 1,
        "url": `${SITE_URL}${item.url}`,
        "name": item.name
      }))
    };
  }
  return schema;
}

export function buildArticleSchema(article, author, category) {
  const wordCount = article.body ? article.body.split(/\s+/).length : 0;
  const schema = {
    "@context": "https://schema.org",
    "@type": ["Article", "BlogPosting"],
    "headline": article.title,
    "description": article.summary || '',
    "url": `${SITE_URL}/article/${article.slug}`,
    "mainEntityOfPage": { "@type": "WebPage", "@id": `${SITE_URL}/article/${article.slug}` },
    "inLanguage": article.language || 'en',
    "publisher": { "@type": "Organization", "name": SITE_NAME, "logo": { "@type": "ImageObject", "url": LOGO_URL } },
    "speakable": { "@type": "SpeakableSpecification", "cssSelector": ["#article-summary", "h2:first-of-type"] }
  };
  if (article.featured_image || article.og_image) schema.image = article.featured_image || article.og_image;
  if (article.published_date) schema.datePublished = article.published_date;
  if (article.updated_date) schema.dateModified = article.updated_date;
  if (wordCount > 0) schema.wordCount = wordCount;
  if (author) schema.author = { "@type": "Person", "name": author.name };
  if (category) schema.articleSection = category.name;
  if (article.tags?.length) schema.keywords = article.tags.join(', ');
  if (article.reading_time) schema.timeRequired = `PT${article.reading_time}M`;
  return schema;
}

export function buildFAQSchema(faqs) {
  if (!faqs?.length) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(f => ({
      "@type": "Question",
      "name": f.question,
      "acceptedAnswer": { "@type": "Answer", "text": f.answer }
    }))
  };
}

export function buildGlossaryFAQSchema(term) {
  const faqs = [];
  if (term.definition) faqs.push({ question: `What is ${term.title}?`, answer: term.definition });
  if (term.how_it_works) faqs.push({ question: `How does ${term.title} work?`, answer: term.how_it_works });
  if (term.why_it_matters) faqs.push({ question: `Why does ${term.title} matter?`, answer: term.why_it_matters });
  if (term.advantages?.length) faqs.push({ question: `What are the advantages of ${term.title}?`, answer: term.advantages.join('. ') });
  if (term.limitations?.length) faqs.push({ question: `What are the limitations of ${term.title}?`, answer: term.limitations.join('. ') });
  if (faqs.length === 0) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(f => ({
      "@type": "Question",
      "name": f.question,
      "acceptedAnswer": { "@type": "Answer", "text": f.answer }
    }))
  };
}

export function buildBookSchema(book, authors) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Book",
    "name": book.title,
    "description": book.description || book.subtitle || '',
    "url": `${SITE_URL}/books/${book.slug}`,
    "author": (authors || []).map(a => ({ "@type": "Person", "name": a.name })),
    "publisher": { "@type": "Organization", "name": book.publisher || SITE_NAME },
    "inLanguage": book.language || 'en'
  };
  if (book.subtitle) schema.alternativeHeadline = book.subtitle;
  if (book.isbn) schema.isbn = book.isbn;
  if (book.publication_year) schema.datePublished = String(book.publication_year);
  if (book.pages) schema.numberOfPages = book.pages;
  if (book.cover) schema.image = book.cover;
  if (book.rating > 0 && book.reviews?.length > 0) {
    schema.aggregateRating = { "@type": "AggregateRating", "ratingValue": book.rating, "bestRating": 5, "ratingCount": book.reviews.length };
  }
  const offers = [];
  if (book.amazon_link) offers.push({ "@type": "Offer", "url": book.amazon_link, "availability": "https://schema.org/InStock", "seller": { "@type": "Organization", "name": "Amazon" } });
  if (book.amazon_kindle_link) offers.push({ "@type": "Offer", "url": book.amazon_kindle_link, "availability": "https://schema.org/InStock", "seller": { "@type": "Organization", "name": "Amazon Kindle" } });
  if (offers.length > 0) schema.offers = offers;
  if (book.isbn) schema.workExample = { "@type": "Book", "isbn": book.isbn, "bookFormat": "https://schema.org/Paperback" };
  return schema;
}

export function buildScholarlyArticleSchema(paper) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "ScholarlyArticle",
    "headline": paper.title,
    "description": paper.abstract || '',
    "url": `${SITE_URL}/research/${paper.slug}`,
    "author": (paper.authors || []).map(a => ({ "@type": "Person", "name": a })),
    "publisher": { "@type": "Organization", "name": paper.publication || SITE_NAME },
    "inLanguage": paper.language || 'en'
  };
  if (paper.doi) { schema.sameAs = `https://doi.org/${paper.doi}`; schema.citation = `https://doi.org/${paper.doi}`; }
  if (paper.publication_date) schema.datePublished = paper.publication_date;
  if (paper.pdf_url) schema.mainEntityOfPage = paper.pdf_url;
  if (paper.citations_count > 0) schema.citationCount = paper.citations_count;
  if (paper.publication) schema.academicSubject = paper.publication;
  return schema;
}

export function buildDefinedTermSchema(term) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "DefinedTerm",
    "name": term.title,
    "description": term.simple_explanation || term.definition,
    "url": `${SITE_URL}/glossary/${term.slug}`,
    "inDefinedTermSet": { "@type": "DefinedTermSet", "name": "Blockchain Glossary", "url": `${SITE_URL}/glossary` },
    "inLanguage": term.language || 'en',
    "speakable": { "@type": "SpeakableSpecification", "cssSelector": ["#definition", "#simple-explanation"] }
  };
  if (term.internal_id) schema.termCode = term.internal_id;
  if (term.examples?.length) schema.usageExample = term.examples.join(' ');
  if (term.subcategory) schema.additionalType = term.subcategory;
  return schema;
}

export function buildPersonSchema(author) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": author.name,
    "url": `${SITE_URL}/authors/${author.slug}`,
    "description": author.bio || ''
  };
  if (author.photo) schema.image = author.photo;
  if (author.expertise_areas?.length) schema.knowsAbout = author.expertise_areas;
  const sameAs = [];
  const sl = author.social_links || {};
  if (sl.twitter) sameAs.push(sl.twitter);
  if (sl.linkedin) sameAs.push(sl.linkedin);
  if (sl.github) sameAs.push(sl.github);
  if (sl.website) sameAs.push(sl.website);
  if (sameAs.length > 0) schema.sameAs = sameAs;
  return schema;
}

export function buildCourseSchema(path, category) {
  const estimatedTime = pathEstimatedTime(path);
  const schema = {
    "@context": "https://schema.org",
    "@type": "Course",
    "name": path.title,
    "description": path.description || '',
    "url": `${SITE_URL}/learn/${path.slug}`,
    "provider": { "@type": "Organization", "name": SITE_NAME, "sameAs": SITE_URL },
    "inLanguage": path.language || 'en'
  };
  if (estimatedTime) schema.timeRequired = estimatedTime;
  if (category) schema.about = { "@type": "Thing", "name": category.name };
  if (path.difficulty) {
    const prereqMap = { beginner: '', intermediate: 'Basic understanding of blockchain fundamentals', advanced: 'Solid understanding of blockchain, smart contracts, and DeFi', expert: 'Deep technical knowledge of blockchain architecture and development' };
    if (prereqMap[path.difficulty]) schema.coursePrerequisites = prereqMap[path.difficulty];
  }
  if (path.lessons?.length) {
    schema.hasCourseInstance = { "@type": "CourseInstance", "courseMode": "online", "courseWorkload": estimatedTime || `PT${path.lessons.length * 15}M` };
  }
  return schema;
}