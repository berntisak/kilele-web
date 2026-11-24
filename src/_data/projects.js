// _data/projects.js

const { client, must } = require('../../utils/supabase');
const { DateTime } = require('luxon');

module.exports = async function() {
  const supabase = client();

  // 1️⃣ Get all projects with their artists + program points
  const projects = await must('projects (projects)', supabase
    .from('projects')
    .select(`
      *
    `)
    .eq('public', true)
    .order('title', { ascending: true }));

  // 2️⃣ Fetch artists linked to each project
  const artistLinks = await must('project_artists (projects)', supabase
    .from('project_artists')
    .select(`
      project_id,
      artists (name, slug, public)
    `));

  const artistMap = {};
  artistLinks.forEach(link => {
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
  const programLinks = await must('project_program_points (projects)', supabase
    .from('project_program_points')
    .select(`
      project_id,
      program_points (title, short_title, slug, public)
    `));

  const programMap = {};
  programLinks.forEach(link => {
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

  return projects.map(project => ({
      ...project,
      artists: artistMap[project.id] || [],
      programPoints: programMap[project.id] || [],

      photo_path_small: project.image_path ? `${baseUrl}${encodeURIComponent(project.image_path)}?width=100&quality=70`: null,
      photo_path: project.image_path ? baseUrl + encodeURIComponent(project.image_path) : null,
  }));
};
