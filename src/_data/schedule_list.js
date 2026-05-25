const schedule = require('./schedule.js');

module.exports = async function() {
  const scheduleData = await schedule();

  // Flatten both byDay and multiDay into a single array
  const byDayList = Object.values(scheduleData.byDay).flat();
  const flatList = [...byDayList, ...scheduleData.multiDay];

  // Filter out program points without a valid slug
  const withSlugs = flatList.filter(point => point.slug && point.slug.trim() !== '');

  // Optional: log to confirm slugs are there
  //console.log("Program points for slug pages:", withSlugs.map(p => p.slug));

  return withSlugs;
};

  
