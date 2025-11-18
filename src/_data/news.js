// _data/news.js
const { createClient } = require('@supabase/supabase-js');

module.exports = async function () {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLIC_KEY // ok if public read policies exist; use service key on server if needed
  );

  const { data: news, error } = await supabase
    .from('news_posts')
    .select(`
      *,
      news_post_tags (
        tag_id,
        tags ( id, name )
      )
    `)
    .eq('public', true)
    .order('publish_date', { ascending: false });

  if (error) {
    console.error('Error fetching news:', error);
    return [];
  }

  const baseUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/news/`;

  for (const item of news) {
    console.log(item.title);
    console.log(item.news_post_tags.map(t => t.tags?.name));
  }

  return (news || []).map(post => ({
    ...post,
    tags: (post.news_post_tags || []).map(row => row.tags),  // <-- works now
    photo_path: post.image_path ? baseUrl + post.image_path : null,
  }));
};
