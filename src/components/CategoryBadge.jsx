import React from 'react';
import { Link } from 'react-router-dom';

export default function CategoryBadge({ name, slug, className = '' }) {
  return (
    <Link to={`/library?category=${slug || ''}`}
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors ${className}`}>
      {name}
    </Link>
  );
}