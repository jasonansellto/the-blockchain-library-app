import React, { useState, useRef } from "react";
import { Upload, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { base44 } from "@/api/base44Client";

export default function ImageInput({ value, onChange }) {
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      onChange(file_url);
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input value={value || ""} onChange={(e) => onChange(e.target.value)} placeholder="Paste image URL or upload" className="flex-1" />
        <input type="file" ref={fileRef} accept="image/*" onChange={handleUpload} className="hidden" />
        <Button type="button" variant="outline" size="icon" disabled={uploading} onClick={() => fileRef.current?.click()}>
          {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
        </Button>
        {value && (
          <Button type="button" variant="ghost" size="icon" onClick={() => onChange("")}>
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>
      {value && (
        <div className="w-32 h-20 rounded-lg overflow-hidden border border-slate-200 bg-slate-50">
          <img src={value} alt="Preview" className="w-full h-full object-cover" onError={(e) => { e.target.style.display = "none"; }} />
        </div>
      )}
    </div>
  );
}