const schedule = require('./schedule.js');

module.exports = async function() {
  const grouped = await schedule();

  // Flatten grouped object into a single array
  const flatList = Object.values(grouped).flat();

  // Optional: log to confirm slugs are there
  //console.log("Program points for slug pages:", flatList.map(p => p.slug));

  return flatList;
};

  
