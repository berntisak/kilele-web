// _data/schedule.js
// The public program, one entry per festival year: schedule["2026"] (#193).

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const { DateTime } = require('luxon');

const ZONE = 'Africa/Nairobi';

let cachedPromise = null;

module.exports = async function() {
  if (cachedPromise) return cachedPromise;
  cachedPromise = fetchSchedule();
  return cachedPromise;
};

async function fetchSchedule() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLIC_KEY
  );

  // 1️⃣ Every public program point, with its category, venue and festival year
  const { data: rows, error } = await supabase
    .from('program_points')
    .select(`
      id, title, short_title, description, photo_path, start_time, end_time, slug,
      category_id (name),
      venue_id (name),
      festival_id (year, official_start_date, official_end_date)
    `)
    .eq('public', true)
    .order('start_time', { ascending: true });

  if (error) {
    console.error('Error fetching schedule:', error);
    return {};
  }

  // 2️⃣ The public artists linked to each program point
  const { data: artistLinks, error: artistError } = await supabase
    .from('program_point_artists')
    .select(`
      program_point_id,
      artists (name, slug, public)
    `);

  if (artistError) console.error('Error fetching artists:', artistError);

  const artistMap = {};
  (artistLinks || []).forEach(link => {
    if (link.artists?.public) {
      if (!artistMap[link.program_point_id]) artistMap[link.program_point_id] = [];
      artistMap[link.program_point_id].push({
        name: link.artists.name,
        slug: link.artists.slug
      });
    }
  });

  // 3️⃣ Shape each program point and sort it into its festival year
  const baseUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/program_points/`;
  const years = {};

  for (const row of rows || []) {
    const festival = row.festival_id || {};
    const year = String(festival.year);
    if (!years[year]) {
      years[year] = {
        year,
        officialStart: festival.official_start_date,
        officialEnd: festival.official_end_date,
        points: [],
      };
    }

    const start = DateTime.fromISO(row.start_time, { zone: ZONE });
    const end = DateTime.fromISO(row.end_time, { zone: ZONE });

    // Before 06:00 counts as the night before
    const firstDay = (start.hour < 6 ? start.minus({ days: 1 }) : start).toISODate();
    const lastDay = (end.hour < 6 ? end.minus({ days: 1 }) : end).toISODate();

    const categoryName = row.category_id?.name;
    const hasCategory = categoryName && categoryName !== 'Uncategorized';

    years[year].points.push({
      title: row.title,
      short_title: row.short_title,
      description: row.description,
      slug: row.slug,
      start_time: row.start_time,
      end_time: row.end_time,
      start_time_local: start.toFormat('HH:mm'),
      end_time_local: end.toFormat('HH:mm'),
      first_day: firstDay,
      last_day: lastDay,
      multi_day: lastDay > firstDay,
      category: hasCategory ? categoryName.toLowerCase() : null,
      category_name: hasCategory ? categoryName : null,
      venue_name: row.venue_id?.name || null,
      artists: artistMap[row.id] || [],
      photo_path: row.photo_path ? baseUrl + encodeURIComponent(row.photo_path) : null,
    });
  }

  // 4️⃣ For each year: the Official days, the Lead-up and the categories in use
  const schedule = {};

  for (const y of Object.values(years)) {
    const officialDays = [];
    if (y.officialStart && y.officialEnd) {
      let day = DateTime.fromISO(y.officialStart, { zone: ZONE });
      const lastOfficial = DateTime.fromISO(y.officialEnd, { zone: ZONE });
      for (; day <= lastOfficial; day = day.plus({ days: 1 })) {
        const date = day.toISODate();
        officialDays.push({
          date,
          weekday: day.toFormat('ccc'),
          day_number: day.toFormat('d'),
          points: y.points.filter(p => p.first_day <= date && p.last_day >= date),
        });
      }
    }

    const leadUp = y.officialStart
      ? y.points.filter(p => p.last_day < y.officialStart)
      : [];

    const categories = [];
    for (const p of y.points) {
      if (p.category && !categories.some(c => c.category === p.category)) {
        categories.push({ category: p.category, category_name: p.category_name });
      }
    }
    categories.sort((a, b) => a.category_name.localeCompare(b.category_name));

    schedule[y.year] = {
      year: y.year,
      officialDays,
      leadUp,
      points: y.points,
      categories,
    };
  }

  return schedule;
}
