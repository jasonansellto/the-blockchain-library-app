import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const TYPE_MAP = {
  Article: 'ART',
  GlossaryTerm: 'GLS',
  Book: 'BK',
  ResearchPaper: 'RES',
  Author: 'AUTH',
  LearningPath: 'LP',
  Category: 'CAT',
  CodeSnippet: 'CS'
};

function formatId(prefix, num) {
  return `${prefix}-${String(num).padStart(6, '0')}`;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    let body = {};
    try { body = await req.json(); } catch (e) {}
    const type = body.type || new URL(req.url).searchParams.get('type');

    if (!type || !TYPE_MAP[type]) {
      return Response.json({ error: 'Invalid type. Valid types: ' + Object.keys(TYPE_MAP).join(', ') }, { status: 400 });
    }

    const prefix = TYPE_MAP[type];
    const entityApi = base44.asServiceRole.entities[type];
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

    return Response.json({ internal_id: formatId(prefix, maxNum + 1), type, prefix });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});