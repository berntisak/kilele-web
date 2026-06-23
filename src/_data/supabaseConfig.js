// _data/supabaseConfig.js
// Surfaces the public Supabase URL + anon key to templates so the client-side
// news preview page (src/news/preview.html) can fetch a single post by id at
// view time. The anon key is public-by-design in this static-site architecture
// (the same key already ships in every build via _data/*.js fetches).
module.exports = function () {
  return {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_PUBLIC_KEY,
  };
};
