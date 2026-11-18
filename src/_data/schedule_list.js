// _data/schedule_list.js
// Every program point with a slug, from every year, once each: one page per point.
const schedule = require('./schedule.js');

module.exports = async function() {
  const scheduleData = await schedule();

  const allPoints = Object.values(scheduleData).flatMap(year => year.points);

  return allPoints.filter(point => point.slug && point.slug.trim() !== '');
};
