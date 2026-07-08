import React, { useState } from 'react';
import { Quote, Copy, Check, ChevronDown } from 'lucide-react';

function generateCitations(data) {
  const { type, title, authors, date, url, siteName = 'The Blockchain Library', publisher, publicationYear, isbn, doi, publication } = data;
  const authorStr = Array.isArray(authors) && authors.length > 0 ? authors.join(', ') : (authors || siteName);
  const year = date ? new Date(date).getFullYear() : (publicationYear || new Date().getFullYear());
  const dateStr = date ? new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '';
  const c = {};

  if (type === 'article') {
    c.APA = `${authorStr} (${year}). ${title}. ${siteName}. ${url}`;
    c.MLA = `${authorStr}. "${title}." ${siteName}, ${dateStr}, ${url}.`;
    c.Chicago = `${authorStr}. "${title}." ${siteName}. ${dateStr}. ${url}.`;
  } else if (type === 'book') {
    c.APA = `${authorStr} (${year}). ${title}${publisher ? `. ${publisher}` : ''}${isbn ? `. ISBN ${isbn}` : ''}.`;
    c.MLA = `${authorStr}. ${title}. ${publisher || siteName}, ${year}.`;
    c.Chicago = `${authorStr}. ${title}. ${publisher || ''}, ${year}.`;
  } else if (type === 'research') {
    c.APA = `${authorStr} (${year}). ${title}. ${publication || ''}${doi ? `. https://doi.org/${doi}` : ''}`;
    c.MLA = `${authorStr}. "${title}." ${publication || ''}, ${year}${doi ? `, doi:${doi}` : ''}.`;
    c.Chicago = `${authorStr}. "${title}." ${publication || ''} (${year})${doi ? `. doi:${doi}` : ''}.`;
  } else if (type === 'glossary') {
    c.APA = `${siteName} (${year}). ${title}. In ${siteName} Glossary. ${url}`;
    c.MLA = `"${title}." ${siteName} Glossary, ${siteName}, ${dateStr}, ${url}.`;
    c.Chicago = `${siteName}. "${title}." In ${siteName} Glossary. ${dateStr}. ${url}.`;
  } else {
    c.APA = `${siteName} (${year}). ${title}. ${url}`;
    c.MLA = `${siteName}. "${title}." ${dateStr}, ${url}.`;
    c.Chicago = `${siteName}. "${title}." ${dateStr}. ${url}.`;
  }

  const key = (authorStr.split(',')[0] || 'anon').toLowerCase().replace(/[^a-z]/g, '') + year;
  const bibtexType = type === 'book' ? 'book' : type === 'research' ? 'article' : 'misc';
  c.BibTeX = `@${bibtexType}{${key},
  title = {${title}},
  author = {${authorStr}},${date ? `\n  year = {${year}},` : ''}${url ? `\n  url = {${url}},` : ''}${publisher ? `\n  publisher = {${publisher}},` : ''}${isbn ? `\n  isbn = {${isbn}},` : ''}${doi ? `\n  doi = {${doi}},` : ''}${publication ? `\n  journal = {${publication}},` : ''}
}`;

  const risType = type === 'book' ? 'BOOK' : type === 'research' ? 'JOUR' : 'ELEC';
  c.RIS = `TY  - ${risType}
TI  - ${title}
AU  - ${authorStr}
PY  - ${year}
UR  - ${url}${publisher ? `\nPB  - ${publisher}` : ''}${doi ? `\nDO  - ${doi}` : ''}${publication ? `\nJO  - ${publication}` : ''}
ER  -`;

  return c;
}

export default function CitationBox({ type, title, authors, date, url, siteName, publisher, publicationYear, isbn, doi, publication }) {
  const [expanded, setExpanded] = useState(false);
  const [activeFormat, setActiveFormat] = useState('APA');
  const [copied, setCopied] = useState(false);

  const citations = generateCitations({ type, title, authors, date, url, siteName, publisher, publicationYear, isbn, doi, publication });
  const formats = ['APA', 'MLA', 'Chicago', 'BibTeX', 'RIS'];

  const handleCopy = () => {
    navigator.clipboard?.writeText(citations[activeFormat]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mt-8">
      <button onClick={() => setExpanded(!expanded)}
        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
        <Quote className="w-4 h-4" /> Cite this page
        <ChevronDown className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`} />
      </button>
      {expanded && (
        <div className="mt-4 p-5 bg-white border border-slate-200 rounded-xl">
          <div className="flex flex-wrap gap-1.5 mb-3">
            {formats.map(f => (
              <button key={f} onClick={() => setActiveFormat(f)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${activeFormat === f ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                {f}
              </button>
            ))}
            <button onClick={handleCopy}
              className="ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">
              {copied ? <><Check className="w-3.5 h-3.5" /> Copied</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
            </button>
          </div>
          <pre className="p-4 bg-slate-50 border border-slate-100 rounded-lg text-xs text-slate-700 font-mono whitespace-pre-wrap break-words leading-relaxed">{citations[activeFormat]}</pre>
        </div>
      )}
    </div>
  );
}