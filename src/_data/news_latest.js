// _data/news_latest.js
const news = require("./news.js")

module.exports = async function() {
  const allNews = await news();

  const hero = allNews.filter(n => n.hero).slice(0, 3);
  const regular = allNews.filter(n => !n.hero).slice(0, 3);

  return { hero, regular, allNews };
}
  /*
module.exports = async function() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  const baseUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/news/`;

  // Fetch all public news
  const { data: allNews, error } = await supabase
    .from('news_posts')
    .select('*')
    .eq('public', true)
    .order('publish_date', { ascending: false });

  if (error) {
    console.error('Error fetching news:', error);
    return { hero: [], regular: [] };
  }

  const processed = (allNews || []).map(post => ({
    ...post,
    photo_path: post.image_path ? baseUrl + post.image_path : null,
  }));

  const hero = processed.filter(n => n.hero).slice(0, 3);
  const regular = processed.filter(n => !n.hero).slice(0, 3);

  return { hero, regular, allNews };
};
*/