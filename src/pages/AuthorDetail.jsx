import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { ChevronRight, Twitter, Linkedin, Github, Globe, BookOpen, FileText } from 'lucide-react';
import ArticleCard from '@/components/cards/ArticleCard';

export default function AuthorDetail() {
  const { slug } = useParams();
  const [author, setAuthor] = useState(null);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchAuthor(); }, [slug]);

  const fetchAuthor = async () => {
    setLoading(true);
    try {
      const res = await base44.entities.Author.filter({ slug }, '-updated_date', 1);
      const authors = res.results || res || [];
      if (!authors.length) { setAuthor(null); return; }
      const a = authors[0];
      setAuthor(a);
      try {
        const arts = await base44.entities.Article.filter({ author_id: a.id, status: 'published' }, '-published_date', 12);
        setArticles(arts.results || arts || []);
      } catch (e) {}
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  if (loading) return <div className="flex justify-center py-32"><div className="w-8 h-8 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" /></div>;
  if (!author) return <div className="container-tbl py-32 text-center"><h1 className="text-2xl font-bold text-slate-900 mb-3">Author not found</h1><Link to="/authors" className="text-blue-600 font-medium">Browse authors →</Link></div>;

  const socials = author.social_links || {};
  const hasSocials = socials.twitter || socials.linkedin || socials.github || socials.website;

  return (
    <div>
      <div className="border-b border-slate-100 bg-slate-50">
        <div className="container-tbl py-3">
          <nav className="flex items-center gap-1.5 text-sm text-slate-400">
            <Link to="/" className="hover:text-blue-600">Home</Link><ChevronRight className="w-3.5 h-3.5" />
            <Link to="/authors" className="hover:text-blue-600">Authors</Link><ChevronRight className="w-3.5 h-3.5" />
            <span className="text-slate-700 font-medium truncate">{author.name}</span>
          </nav>
        </div>
      </div>

      <div className="container-tbl py-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 max-w-3xl mb-10">
          <div className="w-24 h-24 rounded-full bg-slate-100 overflow-hidden flex items-center justify-center text-3xl font-bold text-slate-400 shrink-0 ring-4 ring-slate-50">
            {author.photo ? <img src={author.photo} alt={author.name} className="w-full h-full object-cover" /> : author.name?.[0]}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-1">{author.name}</h1>
            {author.expertise_areas?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {author.expertise_areas.map(area => <span key={area} className="px-2.5 py-0.5 text-xs font-medium text-teal-700 bg-teal-50 rounded-full">{area}</span>)}
              </div>
            )}
            {hasSocials && (
              <div className="flex items-center gap-2">
                {socials.twitter && <a href={socials.twitter} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-blue-600 hover:text-white flex items-center justify-center transition-colors"><Twitter className="w-4 h-4" /></a>}
                {socials.linkedin && <a href={socials.linkedin} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-blue-600 hover:text-white flex items-center justify-center transition-colors"><Linkedin className="w-4 h-4" /></a>}
                {socials.github && <a href={socials.github} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-blue-600 hover:text-white flex items-center justify-center transition-colors"><Github className="w-4 h-4" /></a>}
                {socials.website && <a href={socials.website} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-blue-600 hover:text-white flex items-center justify-center transition-colors"><Globe className="w-4 h-4" /></a>}
              </div>
            )}
          </div>
        </div>

        {author.bio && (
          <div className="max-w-3xl mb-10">
            <h2 className="text-lg font-bold text-slate-900 mb-3">Biography</h2>
            <p className="text-slate-600 leading-relaxed">{author.bio}</p>
          </div>
        )}

        {articles.length > 0 && (
          <div>
            <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900 mb-5"><BookOpen className="w-5 h-5 text-blue-600" />Articles by {author.name}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map(a => <ArticleCard key={a.id} article={a} />)}
            </div>
          </div>
        )}

        {articles.length === 0 && (
          <div className="text-center py-16">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-400">No published articles yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}