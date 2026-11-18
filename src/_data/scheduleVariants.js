// PROTOTYPE — throwaway (#193). The 2026 program arranged the way #193 decided,
// so the three variants can be judged on real data: split by festival year,
// Main program days from the official dates (multi-day points on every day
// they run), then the Lead-up. The real version gets rewritten in schedule.js.
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const { DateTime } = require('luxon');

const ZONE = 'Africa/Nairobi';
const CATS = ['performance', 'workshop', 'panel', 'presentation', 'sundowner', 'networking', 'installation'];

module.exports = async function () {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_PUBLIC_KEY);
    const { data, error } = await supabase
        .from('program_points')
        .select(`id, title, short_title, description, photo_path, start_time, end_time, slug,
            category_id (name), venue_id (name),
            festival_id (year, official_start_date, official_end_date)`)
        .eq('public', true)
        .order('start_time', { ascending: true });
    if (error) { console.error(error); return {}; }

    const base = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/render/image/public/program_points/`;
    const byYear = {};
    data.forEach((p, i) => {
        const f = p.festival_id || {};
        const year = String(f.year);
        const y = (byYear[year] ||= { year, officialStart: f.official_start_date, officialEnd: f.official_end_date, points: [] });
        const start = DateTime.fromISO(p.start_time, { zone: ZONE });
        const end = DateTime.fromISO(p.end_time, { zone: ZONE });
        // Before 06:00 counts as the night before (as schedule.js does).
        const firstDay = (start.hour < 6 ? start.minus({ days: 1 }) : start).startOf('day');
        const lastDay = (end.hour < 6 ? end.minus({ days: 1 }) : end).startOf('day');
        const cat = (p.category_id?.name || '').toLowerCase();
        y.points.push({
            title: p.title,
            short_title: p.short_title,
            description: p.description,
            slug: p.slug,
            start: start.toISO(), end: end.toISO(),
            time: `${start.toFormat('HH:mm')}–${end.toFormat('HH:mm')}`,
            range: `${firstDay.toFormat('d')}–${lastDay.toFormat('d LLL')}`,
            multiDay: lastDay > firstDay,
            firstDay: firstDay.toISODate(), lastDay: lastDay.toISODate(),
            dayLabel: firstDay.toFormat('cccc d LLLL'),
            venue: p.venue_id?.name || '',
            category: CATS.includes(cat) ? cat : 'none',
            categoryName: CATS.includes(cat) ? p.category_id.name : '',
            photo: p.photo_path ? `${base}${encodeURIComponent(p.photo_path)}?width=800&quality=70` : null,
            photoSmall: p.photo_path ? `${base}${encodeURIComponent(p.photo_path)}?width=240&quality=70` : null,
        });
    });

    for (const y of Object.values(byYear)) {
        const days = [];
        let d = DateTime.fromISO(y.officialStart, { zone: ZONE });
        const last = DateTime.fromISO(y.officialEnd, { zone: ZONE });
        for (; d <= last; d = d.plus({ days: 1 })) {
            const iso = d.toISODate();
            const pts = y.points.filter((p) => p.firstDay <= iso && p.lastDay >= iso);
            // Multi-day points first, then by start time.
            pts.sort((a, b) => (b.multiDay - a.multiDay) || a.start.localeCompare(b.start));
            days.push({ iso, id: d.toFormat('ccc-d').toLowerCase(), short: d.toFormat('ccc d').toUpperCase(), label: d.toFormat('cccc d LLLL'), points: pts });
        }
        y.days = days;
        y.leadUp = y.points.filter((p) => p.lastDay < y.officialStart);
        y.categories = CATS.filter((c) => y.points.some((p) => p.category === c))
            .map((c) => ({ id: c, name: c[0].toUpperCase() + c.slice(1), count: y.points.filter((p) => p.category === c).length }));
        y.mainCount = y.points.length - y.leadUp.length;
        y.venueCount = new Set(y.points.map((p) => p.venue)).size;
        y.bySlug = {};
        y.points.forEach((p) => {
            if (p.slug) y.bySlug[p.slug] = p;
            const day = days.find((d) => d.iso === (p.firstDay < y.officialStart ? y.officialStart : p.firstDay));
            p.dayId = p.lastDay < y.officialStart ? 'lead-up' : day ? day.id : 'lead-up';
        });
    }
    return byYear;
};
