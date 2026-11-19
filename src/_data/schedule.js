// _data/schedule.js
// The public program, one entry per festival year: schedule["2026"] (#193).

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const { DateTime } = require('luxon');

const ZONE = 'Africa/Nairobi';

// The Timetable view's clock (#204): a time as a 15-minute slot counted from
// 06:00, so 06:00 is slot 1, 14:30 is slot 35 and 00:30 that night is slot 75.
// Like first_day / last_day below, before 06:00 counts as the night before.
function slotOf(time) {
  const minutesSinceSix = (time.hour * 60 + time.minute - 360 + 1440) % 1440;
  return Math.floor(minutesSinceSix / 15) + 1;
}

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
      venue_id (name, sorting_id),
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
    const first = start.hour < 6 ? start.minus({ days: 1 }) : start;
    const last = end.hour < 6 ? end.minus({ days: 1 }) : end;
    const firstDay = first.toISODate();
    const lastDay = last.toISODate();

    // "16–20 Feb", or "28 Feb–2 Mar" across a month boundary
    const dateRange = first.month === last.month
      ? `${first.toFormat('d')}–${last.toFormat('d LLL')}`
      : `${first.toFormat('d LLL')}–${last.toFormat('d LLL')}`;

    // Where the point sits on its day's clock. A multi-day point uses its
    // daily times. An end at or before the start (only an end at exactly
    // 06:00) gets one hour, so it's never zero-wide.
    const startSlot = slotOf(start);
    const endSlot = slotOf(end) > startSlot ? slotOf(end) : startSlot + 4;

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
      start_slot: startSlot,
      end_slot: endSlot,
      first_day: firstDay,
      last_day: lastDay,
      multi_day: lastDay > firstDay,
      day_label: first.toFormat('cccc d LLLL'),
      date_range: lastDay > firstDay ? dateRange : null,
      category: hasCategory ? categoryName.toLowerCase() : null,
      category_name: hasCategory ? categoryName : null,
      venue_name: row.venue_id?.name || null,
      venue_sort: row.venue_id?.sorting_id ?? null,
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
        const points = y.points.filter(p => p.first_day <= date && p.last_day >= date);

        // The day's clock for the Timetable view: from the hour its first
        // point starts to the hour after its last point ends. Hours begin on
        // slots 1, 5, 9 … so these round out to the nearest of those.
        const earliest = Math.min(...points.map(p => p.start_slot));
        const latest = Math.max(...points.map(p => p.end_slot));
        const firstSlot = points.length ? Math.floor((earliest - 1) / 4) * 4 + 1 : null;
        const lastSlot = points.length ? Math.ceil((latest - 1) / 4) * 4 + 1 : null;

        // The hour labels along the top: the slot each hour starts on and
        // its time, "10:00" … "02:00".
        const hours = [];
        for (let slot = firstSlot; points.length && slot < lastSlot; slot += 4) {
          const hour = (6 + (slot - 1) / 4) % 24;
          hours.push({ slot, label: `${String(hour).padStart(2, '0')}:00` });
        }

        // The day's venues, each with its points, in the CMS's venue order
        // (sorting_id, the internal schedule's priority), then by name
        // where numbers tie. Venues without a number go last.
        const venues = [];
        for (const p of points) {
          let venue = venues.find(v => v.name === p.venue_name);
          if (!venue) {
            venue = { name: p.venue_name, sort: p.venue_sort, points: [] };
            venues.push(venue);
          }
          venue.points.push(p);
        }
        venues.sort((a, b) =>
          (a.sort ?? Infinity) - (b.sort ?? Infinity) || (a.name ?? '').localeCompare(b.name ?? ''));

        // A point that starts while an earlier one in its venue is still
        // running is drawn on top of it, shifted a little (the cascade, #204).
        // Copies, because a multi-day point is shared with its other days.
        for (const venue of venues) {
          venue.points = venue.points
            .sort((a, b) => a.start_slot - b.start_slot)
            .map((p, i, all) => ({
              ...p,
              overlaps_earlier: all.slice(0, i).some(e => e.end_slot > p.start_slot),
            }));
        }

        officialDays.push({
          date,
          weekday: day.toFormat('ccc'),
          day_number: day.toFormat('d'),
          points,
          first_slot: firstSlot,
          last_slot: lastSlot,
          hours,
          venues,
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
