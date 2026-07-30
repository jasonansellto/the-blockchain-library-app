import React from 'react';
import { FileText } from 'lucide-react';

export default function BookEditions({ book }) {
  const rows = [];
  if (book.isbn_ebook) rows.push({ format: 'eBook', isbn: book.isbn_ebook, asin: book.kindle_asin });
  if (book.isbn_paperback) rows.push({ format: 'Paperback', isbn: book.isbn_paperback, asin: null });
  if (book.isbn_hardcover) rows.push({ format: 'Hardcover', isbn: book.isbn_hardcover, asin: null });
  if (book.isbn_audiobook) rows.push({ format: 'Audiobook', isbn: book.isbn_audiobook, asin: book.audible_asin });
  if (!rows.length) return null;

  return (
    <div className="mt-12 max-w-3xl">
      <h2 className="text-xl font-bold text-slate-900 mb-1 tracking-tight flex items-center gap-2">
        <FileText className="w-5 h-5 text-blue-600" /> Editions &amp; Identifiers
      </h2>
      <p className="text-sm text-slate-500 mb-4">ISBN and ASIN references for each available edition.</p>
      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="text-left font-semibold text-slate-700 px-4 py-3">Edition</th>
              <th className="text-left font-semibold text-slate-700 px-4 py-3">ISBN-13</th>
              <th className="text-left font-semibold text-slate-700 px-4 py-3">ASIN</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-t border-slate-100">
                <td className="px-4 py-3 font-medium text-slate-900">{r.format}</td>
                <td className="px-4 py-3 text-slate-600 font-mono">{r.isbn}</td>
                <td className="px-4 py-3 text-slate-600 font-mono">{r.asin || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}