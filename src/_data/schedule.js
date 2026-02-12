// _data/schedule.js

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const { DateTime } = require('luxon');

module.exports = async function() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLIC_KEY
  );

  // 1️⃣ Get all program points with their category + venue info
  const { data: schedule, error } = await supabase
    .from('program_points')
    .select(`
      id, title, short_title, description, photo_path, start_time, end_time, slug, public,
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
      artists (name, slug, public)
    `);

  if (artistError) console.error('Error fetching artists:', artistError);

  const artistMap = {};
  (artistLinks || []).forEach(link => {
    // Only include public artists
    if (link.artists?.public) {
      if (!artistMap[link.program_point_id]) artistMap[link.program_point_id] = [];
      artistMap[link.program_point_id].push({
        name: link.artists.name,
        slug: link.artists.slug
      });
    }
  });

  // 3️⃣ Enrich the schedule items
  const baseUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/program_points/`;

  const enriched = (schedule || []).map(point => {
    const start = DateTime.fromISO(point.start_time, { zone: 'Africa/Nairobi' });
    const end = DateTime.fromISO(point.end_time, { zone: 'Africa/Nairobi' });

    // If event starts between midnight and 6 AM, group it with the previous day
    const displayDate = start.hour < 6 ? start.minus({ days: 1 }) : start;

    return {
      ...point,
      category_name: point.category_id?.name || null,
      category_color: point.category_id?.color || null,
      venue_name: point.venue_id?.name || null,
      artists: artistMap[point.id] || [],
      weekday_date: displayDate.isValid ? displayDate.toFormat('cccc dd.MM') : null,
      start_time_local: start.isValid ? start.toFormat('HH:mm') : null,
      end_time_local: end.isValid ? end.toFormat('HH:mm') : null,
      photo_path_small: point.photo_path ? `${baseUrl}${encodeURIComponent(point.photo_path)}?width=100&quality=70`: null,
      photo_path: point.photo_path ? baseUrl + encodeURIComponent(point.photo_path) : null,
    };
  });

  // 4️⃣ Separate multi-day events from single-day events
  const multiDayEvents = [];
  const singleDayEvents = [];

  for (const p of enriched) {
    const start = DateTime.fromISO(p.start_time, { zone: 'Africa/Nairobi' });
    const end = DateTime.fromISO(p.end_time, { zone: 'Africa/Nairobi' });
    
    // Calculate event duration in hours
    const durationHours = end.diff(start, 'hours').hours;
    
    // Only consider it multi-day if it's at least 24 hours long
    if (durationHours >= 24) {
      // Multi-day event
      const startDay = start.startOf('day');
      const endDay = end.startOf('day');
      const daysDiff = endDay.diff(startDay, 'days').days;
      
      multiDayEvents.push({
        ...p,
        date_range: `${start.toFormat('cccc dd.MM')} to ${end.toFormat('cccc dd.MM')}`,
        days_count: Math.round(daysDiff-0.5) + 1,
        start_day: start.toFormat('cccc dd.MM'),
        end_day: end.toFormat('cccc dd.MM'),
      });
    } else {
      singleDayEvents.push(p);
    }
  }

  // 5️⃣ Group single-day events by day
  const grouped = {};
  for (const p of singleDayEvents) {
    if (!grouped[p.weekday_date]) grouped[p.weekday_date] = [];
    grouped[p.weekday_date].push(p);
  }

  return {
    byDay: grouped,
    multiDay: multiDayEvents
  };
};
