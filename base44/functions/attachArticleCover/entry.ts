import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

// Attaches a generated cover image to an article that has no featured image.
// Covers are rendered by the open-source "Article covers" workflow in
// github.com/jasonansellto/the-blockchain-library and sent here.
//
// Access: the workflow's KNOWLEDGE_SYNC_TOKEN (x-knowledge-sync-token header),
// or a signed-in admin/editor.
// Body: { articleId: string, imageBase64: string (JPEG), filename?: string }
//   or: { articleId: string, imageUrl: string } — link an original image hosted on
//       jasonansell.ca or Base44 storage; this may replace a generated cover
//       (a *-cover.jpg file) but never any other existing image.

const MAX_BYTES = 1_000_000;
const ALLOWED_IMAGE_HOSTS = ['jasonansell.ca', 'base44.app', 'media.base44.com'];
const isGeneratedCover = (url) => typeof url === 'string' && /-cover\.jpg$/i.test(url);

function timingSafeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const syncToken = Deno.env.get('KNOWLEDGE_SYNC_TOKEN');
    const presented = req.headers.get('x-knowledge-sync-token');
    const viaToken = Boolean(syncToken && syncToken.length >= 32 && presented && timingSafeEqual(presented, syncToken));
    if (!viaToken) {
      const user = await base44.auth.me().catch(() => null);
      if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
      if (user.role !== 'admin' && user.role !== 'editor') return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { articleId, imageBase64, imageUrl, filename } = await req.json().catch(() => ({}));
    if (typeof articleId !== 'string' || (typeof imageBase64 !== 'string' && typeof imageUrl !== 'string')) {
      return Response.json({ error: 'articleId and imageBase64 or imageUrl are required' }, { status: 400 });
    }

    if (typeof imageUrl === 'string') {
      let host = '';
      try { const u = new URL(imageUrl); host = u.protocol === 'https:' ? u.hostname.replace(/^www\./, '') : ''; } catch (_e) { /* invalid */ }
      if (!ALLOWED_IMAGE_HOSTS.includes(host)) return Response.json({ error: 'imageUrl host not allowed' }, { status: 400 });
      const head = await fetch(imageUrl, { method: 'GET', headers: { Range: 'bytes=0-63' } }).catch(() => null);
      const type = head?.headers.get('content-type') || '';
      if (!head || !(head.ok || head.status === 206) || !type.startsWith('image/')) {
        return Response.json({ error: 'imageUrl does not load as an image' }, { status: 422 });
      }
      const target = await base44.asServiceRole.entities.Article.get(articleId).catch(() => null);
      if (!target) return Response.json({ error: 'Article not found' }, { status: 404 });
      if (target.featured_image && !isGeneratedCover(target.featured_image)) {
        return Response.json({ skipped: true, reason: 'Article already has an original image', featured_image: target.featured_image });
      }
      await base44.asServiceRole.entities.Article.update(target.id, { featured_image: imageUrl });
      return Response.json({ attached: true, slug: target.slug, featured_image: imageUrl, replacedGenerated: isGeneratedCover(target.featured_image) });
    }

    const bytes = Uint8Array.from(atob(imageBase64), (c) => c.charCodeAt(0));
    if (bytes.length > MAX_BYTES) return Response.json({ error: 'Image too large' }, { status: 413 });
    if (!(bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff)) {
      return Response.json({ error: 'Image must be a JPEG' }, { status: 415 });
    }

    const article = await base44.asServiceRole.entities.Article.get(articleId).catch(() => null);
    if (!article) return Response.json({ error: 'Article not found' }, { status: 404 });
    if (article.featured_image) {
      return Response.json({ skipped: true, reason: 'Article already has a featured image', featured_image: article.featured_image });
    }

    const safeName = String(filename || `${article.slug || article.id}-cover.jpg`).replace(/[^a-z0-9._-]/gi, '-').slice(0, 100);
    const { file_url } = await base44.asServiceRole.integrations.Core.UploadFile({
      file: new File([bytes], safeName.endsWith('.jpg') ? safeName : `${safeName}.jpg`, { type: 'image/jpeg' }),
    });
    if (!file_url) return Response.json({ error: 'Upload failed' }, { status: 502 });

    await base44.asServiceRole.entities.Article.update(article.id, { featured_image: file_url });
    return Response.json({ attached: true, slug: article.slug, featured_image: file_url });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
