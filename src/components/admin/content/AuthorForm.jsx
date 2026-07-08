import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Loader2, Save } from "lucide-react";
import StringListEditor from "./StringListEditor";
import ImageInput from "./ImageInput";

function slugify(text) {
  return text.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "");
}

export default function AuthorForm({ author, onSave, onCancel }) {
  const [data, setData] = useState(author || {
    name: "", slug: "", bio: "", photo: "",
    social_links: {}, expertise_areas: [], is_featured: false,
  });
  const [saving, setSaving] = useState(false);
  const [slugEdited, setSlugEdited] = useState(!!author?.slug);

  const update = (field, val) => setData((prev) => ({ ...prev, [field]: val }));
  const updateSocial = (platform, val) => update("social_links", { ...(data.social_links || {}), [platform]: val });
  const onNameChange = (val) => { update("name", val); if (!slugEdited) update("slug", slugify(val)); };

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
            <div><Label>Name *</Label><Input value={data.name} onChange={(e) => onNameChange(e.target.value)} required className="mt-1" /></div>
            <div><Label>Slug *</Label><Input value={data.slug} onChange={(e) => { update("slug", e.target.value); setSlugEdited(true); }} required className="mt-1 font-mono text-sm" /></div>
            <div><Label>Bio</Label><Textarea value={data.bio || ""} onChange={(e) => update("bio", e.target.value)} rows={5} className="mt-1" /></div>
            <div><Label>Photo</Label><div className="mt-1"><ImageInput value={data.photo} onChange={(v) => update("photo", v)} /></div></div>
            <div className="flex items-center gap-2"><Switch checked={data.is_featured} onCheckedChange={(v) => update("is_featured", v)} /><Label>Featured author</Label></div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="social">
          <AccordionTrigger>Social Links</AccordionTrigger>
          <AccordionContent className="space-y-4 pt-4">
            <div><Label>Twitter</Label><Input value={data.social_links?.twitter || ""} onChange={(e) => updateSocial("twitter", e.target.value)} placeholder="https://twitter.com/..." className="mt-1" /></div>
            <div><Label>LinkedIn</Label><Input value={data.social_links?.linkedin || ""} onChange={(e) => updateSocial("linkedin", e.target.value)} placeholder="https://linkedin.com/in/..." className="mt-1" /></div>
            <div><Label>GitHub</Label><Input value={data.social_links?.github || ""} onChange={(e) => updateSocial("github", e.target.value)} placeholder="https://github.com/..." className="mt-1" /></div>
            <div><Label>Website</Label><Input value={data.social_links?.website || ""} onChange={(e) => updateSocial("website", e.target.value)} placeholder="https://..." className="mt-1" /></div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="expertise">
          <AccordionTrigger>Expertise</AccordionTrigger>
          <AccordionContent className="pt-4">
            <Label>Expertise Areas</Label>
            <div className="mt-1"><StringListEditor items={data.expertise_areas || []} onChange={(v) => update("expertise_areas", v)} placeholder="Add expertise area..." /></div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={saving}>
          {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
          Save Author
        </Button>
      </div>
    </form>
  );
}