import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Loader2, Save } from "lucide-react";
import StringListEditor from "./StringListEditor";

const DIFFICULTIES = ["beginner", "intermediate", "advanced"];

function slugify(text) {
  return text.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "");
}

export default function GlossaryForm({ term, categories, onSave, onCancel }) {
  const [data, setData] = useState(term || {
    title: "", slug: "", definition: "", simple_explanation: "",
    why_it_matters: "", how_it_works: "", real_world_example: "",
    difficulty: "beginner", category_id: "", subcategory: "",
    advantages: [], limitations: [], common_misconceptions: [], examples: [],
    seo_title: "", seo_description: "", language: "en",
  });
  const [saving, setSaving] = useState(false);
  const [slugEdited, setSlugEdited] = useState(!!term?.slug);

  const update = (field, val) => setData((prev) => ({ ...prev, [field]: val }));
  const onTitleChange = (val) => { update("title", val); if (!slugEdited) update("slug", slugify(val)); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try { await onSave(data); } catch { /* handled by parent */ } finally { setSaving(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Accordion type="multiple" defaultValue={["basic"]} className="w-full">
        <AccordionItem value="basic">
          <AccordionTrigger>Basic Information</AccordionTrigger>
          <AccordionContent className="space-y-4 pt-4">
            <div><Label>Title *</Label><Input value={data.title} onChange={(e) => onTitleChange(e.target.value)} required className="mt-1" /></div>
            <div><Label>Slug *</Label><Input value={data.slug} onChange={(e) => { update("slug", e.target.value); setSlugEdited(true); }} required className="mt-1 font-mono text-sm" /></div>
            <div><Label>Definition *</Label><Textarea value={data.definition || ""} onChange={(e) => update("definition", e.target.value)} rows={4} required className="mt-1" /></div>
            <div><Label>Simple Explanation</Label><Textarea value={data.simple_explanation || ""} onChange={(e) => update("simple_explanation", e.target.value)} rows={3} className="mt-1" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Difficulty</Label><Select value={data.difficulty} onValueChange={(v) => update("difficulty", v)}><SelectTrigger className="mt-1 capitalize"><SelectValue /></SelectTrigger><SelectContent>{DIFFICULTIES.map((d) => <SelectItem key={d} value={d} className="capitalize">{d}</SelectItem>)}</SelectContent></Select></div>
              <div><Label>Category</Label><Select value={data.category_id || "none"} onValueChange={(v) => update("category_id", v === "none" ? "" : v)}><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="none">No category</SelectItem>{categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent></Select></div>
            </div>
            <div><Label>Subcategory</Label><Input value={data.subcategory || ""} onChange={(e) => update("subcategory", e.target.value)} className="mt-1" /></div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="deep">
          <AccordionTrigger>Deep Dive</AccordionTrigger>
          <AccordionContent className="space-y-4 pt-4">
            <div><Label>Why It Matters</Label><Textarea value={data.why_it_matters || ""} onChange={(e) => update("why_it_matters", e.target.value)} rows={3} className="mt-1" /></div>
            <div><Label>How It Works</Label><Textarea value={data.how_it_works || ""} onChange={(e) => update("how_it_works", e.target.value)} rows={4} className="mt-1" /></div>
            <div><Label>Real-World Example</Label><Textarea value={data.real_world_example || ""} onChange={(e) => update("real_world_example", e.target.value)} rows={3} className="mt-1" /></div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="lists">
          <AccordionTrigger>Lists &amp; Examples</AccordionTrigger>
          <AccordionContent className="space-y-4 pt-4">
            <div><Label>Advantages</Label><div className="mt-1"><StringListEditor items={data.advantages || []} onChange={(v) => update("advantages", v)} placeholder="Add advantage..." /></div></div>
            <div><Label>Limitations</Label><div className="mt-1"><StringListEditor items={data.limitations || []} onChange={(v) => update("limitations", v)} placeholder="Add limitation..." /></div></div>
            <div><Label>Common Misconceptions</Label><div className="mt-1"><StringListEditor items={data.common_misconceptions || []} onChange={(v) => update("common_misconceptions", v)} placeholder="Add misconception..." /></div></div>
            <div><Label>Examples</Label><div className="mt-1"><StringListEditor items={data.examples || []} onChange={(v) => update("examples", v)} placeholder="Add example..." /></div></div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="seo">
          <AccordionTrigger>SEO Settings</AccordionTrigger>
          <AccordionContent className="space-y-4 pt-4">
            <div><Label>SEO Title</Label><Input value={data.seo_title || ""} onChange={(e) => update("seo_title", e.target.value)} className="mt-1" /></div>
            <div><Label>SEO Description</Label><Textarea value={data.seo_description || ""} onChange={(e) => update("seo_description", e.target.value)} rows={2} className="mt-1" /></div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={saving}>
          {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
          Save Term
        </Button>
      </div>
    </form>
  );
}