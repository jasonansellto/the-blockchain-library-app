import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import ProtectedRoute from '@/components/ProtectedRoute';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
import Layout from '@/components/layout/Layout';
import Home from '@/pages/Home';
import Library from '@/pages/Library';
import Glossary from '@/pages/Glossary';
import Books from '@/pages/Books';
import Research from '@/pages/Research';
import Learn from '@/pages/Learn';
import ArticleDetail from '@/pages/ArticleDetail';
import GlossaryDetail from '@/pages/GlossaryDetail';
import BookDetail from '@/pages/BookDetail';
import ResearchDetail from '@/pages/ResearchDetail';
import LearningPathDetail from '@/pages/LearningPathDetail';
import SearchPage from '@/pages/SearchPage';
import About from '@/pages/About';
import Contact from '@/pages/Contact';
import Resources from '@/pages/Resources';
import Authors from '@/pages/Authors';
import AuthorDetail from '@/pages/AuthorDetail';
import Dashboard from '@/pages/Dashboard';
import NewsletterArchive from '@/pages/Newsletter';
import NewsletterDetail from '@/pages/NewsletterDetail';
import AIAssistant from '@/pages/AIAssistant';
import History from '@/pages/History';
import AdminLearningPaths from '@/pages/AdminLearningPaths';
import RoleRoute from '@/components/admin/RoleRoute';
// Add page imports here

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/learn" element={<Learn />} />
        <Route path="/learn/:slug" element={<LearningPathDetail />} />
        <Route path="/library" element={<Library />} />
        <Route path="/article/:slug" element={<ArticleDetail />} />
        <Route path="/glossary" element={<Glossary />} />
        <Route path="/glossary/:slug" element={<GlossaryDetail />} />
        <Route path="/books" element={<Books />} />
        <Route path="/books/:slug" element={<BookDetail />} />
        <Route path="/research" element={<Research />} />
        <Route path="/research/:slug" element={<ResearchDetail />} />
        <Route path="/authors" element={<Authors />} />
        <Route path="/authors/:slug" element={<AuthorDetail />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/tools" element={<Resources type="tools" />} />
        <Route path="/developers" element={<Resources type="developers" />} />
        <Route path="/news" element={<Resources type="news" />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/ai-assistant" element={<AIAssistant />} />
        <Route path="/newsletter" element={<NewsletterArchive />} />
        <Route path="/newsletter/:slug" element={<NewsletterDetail />} />
        <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/history" element={<History />} />
          <Route element={<RoleRoute roles={['editor', 'admin']} />}>
            <Route path="/admin/learning-paths" element={<AdminLearningPaths />} />
          </Route>
        </Route>
        <Route path="*" element={<PageNotFound />} />
      </Route>
    </Routes>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <ScrollToTop />
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App