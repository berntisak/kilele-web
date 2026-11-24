// _data/news.js
const { client, must } = require('../../utils/supabase');

module.exports = async function () {
  const supabase = client();

  const news = await must('news_posts + tags (news)', supabase
    .from('news_posts')
    .select(`
      *,
      news_post_tags (
        tag_id,
        tags ( id, name )
      )
    `)
    .eq('public', true)
    .order('publish_date', { ascending: false }));

  const baseUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/news/`;

  return news.map(post => ({
    ...post,
    tags: (post.news_post_tags || []).map(row => row.tags),
    photo_path: post.image_path
      ? /^https?:\/\//.test(post.image_path.trim())
        ? post.image_path.trim()
        : baseUrl + encodeURIComponent(post.image_path)
      : null,
  }));
};
