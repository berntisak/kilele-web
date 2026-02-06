// _data/news_latest.js
const news = require("./news.js")

module.exports = async function() {
  const allNews = await news();

  const hero = allNews.filter(n => (n.hero && !n.hero_video)).slice(0, 3);
  const regular = allNews.filter(n => (!n.hero && !n.hero_video)).slice(0, 3);
  const hero_video = allNews.filter(n => n.hero_video).slice(0, 1);

  return { hero, hero_video,regular, allNews };
}
  