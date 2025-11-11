// _data/lineup.js
require('dotenv').config(); // load .env vars if running locally
const { createClient } = require('@supabase/supabase-js');

module.exports = async function() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
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

  /*
  if (artists != null) {
    console.log("Artists found: " + artists.length)
    for (var i = 0; i < artists.length; i++) {
      console.log(artists[i].name);
    }
  }
  else {
    console.log("No artists found")
  }*/

  // Build full image URLs
  const baseUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/artists/`;

  return (artists || []).map(artist => ({
    ...artist,
      photo_path_small: artist.photo_path ? `${baseUrl}${artist.photo_path}?width=100&quality=70`: null,
      photo_path: artist.photo_path ? baseUrl + artist.photo_path : null,
  }));

};
