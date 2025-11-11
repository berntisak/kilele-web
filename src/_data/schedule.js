// _data/lineup.js
/*
require('dotenv').config(); // load .env vars if running locally
const { createClient } = require('@supabase/supabase-js');
const { DateTime } = require('luxon'); // for timezone-safe date handling

module.exports = async function() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  const { data: schedule, error } = await supabase
    .from('program_points')
    .select('*')
    .eq('public', true)
    .order('start_time', { ascending: true });

  if (error) {
    console.error('Error fetching schedule:', error);
    return [];
  }

  if (schedule != null) {
    console.log("Slugs found: " + schedule.length)
    for (var i = 0; i < schedule.length; i++) {
      console.log(schedule[i].slug);
    }
  }
  else {
    console.log("No schedule found")
  }

  // Build full image URLs
  const baseUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/program_points/`;

  // Format times and group by day
  const grouped = {};
  for (const point of schedule || []) {
    const start = DateTime.fromISO(point.start_time, { zone: 'Africa/Nairobi' });
    const end = DateTime.fromISO(point.end_time, { zone: 'Africa/Nairobi' });

    const formattedDate = start.toFormat('cccc dd.MM'); // e.g. Wednesday 12.08
    const formattedStart = start.toFormat('HH:mm');
    const formattedEnd = end.toFormat('HH:mm');

    const day = formattedDate;
    if (!grouped[day]) grouped[day] = [];

    grouped[day].push({
      ...point,
      date: formattedDate,
      start_time_local: formattedStart,
      end_time_local: formattedEnd,
      photo_path: point.photo_path ? baseUrl + point.photo_path : null,
    });
  }

  return grouped;

};
*/
/*
const { DateTime } = require('luxon');
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

module.exports = async function() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  const { data: schedule, error } = await supabase
    .from('program_points')
    .select('*')
    .eq('public', true)
    .order('start_time', { ascending: true });

  if (error) {
    console.error('Error fetching schedule:', error);
    return [];
  }

  const baseUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/program_points/`;

  // Format and enrich
  const enriched = (schedule || []).map(point => {
    const start = DateTime.fromISO(point.start_time, { zone: 'Africa/Nairobi' });
    const end = DateTime.fromISO(point.end_time, { zone: 'Africa/Nairobi' });

    return {
      ...point,
      weekday_date: start.toFormat('cccc dd.MM'), // e.g. Wednesday 12.08
      start_time_local: start.toFormat('HH:mm'),
      end_time_local: end.toFormat('HH:mm'),
      photo_path: point.photo_path ? baseUrl + point.photo_path : null,
    };
  });

  // Group by day for index page
  const grouped = {};
  for (const p of enriched) {
    if (!grouped[p.weekday_date]) grouped[p.weekday_date] = [];
    grouped[p.weekday_date].push(p);
  }
  
  return {
    list: enriched,   // flat array for pagination ([slug].html)
    grouped: grouped, // object for index page (schedule.html)
  };
};
*/

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const { DateTime } = require('luxon');

module.exports = async function() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  // 1️⃣ Get all program points with their category + venue info
  const { data: schedule, error } = await supabase
    .from('program_points')
    .select(`
      id, title, description, photo_path, start_time, end_time, slug, public,
      category_id (name, color),
      venue_id (name)
    `)
    .eq('public', true)
    .order('start_time', { ascending: true });

  if (error) {
    console.error('Error fetching schedule:', error);
    return [];
  }

  // 2️⃣ Fetch artists linked to each program point
  const { data: artistLinks, error: artistError } = await supabase
    .from('program_point_artists')
    .select(`
      program_point_id,
      artists (name)
    `);

  if (artistError) console.error('Error fetching artists:', artistError);

  const artistMap = {};
  (artistLinks || []).forEach(link => {
    if (!artistMap[link.program_point_id]) artistMap[link.program_point_id] = [];
    artistMap[link.program_point_id].push(link.artists?.name);
  });

  // 3️⃣ Enrich the schedule items
  const baseUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/program_points/`;

  const enriched = (schedule || []).map(point => {
    const start = DateTime.fromISO(point.start_time, { zone: 'Africa/Nairobi' });
    const end = DateTime.fromISO(point.end_time, { zone: 'Africa/Nairobi' });

    return {
      ...point,
      category_name: point.category_id?.name || null,
      category_color: point.category_id?.color || null,
      venue_name: point.venue_id?.name || null,
      artists: artistMap[point.id] || [],
      weekday_date: start.isValid ? start.toFormat('cccc dd.MM') : null,
      start_time_local: start.isValid ? start.toFormat('HH:mm') : null,
      end_time_local: end.isValid ? end.toFormat('HH:mm') : null,
      photo_path_small: point.photo_path ? `${baseUrl}${point.photo_path}?width=100&quality=70`: null,
      photo_path: point.photo_path ? baseUrl + point.photo_path : null,
    };
  });

  // 4️⃣ Group by day for schedule.html
  const grouped = {};
  for (const p of enriched) {
    if (!grouped[p.weekday_date]) grouped[p.weekday_date] = [];
    grouped[p.weekday_date].push(p);
  }

  return grouped;
};
