import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import useCyclingText from '@/hooks/useCyclingText';

const SUGGESTIONS = [
  'Search articles, glossary, books, research…',
  'Try "smart contracts"',
  'Try "DeFi"',
  'Try "Ethereum"',
  'Try "NFTs"',
  'Try "zero-knowledge proofs"',
  'Try "wallet security"',
];

export default function SearchBar({ size = 'lg', placeholder }) {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const cyclingPlaceholder = useCyclingText(SUGGESTIONS);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) navigate(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  const sizes = {
    lg: 'pl-14 pr-32 py-5 text-lg',
    md: 'pl-12 pr-28 py-3.5 text-base',
    sm: 'pl-10 pr-4 py-2.5 text-sm',
  };

  const iconSizes = { lg: 'w-6 h-6 left-5', md: 'w-5 h-5 left-4', sm: 'w-4 h-4 left-3' };

  return (
    <form onSubmit={handleSubmit} className="relative w-full">
      <Search className={`absolute top-1/2 -translate-y-1/2 text-slate-400 ${iconSizes[size]}`} />
      <input type="text" value={query} onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder || cyclingPlaceholder}
        className={`w-full ${sizes[size]} bg-white border border-slate-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 placeholder:text-slate-400`} />
      {size !== 'sm' && (
        <button type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
          Search
        </button>
      )}
    </form>
  );
}