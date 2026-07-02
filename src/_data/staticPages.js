// _data/staticPages.js
// Fetches published CMS-managed static pages (the `static_pages` table, authored
// in kilele-cms). Mirrors src/_data/news.js. Each page renders at
// /{category}/{slug}/ via src/pages/static.html.
const { createClient } = require('@supabase/supabase-js');

module.exports = async function () {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLIC_KEY // ok if public read policies exist
  );

  const { data: pages, error } = await supabase
    .from('static_pages')
    .select('id, title, slug, category, year, content, excerpt, image_path, menu_order, public')
    .eq('public', true)
    .order('menu_order', { ascending: true });

  if (error) {
    console.error('Error fetching static pages:', error);
    return [];
  }

  const baseUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/static-pages/`;

  // photo_path is the resolved og:image URL (image_path is a stored path or a
  // full gallery URL). Keep the same ^https?:// pass-through check as news.js.
  // path is the public URL: year-category pages live at /{year}/{slug}/, all
  // others at /{category}/{slug}/.
  return (pages || []).map(p => ({
    ...p,
    path: p.category === 'year' && p.year
      ? `/${p.year}/${p.slug}/`
      : `/${p.category}/${p.slug}/`,
    photo_path: p.image_path
      ? /^https?:\/\//.test(p.image_path.trim())
        ? p.image_path.trim()
        : baseUrl + encodeURIComponent(p.image_path)
      : null,
  }));
};
