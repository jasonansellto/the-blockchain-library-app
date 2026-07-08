import React, { useState, useEffect } from "react";
import { Plus, Search, Edit2, Trash2, ExternalLink, Star } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import AuthorForm from "./AuthorForm";

export default function AuthorManager({ onAuthorsChanged }) {
  const { toast } = useToast();
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await base44.entities.Author.list("-updated_date", 200);
      setAuthors(res.results || res || []);
      onAuthorsChanged?.(res.results || res || []);
    } catch (err) {
      toast({ variant: "destructive", title: "Failed to load authors", description: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = authors.filter((a) =>
    !search || a.name.toLowerCase().includes(search.toLowerCase()) ||
    (a.expertise_areas || []).some((e) => e.toLowerCase().includes(search.toLowerCase()))
  );

  const handleSave = async (data) => {
    try {
      if (editing?.id) {
        await base44.entities.Author.update(editing.id, data);
        toast({ title: "Author updated" });
      } else {
        await base44.entities.Author.create(data);
        toast({ title: "Author created" });
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
      await base44.entities.Author.delete(deleteTarget.id);
      toast({ title: "Author deleted" });
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
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search authors..." className="pl-9" />
        </div>
        <Button onClick={() => { setEditing(null); setSheetOpen(true); }}>
          <Plus className="w-4 h-4 mr-2" /> New Author
        </Button>
      </div>

      <div className="border border-slate-200 rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Expertise</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={3} className="text-center text-slate-400 py-8">Loading...</TableCell></TableRow>
            ) : filtered.length === 0 ? (
              <TableRow><TableCell colSpan={3} className="text-center text-slate-400 py-8">No authors found.</TableCell></TableRow>
            ) : (
              filtered.map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {a.photo && <img src={a.photo} alt="" className="w-8 h-8 rounded-full object-cover" />}
                      {a.name}
                      {a.is_featured && <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-slate-500 max-w-xs truncate">{(a.expertise_areas || []).join(", ") || "—"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => { setEditing(a); setSheetOpen(true); }}><Edit2 className="w-4 h-4" /></Button>
                      {a.slug && <a href={`/authors/${a.slug}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center w-9 h-9 rounded-md hover:bg-slate-100"><ExternalLink className="w-4 h-4" /></a>}
                      <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(a)}><Trash2 className="w-4 h-4 text-rose-500" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {!loading && filtered.length > 0 && <p className="text-sm text-slate-400">Showing {filtered.length} of {authors.length} authors</p>}

      <Sheet open={sheetOpen} onOpenChange={(open) => { setSheetOpen(open); if (!open) setEditing(null); }}>
        <SheetContent className="sm:max-w-xl w-full overflow-y-auto" side="right">
          <SheetHeader><SheetTitle>{editing ? "Edit Author" : "New Author"}</SheetTitle></SheetHeader>
          <div className="mt-4">
            <AuthorForm author={editing} onSave={handleSave} onCancel={() => { setSheetOpen(false); setEditing(null); }} />
          </div>
        </SheetContent>
      </Sheet>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete author?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{deleteTarget?.name}". Articles referencing this author will keep the ID but it will no longer resolve.
            </AlertDialogDescription>
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