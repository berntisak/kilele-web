// _data/projects.js

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const { DateTime } = require('luxon');

module.exports = async function() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLIC_KEY
  );

  // 1️⃣ Get all projects with their artists + program points
  const { data: projects, error } = await supabase
    .from('projects')
    .select(`
      *
    `)
    .eq('public', true)
    .order('title', { ascending: true });

  if (error) {
    console.error('Error fetching projects:', error);
    return [];
  }

  // 2️⃣ Fetch artists linked to each project
  const { data: artistLinks, error: artistError } = await supabase
    .from('project_artists')
    .select(`
      project_id,
      artists (name, slug, public)
    `);

  if (artistError) console.error('Error fetching artists:', artistError);

  const artistMap = {};
  (artistLinks || []).forEach(link => {
    // Only include public artists
    if (link.artists?.public) {
      if (!artistMap[link.project_id]) artistMap[link.project_id] = [];
      artistMap[link.project_id].push({
        name: link.artists.name,
        slug: link.artists.slug
      });
    }
  });

  // 2️⃣ Fetch artists linked to each project
  const { data: programLinks, error: programError } = await supabase
    .from('project_program_points')
    .select(`
      project_id,
      program_points (title, short_title, slug, public)
    `);

  if (programError) console.error('Error fetching program points:', programError);

  const programMap = {};
  (programLinks || []).forEach(link => {
    // Only include public program points
    if (link.program_points?.public) {
      if (!programMap[link.project_id]) programMap[link.project_id] = [];
      programMap[link.project_id].push({
        title: link.program_points.title,
        short_title: link.program_points.short_title,
        slug: link.program_points.slug
      });
    }
  });

    // Build full image URLs
  const baseUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/projects/`;

  return (projects || []).map(project => ({
      ...project,
      artists: artistMap[project.id] || [],
      programPoints: programMap[project.id] || [],

      photo_path_small: project.image_path ? `${baseUrl}${encodeURIComponent(project.image_path)}?width=100&quality=70`: null,
      photo_path: project.image_path ? baseUrl + encodeURIComponent(project.image_path) : null,
  }));
};
