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

export function buildCollectionPageSchema(name, description, url) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": name,
    "description": description,
    "url": `${SITE_URL}${url}`,
    "isPartOf": { "@type": "WebSite", "name": SITE_NAME, "url": SITE_URL }
  };
}

export function buildArticleSchema(article, author, category) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": article.title,
    "description": article.summary || '',
    "url": `${SITE_URL}/article/${article.slug}`,
    "mainEntityOfPage": { "@type": "WebPage", "@id": `${SITE_URL}/article/${article.slug}` },
    "publisher": {
      "@type": "Organization",
      "name": SITE_NAME,
      "logo": { "@type": "ImageObject", "url": LOGO_URL }
    }
  };
  if (article.featured_image) schema.image = article.featured_image;
  if (article.published_date) schema.datePublished = article.published_date;
  if (article.updated_date) schema.dateModified = article.updated_date;
  if (author) schema.author = { "@type": "Person", "name": author.name };
  if (category) schema.articleSection = category.name;
  if (article.tags?.length) schema.keywords = article.tags.join(', ');
  if (article.reading_time) {
    schema.timeRequired = `PT${article.reading_time}M`;
  }
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

export function buildBookSchema(book, authors) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Book",
    "name": book.title,
    "description": book.description || book.subtitle || '',
    "url": `${SITE_URL}/books/${book.slug}`,
    "author": (authors || []).map(a => ({ "@type": "Person", "name": a.name })),
    "publisher": { "@type": "Organization", "name": book.publisher || SITE_NAME }
  };
  if (book.subtitle) schema.alternativeHeadline = book.subtitle;
  if (book.isbn) schema.isbn = book.isbn;
  if (book.publication_year) schema.datePublished = String(book.publication_year);
  if (book.pages) schema.numberOfPages = book.pages;
  if (book.language) schema.inLanguage = book.language;
  if (book.cover) schema.image = book.cover;
  if (book.rating > 0) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      "ratingValue": book.rating,
      "bestRating": 5,
      "ratingCount": book.reviews?.length || 1
    };
  }
  if (book.amazon_link) {
    schema.offers = {
      "@type": "Offer",
      "url": book.amazon_link,
      "availability": "https://schema.org/InStock"
    };
  }
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
    "publisher": { "@type": "Organization", "name": paper.publication || SITE_NAME }
  };
  if (paper.doi) schema.sameAs = `https://doi.org/${paper.doi}`;
  if (paper.publication_date) schema.datePublished = paper.publication_date;
  if (paper.pdf_url) schema.mainEntityOfPage = paper.pdf_url;
  if (paper.citations_count > 0) {
    schema.citationCount = paper.citations_count;
  }
  return schema;
}

export function buildDefinedTermSchema(term) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "DefinedTerm",
    "name": term.title,
    "description": term.definition,
    "url": `${SITE_URL}/glossary/${term.slug}`,
    "inDefinedTermSet": { "@type": "DefinedTermSet", "name": "Blockchain Glossary", "url": `${SITE_URL}/glossary` }
  };
  if (term.examples?.length) {
    schema.usageExample = term.examples.join(' ');
  }
  return schema;
}

export function buildCourseSchema(path, category) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Course",
    "name": path.title,
    "description": path.description || '',
    "url": `${SITE_URL}/learn/${path.slug}`,
    "provider": { "@type": "Organization", "name": SITE_NAME, "sameAs": SITE_URL }
  };
  if (path.estimated_time) schema.timeRequired = path.estimated_time;
  if (category) schema.about = { "@type": "Thing", "name": category.name };
  if (path.lessons?.length) {
    schema.hasCourseInstance = {
      "@type": "CourseInstance",
      "courseMode": "online",
      "courseWorkload": path.estimated_time || `PT${path.lessons.length * 15}M`
    };
  }
  return schema;
}