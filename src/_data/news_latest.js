// _data/news_latest.js
const news = require("./news.js")

module.exports = async function() {
  const allNews = await news();

  const hero = allNews.filter(n => n.hero).slice(0, 3);
  const regular = allNews.filter(n => !n.hero).slice(0, 3);

  return { hero, regular, allNews };
}
  