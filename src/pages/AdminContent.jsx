import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, BookOpen, Users } from "lucide-react";
import ArticleManager from "@/components/admin/content/ArticleManager";
import GlossaryManager from "@/components/admin/content/GlossaryManager";
import AuthorManager from "@/components/admin/content/AuthorManager";
import ResearchManager from "@/components/admin/content/ResearchManager";
import Seo from "@/components/Seo";

export default function AdminContent() {
  const [categories, setCategories] = useState([]);
  const [authors, setAuthors] = useState([]);

  useEffect(() => {
    const loadShared = async () => {
      try {
        const [catRes, authRes] = await Promise.all([
          base44.entities.Category.list("sort_order", 200),
          base44.entities.Author.list("-updated_date", 200),
        ]);
        setCategories(catRes.results || catRes || []);
        setAuthors(authRes.results || authRes || []);
      } catch (err) {
        console.error("Failed to load shared data:", err);
      }
    };
    loadShared();
  }, []);

  return (
    <div className="container-tbl py-8">
      <Seo title="Content Management" robots="noindex, nofollow" />
      <div className="flex gap-2 mb-6 text-sm">
        <a href="/admin/content" className="px-3 py-1.5 rounded-lg bg-blue-600 text-white font-medium">Content</a>
        <a href="/admin/seo" className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-50">SEO Dashboard</a>
        <a href="/admin/learning-paths" className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-50">Learning Paths</a>
        <a href="/admin/revisions" className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-50">Revisions</a>
      </div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Content Management</h1>
        <p className="text-slate-500 mt-1">Create and edit articles, glossary terms, and authors — no code needed.</p>
      </div>

      <Tabs defaultValue="articles">
        <TabsList className="mb-6">
          <TabsTrigger value="articles" className="gap-2"><FileText className="w-4 h-4" /> Articles</TabsTrigger>
          <TabsTrigger value="glossary" className="gap-2"><BookOpen className="w-4 h-4" /> Glossary</TabsTrigger>
          <TabsTrigger value="authors" className="gap-2"><Users className="w-4 h-4" /> Authors</TabsTrigger>
          <TabsTrigger value="research" className="gap-2"><FileText className="w-4 h-4" /> Research</TabsTrigger>
        </TabsList>
        <TabsContent value="articles">
          <ArticleManager categories={categories} authors={authors} />
        </TabsContent>
        <TabsContent value="glossary">
          <GlossaryManager categories={categories} />
        </TabsContent>
        <TabsContent value="authors">
          <AuthorManager onAuthorsChanged={setAuthors} />
        </TabsContent>
        <TabsContent value="research">
          <ResearchManager categories={categories} />
        </TabsContent>
      </Tabs>
    </div>
  );
}