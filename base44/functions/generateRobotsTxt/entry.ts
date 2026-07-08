const SITE_URL = 'https://theblockchainlibrary.com';

Deno.serve(async (req) => {
  try {
    const text = `User-agent: *
Allow: /
Disallow: /dashboard/
Disallow: /admin/
Disallow: /login
Disallow: /register
Disallow: /account
Disallow: /history
Disallow: /api/private/

Sitemap: ${SITE_URL}/sitemap.xml`;

    return req.method === 'GET'
      ? new Response(text, { headers: { 'Content-Type': 'text/plain' } })
      : Response.json({ content: text });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});