import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { BookOpen } from 'lucide-react';

export default function ChapterOverview({ parts }) {
  if (!parts?.length) return null;
  return (
    <section className="mt-12 max-w-3xl">
      <h2 className="text-xl font-bold text-slate-900 mb-1 tracking-tight flex items-center gap-2">
        <BookOpen className="w-5 h-5 text-blue-600" /> Inside the Book
      </h2>
      <p className="text-sm text-slate-500 mb-5">A chapter and subject overview of what this title covers.</p>
      <Accordion type="single" collapsible className="rounded-xl border border-slate-200 bg-white">
        {parts.map((part, i) => (
          <AccordionItem key={i} value={`part-${i}`} className="px-5">
            <AccordionTrigger className="text-left font-semibold text-slate-900 hover:no-underline">
              {part.part_title}
            </AccordionTrigger>
            <AccordionContent>
              <ul className="space-y-2">
                {(part.chapters || []).map((ch, j) => (
                  <li key={j} className="flex items-start gap-2 text-sm text-slate-600">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                    {ch}
                  </li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}