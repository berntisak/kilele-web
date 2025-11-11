// _data/news.js
const { createClient } = require('@supabase/supabase-js');

module.exports = async function() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLIC_KEY
  );

  const { data: news, error } = await supabase
    .from('news_posts')
    .select('*')
    .eq('public', true)
    .order('publish_date', { ascending: false });

  if (error) {
    console.error('Error fetching news:', error);
    return [];
  }

  // Build full image URLs
  const baseUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/news/`;

  for (var i = 0; i < news.length; i++) {
    console.log("News " + i + ": " + news[i].excerpt);
  }
  return (news || []).map(post => ({
    ...post,
    photo_path: post.image_path ? baseUrl + post.image_path : null,
  }));
};
