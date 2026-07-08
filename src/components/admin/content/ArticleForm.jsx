import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Save } from "lucide-react";
import StringListEditor from "./StringListEditor";
import FaqEditor from "./FaqEditor";
import ImageInput from "./ImageInput";

const DIFFICULTIES = ["beginner", "intermediate", "advanced", "expert"];
const STATUSES = ["draft", "pending", "published", "archived"];
const VISIBILITIES = ["public", "unlisted", "private"];

function slugify(text) {
  return text.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "");
}

export default function ArticleForm({ article, categories, authors, onSave, onCancel }) {
  const [data, setData] = useState(article || {
    title: "", slug: "", summary: "", body: "", status: "draft",
    difficulty: "beginner", access_level: "public", visibility: "public",
    is_featured: false, tags: [], key_takeaways: [], faq: [],
    category_id: "", author_ids: [], featured_image: "",
    published_date: "", seo_title: "", seo_description: "",
    og_image: "", reading_time: 5, language: "en",
  });
  const [saving, setSaving] = useState(false);
  const [slugEdited, setSlugEdited] = useState(!!article?.slug);

  const update = (field, val) => setData((prev) => ({ ...prev, [field]: val }));
  const onTitleChange = (val) => { update("title", val); if (!slugEdited) update("slug", slugify(val)); };
  const onStatusChange = (val) => {
    update("status", val);
    if (val === "published" && !data.published_date) update("published_date", new Date().toISOString().split("T")[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try { await onSave(data); } catch { /* handled by parent */ } finally { setSaving(false); }
  };

  const wordCount = (data.body || "").trim().split(/\s+/).filter(Boolean).length;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Accordion type="multiple" defaultValue={["basic"]} className="w-full">
        <AccordionItem value="basic">
          <AccordionTrigger>Basic Information</AccordionTrigger>
          <AccordionContent className="space-y-4 pt-4">
            <div><Label>Title *</Label><Input value={data.title} onChange={(e) => onTitleChange(e.target.value)} required className="mt-1" /></div>
            <div><Label>Slug *</Label><Input value={data.slug} onChange={(e) => { update("slug", e.target.value); setSlugEdited(true); }} required className="mt-1 font-mono text-sm" /></div>
            <div><Label>Summary</Label><Textarea value={data.summary || ""} onChange={(e) => update("summary", e.target.value)} rows={2} className="mt-1" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Status</Label><Select value={data.status} onValueChange={onStatusChange}><SelectTrigger className="mt-1 capitalize"><SelectValue /></SelectTrigger><SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}</SelectContent></Select></div>
              <div><Label>Difficulty</Label><Select value={data.difficulty} onValueChange={(v) => update("difficulty", v)}><SelectTrigger className="mt-1 capitalize"><SelectValue /></SelectTrigger><SelectContent>{DIFFICULTIES.map((d) => <SelectItem key={d} value={d} className="capitalize">{d}</SelectItem>)}</SelectContent></Select></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Access Level</Label><Select value={data.access_level} onValueChange={(v) => update("access_level", v)}><SelectTrigger className="mt-1 capitalize"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="public">Public</SelectItem><SelectItem value="premium">Premium</SelectItem></SelectContent></Select></div>
              <div><Label>Visibility</Label><Select value={data.visibility} onValueChange={(v) => update("visibility", v)}><SelectTrigger className="mt-1 capitalize"><SelectValue /></SelectTrigger><SelectContent>{VISIBILITIES.map((v) => <SelectItem key={v} value={v} className="capitalize">{v}</SelectItem>)}</SelectContent></Select></div>
            </div>
            <div><Label>Category</Label><Select value={data.category_id || "none"} onValueChange={(v) => update("category_id", v === "none" ? "" : v)}><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="none">No category</SelectItem>{categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent></Select></div>
            <div className="flex items-center gap-2"><Switch checked={data.is_featured} onCheckedChange={(v) => update("is_featured", v)} /><Label>Featured article</Label></div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="content">
          <AccordionTrigger>Content</AccordionTrigger>
          <AccordionContent className="space-y-4 pt-4">
            <div>
              <Label>Body (Markdown)</Label>
              <Textarea value={data.body || ""} onChange={(e) => update("body", e.target.value)} rows={16} className="mt-1 font-mono text-sm" />
              <p className="text-xs text-slate-400 mt-1">{wordCount} words · ~{Math.max(1, Math.ceil(wordCount / 200))} min read</p>
            </div>
            <div><Label>Featured Image</Label><div className="mt-1"><ImageInput value={data.featured_image} onChange={(v) => update("featured_image", v)} /></div></div>
            <div><Label>Tags</Label><div className="mt-1"><StringListEditor items={data.tags || []} onChange={(v) => update("tags", v)} placeholder="Add tag..." /></div></div>
            <div><Label>Key Takeaways</Label><div className="mt-1"><StringListEditor items={data.key_takeaways || []} onChange={(v) => update("key_takeaways", v)} placeholder="Add key takeaway..." /></div></div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="meta">
          <AccordionTrigger>Authors &amp; Publishing</AccordionTrigger>
          <AccordionContent className="space-y-4 pt-4">
            <div>
              <Label>Authors</Label>
              <div className="mt-2 space-y-2 max-h-48 overflow-y-auto border border-slate-200 rounded-lg p-3">
                {authors.length === 0 && <p className="text-sm text-slate-400">No authors found. Create authors first in the Authors tab.</p>}
                {authors.map((a) => (
                  <label key={a.id} className="flex items-center gap-2 cursor-pointer">
                    <Checkbox checked={(data.author_ids || []).includes(a.id)} onCheckedChange={(checked) => {
                      const ids = data.author_ids || [];
                      update("author_ids", checked ? [...ids, a.id] : ids.filter((id) => id !== a.id));
                    }} />
                    <span className="text-sm">{a.name}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Published Date</Label><Input type="date" value={data.published_date || ""} onChange={(e) => update("published_date", e.target.value)} className="mt-1" /></div>
              <div><Label>Reading Time (min)</Label><Input type="number" value={data.reading_time ?? ""} onChange={(e) => update("reading_time", parseInt(e.target.value) || 0)} className="mt-1" /></div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="seo">
          <AccordionTrigger>SEO Settings</AccordionTrigger>
          <AccordionContent className="space-y-4 pt-4">
            <div><Label>SEO Title</Label><Input value={data.seo_title || ""} onChange={(e) => update("seo_title", e.target.value)} className="mt-1" /></div>
            <div><Label>SEO Description</Label><Textarea value={data.seo_description || ""} onChange={(e) => update("seo_description", e.target.value)} rows={2} className="mt-1" /></div>
            <div><Label>OG Image</Label><div className="mt-1"><ImageInput value={data.og_image} onChange={(v) => update("og_image", v)} /></div></div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="faq">
          <AccordionTrigger>FAQ Section</AccordionTrigger>
          <AccordionContent className="pt-4"><FaqEditor items={data.faq || []} onChange={(v) => update("faq", v)} /></AccordionContent>
        </AccordionItem>
      </Accordion>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={saving}>
          {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
          Save Article
        </Button>
      </div>
    </form>
  );
}