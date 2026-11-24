// _data/gallery.js

const { client, must } = require('../../utils/supabase');

module.exports = async function() {
  const supabase = client();

  const baseUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/gallery/`;

  // Fetch all categories
  const categories = await must('gallery_categories (gallery)', supabase
    .from('gallery_categories')
    .select('id, name, slug, display_name, sort_order')
    .order('sort_order', { ascending: true }));

  // Fetch all photos with photographer and category
  const photos = await must('gallery_photos (gallery)', supabase
    .from('gallery_photos')
    .select(`
      id, image_path, caption, link, sort_order, program_point_id,
      category_id (id, name, slug, display_name),
      photographer_id (id, name, link)
    `)
    .order('sort_order', { ascending: true }));

  // Fetch artists linked to photos via junction table
  const artistLinks = await must('gallery_photo_artists (gallery)', supabase
    .from('gallery_photo_artists')
    .select(`
      photo_id,
      artists (name, slug, public)
    `));

  const artistMap = {};
  artistLinks.forEach(link => {
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
    photos.map(p => p.program_point_id).filter(Boolean)
  )];

  const programPointMap = {};
  if (programPointIds.length) {
    const programPoints = await must('program_points (gallery)', supabase
      .from('program_points')
      .select('id, title, short_title, slug')
      .in('id', programPointIds));

    programPoints.forEach(pp => {
      programPointMap[pp.id] = { title: pp.title, short_title: pp.short_title, slug: pp.slug };
    });
  }

  const enrichedPhotos = photos.map(photo => {
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
      url_thumb: photo.image_path
        ? `${baseUrl}${encodeURIComponent(photo.image_path)}?width=400&quality=75`
        : null,
    };
  });

  return {
    categories,
    photos: enrichedPhotos,
  };
};
