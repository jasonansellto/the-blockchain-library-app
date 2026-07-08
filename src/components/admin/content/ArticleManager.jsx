import React, { useState, useEffect } from "react";
import { Plus, Search, Edit2, Trash2, ExternalLink } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import ArticleForm from "./ArticleForm";

const STATUS_STYLES = {
  draft: "bg-slate-100 text-slate-600",
  pending: "bg-amber-100 text-amber-700",
  published: "bg-green-100 text-green-700",
  archived: "bg-rose-100 text-rose-700",
};

export default function ArticleManager({ categories, authors }) {
  const { toast } = useToast();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await base44.entities.Article.list("-updated_date", 200);
      setArticles(res.results || res || []);
    } catch (err) {
      toast({ variant: "destructive", title: "Failed to load articles", description: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = articles.filter((a) => {
    const matchesSearch = !search || a.title.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || a.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const catName = (id) => categories.find((c) => c.id === id)?.name || "—";

  const handleSave = async (data) => {
    try {
      if (editing?.id) {
        await base44.entities.Article.update(editing.id, data);
        toast({ title: "Article updated" });
      } else {
        await base44.entities.Article.create(data);
        toast({ title: "Article created" });
      }
      setSheetOpen(false);
      setEditing(null);
      load();
    } catch (err) {
      toast({ variant: "destructive", title: "Failed to save", description: err.message });
      throw err;
    }
  };

  const handleDelete = async () => {
    try {
      await base44.entities.Article.delete(deleteTarget.id);
      toast({ title: "Article deleted" });
      setDeleteTarget(null);
      load();
    } catch (err) {
      toast({ variant: "destructive", title: "Failed to delete", description: err.message });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search articles..." className="pl-9" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white">
          <option value="all">All statuses</option>
          <option value="draft">Draft</option>
          <option value="pending">Pending</option>
          <option value="published">Published</option>
          <option value="archived">Archived</option>
        </select>
        <Button onClick={() => { setEditing(null); setSheetOpen(true); }}>
          <Plus className="w-4 h-4 mr-2" /> New Article
        </Button>
      </div>

      <div className="border border-slate-200 rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Difficulty</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={5} className="text-center text-slate-400 py-8">Loading...</TableCell></TableRow>
            ) : filtered.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center text-slate-400 py-8">No articles found.</TableCell></TableRow>
            ) : (
              filtered.map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="font-medium max-w-xs truncate">
                    {a.title}
                    {a.access_level === "premium" && <span className="ml-2 text-xs text-amber-600">★</span>}
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_STYLES[a.status] || STATUS_STYLES.draft}`}>{a.status}</span>
                  </TableCell>
                  <TableCell className="text-sm text-slate-500">{catName(a.category_id)}</TableCell>
                  <TableCell className="text-sm text-slate-500 capitalize">{a.difficulty || "—"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => { setEditing(a); setSheetOpen(true); }}><Edit2 className="w-4 h-4" /></Button>
                      {a.status === "published" && a.slug && (
                        <a href={`/article/${a.slug}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center w-9 h-9 rounded-md hover:bg-slate-100"><ExternalLink className="w-4 h-4" /></a>
                      )}
                      <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(a)}><Trash2 className="w-4 h-4 text-rose-500" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {!loading && filtered.length > 0 && <p className="text-sm text-slate-400">Showing {filtered.length} of {articles.length} articles</p>}

      <Sheet open={sheetOpen} onOpenChange={(open) => { setSheetOpen(open); if (!open) setEditing(null); }}>
        <SheetContent className="sm:max-w-2xl w-full overflow-y-auto" side="right">
          <SheetHeader><SheetTitle>{editing ? "Edit Article" : "New Article"}</SheetTitle></SheetHeader>
          <div className="mt-4">
            <ArticleForm article={editing} categories={categories} authors={authors} onSave={handleSave} onCancel={() => { setSheetOpen(false); setEditing(null); }} />
          </div>
        </SheetContent>
      </Sheet>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete article?</AlertDialogTitle>
            <AlertDialogDescription>This will permanently delete "{deleteTarget?.title}". This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-rose-600 hover:bg-rose-700">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}