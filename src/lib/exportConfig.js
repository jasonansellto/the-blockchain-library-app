import { BookText, FileText, BookOpen, GraduationCap, Map, Server, Code, Network, Users, FolderTree, Newspaper, Mail } from 'lucide-react';

// Frontend mirror of the backend CONTENT_TYPES config (display only).
export const EXPORT_CONTENT_TYPES = [
  { key: 'glossary', label: 'Glossary', file: 'glossary.json', Icon: BookText },
  { key: 'articles', label: 'Articles / Topics', file: 'articles.json', Icon: FileText },
  { key: 'books', label: 'Books', file: 'books.json', Icon: BookOpen },
  { key: 'research', label: 'Research', file: 'research.json', Icon: GraduationCap },
  { key: 'learning-paths', label: 'Learning Paths', file: 'learning-paths.json', Icon: Map },
  { key: 'resources', label: 'Developer Resources', file: 'resources.json', Icon: Server },
  { key: 'code-snippets', label: 'Code Snippets', file: 'code-examples.json', Icon: Code },
  { key: 'rpc', label: 'RPC Endpoints', file: 'rpc.json', Icon: Network },
  { key: 'authors', label: 'Authors', file: 'authors.json', Icon: Users },
  { key: 'categories', label: 'Categories', file: 'categories.json', Icon: FolderTree },
  { key: 'news', label: 'News', file: 'news.json', Icon: Newspaper },
  { key: 'newsletters', label: 'Newsletters', file: 'newsletters.json', Icon: Mail },
];