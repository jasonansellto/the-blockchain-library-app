import React, { useState, useEffect } from "react";
import { Plus, Search, Edit2, Trash2, ExternalLink } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import GlossaryForm from "./GlossaryForm";

export default function GlossaryManager({ categories }) {
  const { toast } = useToast();
  const [terms, setTerms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await base44.entities.GlossaryTerm.list("-updated_date", 200);
      setTerms(res.results || res || []);
    } catch (err) {
      toast({ variant: "destructive", title: "Failed to load glossary terms", description: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = terms.filter((t) => !search || t.title.toLowerCase().includes(search.toLowerCase()));
  const catName = (id) => categories.find((c) => c.id === id)?.name || "—";

  const handleSave = async (data) => {
    try {
      if (editing?.id) {
        await base44.entities.GlossaryTerm.update(editing.id, data);
        toast({ title: "Glossary term updated" });
      } else {
        await base44.entities.GlossaryTerm.create(data);
        toast({ title: "Glossary term created" });
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
      await base44.entities.GlossaryTerm.delete(deleteTarget.id);
      toast({ title: "Glossary term deleted" });
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
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search glossary terms..." className="pl-9" />
        </div>
        <Button onClick={() => { setEditing(null); setSheetOpen(true); }}>
          <Plus className="w-4 h-4 mr-2" /> New Term
        </Button>
      </div>

      <div className="border border-slate-200 rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Difficulty</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={4} className="text-center text-slate-400 py-8">Loading...</TableCell></TableRow>
            ) : filtered.length === 0 ? (
              <TableRow><TableCell colSpan={4} className="text-center text-slate-400 py-8">No glossary terms found.</TableCell></TableRow>
            ) : (
              filtered.map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="font-medium max-w-xs truncate">{t.title}</TableCell>
                  <TableCell className="text-sm text-slate-500">{catName(t.category_id)}</TableCell>
                  <TableCell className="text-sm text-slate-500 capitalize">{t.difficulty || "—"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => { setEditing(t); setSheetOpen(true); }}><Edit2 className="w-4 h-4" /></Button>
                      {t.slug && <a href={`/glossary/${t.slug}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center w-9 h-9 rounded-md hover:bg-slate-100"><ExternalLink className="w-4 h-4" /></a>}
                      <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(t)}><Trash2 className="w-4 h-4 text-rose-500" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {!loading && filtered.length > 0 && <p className="text-sm text-slate-400">Showing {filtered.length} of {terms.length} terms</p>}

      <Sheet open={sheetOpen} onOpenChange={(open) => { setSheetOpen(open); if (!open) setEditing(null); }}>
        <SheetContent className="sm:max-w-2xl w-full overflow-y-auto" side="right">
          <SheetHeader><SheetTitle>{editing ? "Edit Term" : "New Term"}</SheetTitle></SheetHeader>
          <div className="mt-4">
            <GlossaryForm term={editing} categories={categories} onSave={handleSave} onCancel={() => { setSheetOpen(false); setEditing(null); }} />
          </div>
        </SheetContent>
      </Sheet>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete glossary term?</AlertDialogTitle>
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