import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const ENTITY_TYPES = [
  { name: 'Article', prefix: 'ART' },
  { name: 'GlossaryTerm', prefix: 'GLS' },
  { name: 'Book', prefix: 'BK' },
  { name: 'ResearchPaper', prefix: 'RES' },
  { name: 'Author', prefix: 'AUTH' },
  { name: 'LearningPath', prefix: 'LP' },
  { name: 'Category', prefix: 'CAT' },
  { name: 'CodeSnippet', prefix: 'CS' }
];

function formatId(prefix, num) {
  return `${prefix}-${String(num).padStart(6, '0')}`;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const results = {};
    for (const { name, prefix } of ENTITY_TYPES) {
      const entityApi = base44.asServiceRole.entities[name];
      const res = await entityApi.filter({}, '-created_date', 1000);
      const items = res.results || res || [];

      let maxNum = 0;
      for (const item of items) {
        if (item.internal_id) {
          const match = item.internal_id.match(/-(\d+)$/);
          if (match) {
            const num = parseInt(match[1], 10);
            if (num > maxNum) maxNum = num;
          }
        }
      }

      const toUpdate = [];
      let counter = maxNum;
      for (const item of items) {
        if (!item.internal_id) {
          counter++;
          toUpdate.push({ id: item.id, internal_id: formatId(prefix, counter) });
        }
      }

      for (let i = 0; i < toUpdate.length; i += 500) {
        await entityApi.bulkUpdate(toUpdate.slice(i, i + 500));
      }

      results[name] = { total: items.length, assigned: toUpdate.length, nextId: formatId(prefix, counter + 1) };
    }

    return Response.json({ success: true, results });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});