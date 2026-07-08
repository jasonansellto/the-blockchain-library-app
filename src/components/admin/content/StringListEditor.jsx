import React, { useState } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function StringListEditor({ items = [], onChange, placeholder = "Add item..." }) {
  const [newItem, setNewItem] = useState("");

  const add = () => {
    if (!newItem.trim()) return;
    onChange([...items, newItem.trim()]);
    setNewItem("");
  };
  const remove = (idx) => onChange(items.filter((_, i) => i !== idx));
  const update = (idx, val) => onChange(items.map((item, i) => (i === idx ? val : item)));

  return (
    <div className="space-y-2">
      {items.map((item, idx) => (
        <div key={idx} className="flex items-center gap-2">
          <Input value={item} onChange={(e) => update(idx, e.target.value)} className="flex-1" />
          <Button type="button" variant="ghost" size="icon" onClick={() => remove(idx)}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      ))}
      <div className="flex items-center gap-2">
        <Input
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }}
          placeholder={placeholder}
          className="flex-1"
        />
        <Button type="button" variant="outline" size="icon" onClick={add}>
          <Plus className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}