import React from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export default function FaqEditor({ items = [], onChange }) {
  const add = () => onChange([...items, { question: "", answer: "" }]);
  const remove = (idx) => onChange(items.filter((_, i) => i !== idx));
  const update = (idx, field, val) =>
    onChange(items.map((item, i) => (i === idx ? { ...item, [field]: val } : item)));

  return (
    <div className="space-y-4">
      {items.map((item, idx) => (
        <div key={idx} className="p-4 border border-slate-200 rounded-lg space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-slate-500">Q&A #{idx + 1}</span>
            <Button type="button" variant="ghost" size="sm" onClick={() => remove(idx)}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
          <div>
            <Label className="text-xs text-slate-500">Question</Label>
            <Input value={item.question || ""} onChange={(e) => update(idx, "question", e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label className="text-xs text-slate-500">Answer</Label>
            <Textarea value={item.answer || ""} onChange={(e) => update(idx, "answer", e.target.value)} rows={3} className="mt-1" />
          </div>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={add}>
        <Plus className="w-4 h-4 mr-2" /> Add FAQ
      </Button>
    </div>
  );
}