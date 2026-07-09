import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Google Search Console integration (shared connector).
// Pulls search-performance analytics (totals, top queries, top pages) and
// sitemap status for the builder's site property. Admin/editor only.
const GSC_API = 'https://www.googleapis.com/webmasters/v3';

function ymd(d: Date): string {
  return d.toISOString().slice(0, 10);
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || !['admin', 'editor'].includes(user.role)) {
      return Response.json({ error: 'Admin or editor access required' }, { status: 403 });
    }

    const { accessToken } = await base44.asServiceRole.connectors.getConnection('google_search_console');
    if (!accessToken) {
      return Response.json({ error: 'Google Search Console is not connected. Connect it from the admin tools.' }, { status: 400 });
    }

    const headers = { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' };

    const body = await req.json().catch(() => ({}));
    const days = Math.min(90, Math.max(7, parseInt(body.days, 10) || 28));
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);
    const startDate = ymd(start);
    const endDate = ymd(end);

    // List the builder's verified site properties.
    const sitesRes = await fetch(`${GSC_API}/sites`, { headers });
    let sites: any[] = [];
    if (sitesRes.ok) {
      const sd: any = await sitesRes.json();
      sites = (sd.siteEntry || []).map((s: any) => ({ siteUrl: s.siteUrl, permissionLevel: s.permissionLevel }));
    }

    let siteUrl = String(body.siteUrl || '').trim();
    if (!siteUrl && sites.length) {
      // Prefer this app's own domain; fall back to the first owned property.
      const own = sites.find((s) => String(s.siteUrl).includes('theblockchainlibrary.com'));
      siteUrl = (own || sites[0]).siteUrl;
    }
    if (!siteUrl) {
      return Response.json({ error: 'No Search Console properties found in your account. Verify a site property in Google Search Console first.' }, { status: 404 });
    }

    const sitePath = encodeURIComponent(siteUrl);

    // ---- Write actions: sitemap management (requires webmasters write scope) ----
    if (body.action === 'submit-sitemap' || body.action === 'delete-sitemap') {
      const feedpath = String(body.feedpath || '').trim();
      if (!feedpath) {
        return Response.json({ error: 'feedpath (sitemap URL) is required' }, { status: 400 });
      }
      const feedPathEncoded = encodeURIComponent(feedpath);
      const smUrl = `${GSC_API}/sites/${sitePath}/sitemaps/${feedPathEncoded}`;
      const writeRes = body.action === 'submit-sitemap'
        ? await fetch(smUrl, { method: 'PUT', headers })
        : await fetch(smUrl, { method: 'DELETE', headers });
      if (!writeRes.ok) {
        const errText = await writeRes.text().catch(() => '');
        return Response.json({ error: `Search Console ${body.action} failed (${writeRes.status})`, details: errText }, { status: writeRes.status });
      }
      return Response.json({ action: body.action, siteUrl, feedpath, success: true });
    }

    const analyticsBody = (dimensions: string[], rowLimit: number) => ({
      startDate,
      endDate,
      dimensions,
      rowLimit,
      startRow: 0
    });

    const [totalsRes, queriesRes, pagesRes, sitemapsRes] = await Promise.all([
      fetch(`${GSC_API}/sites/${sitePath}/searchAnalytics/query`, {
        method: 'POST', headers, body: JSON.stringify(analyticsBody([], 1))
      }),
      fetch(`${GSC_API}/sites/${sitePath}/searchAnalytics/query`, {
        method: 'POST', headers, body: JSON.stringify(analyticsBody(['query'], 20))
      }),
      fetch(`${GSC_API}/sites/${sitePath}/searchAnalytics/query`, {
        method: 'POST', headers, body: JSON.stringify(analyticsBody(['page'], 20))
      }),
      fetch(`${GSC_API}/sites/${sitePath}/sitemaps`, { headers })
    ]);

    let totals = { clicks: 0, impressions: 0, ctr: 0, position: 0 };
    if (totalsRes.ok) {
      const td: any = await totalsRes.json();
      const row = (td.rows || [])[0];
      if (row) totals = { clicks: row.clicks || 0, impressions: row.impressions || 0, ctr: row.ctr || 0, position: row.position || 0 };
    }

    let topQueries: any[] = [];
    if (queriesRes.ok) {
      const qd: any = await queriesRes.json();
      topQueries = (qd.rows || []).map((row: any) => ({
        query: (row.keys || [])[0],
        clicks: row.clicks || 0,
        impressions: row.impressions || 0,
        ctr: row.ctr || 0,
        position: row.position || 0
      }));
    }

    let topPages: any[] = [];
    if (pagesRes.ok) {
      const pd: any = await pagesRes.json();
      topPages = (pd.rows || []).map((row: any) => ({
        page: (row.keys || [])[0],
        clicks: row.clicks || 0,
        impressions: row.impressions || 0,
        ctr: row.ctr || 0,
        position: row.position || 0
      }));
    }

    let sitemaps: any[] = [];
    if (sitemapsRes.ok) {
      const smd: any = await sitemapsRes.json();
      sitemaps = (smd.sitemap || []).map((s: any) => ({
        path: s.path,
        lastSubmitted: s.lastSubmitted,
        submitted: s.submitted,
        isPending: s.isPending,
        errors: s.errors || 0,
        warnings: s.warnings || 0,
        indexed: s.indexed
      }));
    }

    return Response.json({
      siteUrl,
      sites,
      dateRange: { startDate, endDate, days },
      totals,
      topQueries,
      topPages,
      sitemaps
    });
  } catch (error) {
    return Response.json({ error: error.message, stack: error.stack }, { status: 500 });
  }
});