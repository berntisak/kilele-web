// _data/gallery.js

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

module.exports = async function() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLIC_KEY
  );

  const baseUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/gallery/`;
  const renderUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/render/image/public/gallery/`;

  // Fetch all categories
  const { data: categories, error: catError } = await supabase
    .from('gallery_categories')
    .select('id, name, slug, display_name, sort_order')
    .order('sort_order', { ascending: true });

  if (catError) {
    console.error('Error fetching gallery categories:', catError);
  }

  // Fetch all photos with photographer and category
  const { data: photos, error: photoError } = await supabase
    .from('gallery_photos')
    .select(`
      id, image_path, caption, link, sort_order, program_point_id,
      category_id (id, name, slug, display_name),
      photographer_id (id, name, link)
    `)
    .order('sort_order', { ascending: true });

  if (photoError) {
    console.error('Error fetching gallery photos:', photoError);
    return { categories: [], photos: [] };
  }

  // Fetch artists linked to photos via junction table
  const { data: artistLinks, error: artistError } = await supabase
    .from('gallery_photo_artists')
    .select(`
      photo_id,
      artists (name, slug, public)
    `);

  if (artistError) console.error('Error fetching gallery photo artists:', artistError);

  const artistMap = {};
  (artistLinks || []).forEach(link => {
    if (link.artists?.public) {
      if (!artistMap[link.photo_id]) artistMap[link.photo_id] = [];
      artistMap[link.photo_id].push({
        name: link.artists.name,
        slug: link.artists.slug,
      });
    }
  });

  // Fetch program points for any photos that have a program_point_id
  const programPointIds = [...new Set(
    (photos || []).map(p => p.program_point_id).filter(Boolean)
  )];

  const programPointMap = {};
  if (programPointIds.length) {
    const { data: programPoints, error: ppError } = await supabase
      .from('program_points')
      .select('id, title, short_title, slug')
      .in('id', programPointIds);

    if (ppError) {
      console.error('Error fetching program points for gallery:', ppError);
    } else {
      (programPoints || []).forEach(pp => {
        programPointMap[pp.id] = { title: pp.title, short_title: pp.short_title, slug: pp.slug };
      });
    }
  }

  const enrichedPhotos = (photos || []).map(photo => {
    const pp = programPointMap[photo.program_point_id] || null;
    return {
      ...photo,
      category_name: photo.category_id?.name || null,
      category_slug: photo.category_id?.slug || null,
      category_display_name: photo.category_id?.display_name || photo.category_id?.name || null,
      photographer_name: photo.photographer_id?.name || null,
      photographer_link: photo.photographer_id?.link || null,
      artists: artistMap[photo.id] || [],
      program_point_slug: pp?.slug || null,
      program_point_title: pp?.short_title || pp?.title || null,
      url: photo.image_path ? baseUrl + encodeURIComponent(photo.image_path) : null,
      // A small square for the contact sheet. Only /render/ resizes; /object/ ignores ?width= (#141).
      url_thumb: photo.image_path
        ? `${renderUrl}${encodeURIComponent(photo.image_path)}?width=400&height=400&resize=cover&quality=75`
        : null,
    };
  });

  // Each category carries its own photos, so the gallery page can count them and loop over them directly.
  // The photos are numbered straight through the categories (1, 2, 3 …) for the contact sheet's labels.
  let number = 0;
  const categoriesWithPhotos = (categories || []).map(category => ({
    ...category,
    photos: enrichedPhotos
      .filter(photo => photo.category_slug === category.slug && photo.url)
      .map(photo => ({ ...photo, number: ++number })),
  }));

  return {
    categories: categoriesWithPhotos,
    photos: enrichedPhotos,
  };
};
