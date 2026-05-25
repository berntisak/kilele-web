// _data/lineup.js
require('dotenv').config(); // load .env vars if running locally
const { createClient } = require('@supabase/supabase-js');

module.exports = async function() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLIC_KEY
  );

  const { data: artists, error } = await supabase
    .from('artists')
    .select('*')
    .eq('public', true)
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching artists:', error);
    return [];
  }

  // Fetch program points linked to artists
  const { data: programPointLinks, error: linkError } = await supabase
    .from('program_point_artists')
    .select(`
      artist_id,
      program_points (title, short_title, slug, public)
    `);

  if (linkError) console.error('Error fetching program point links:', linkError);

  // Create a map of artist_id -> array of program points
  const programPointMap = {};
  (programPointLinks || []).forEach(link => {
    // Only include public program points
    if (link.program_points?.public) {
      if (!programPointMap[link.artist_id]) programPointMap[link.artist_id] = [];
      programPointMap[link.artist_id].push({
        title: link.program_points.title,
        short_title: link.program_points.short_title,
        slug: link.program_points.slug
      });
    }
  });

  // Build full image URLs
  const baseUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/artists/`;

  return (artists || []).map(artist => ({
    ...artist,
      photo_path_small: artist.photo_path ? `${baseUrl}${encodeURIComponent(artist.photo_path)}?width=100&quality=70`: null,
      photo_path: artist.photo_path ? baseUrl + encodeURIComponent(artist.photo_path) : null,
      program_points: programPointMap[artist.id] || []
  }));

};
