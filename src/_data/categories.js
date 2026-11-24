// _data/categories.js

const { client, must } = require('../../utils/supabase');

module.exports = async function() {
  const supabase = client();

  // Explicit column list, never select('*'): PostgREST answers select=* with
  // "permission denied" as soon as any column is withheld from the anon role,
  // the way it already is on `artists` (kilele-cms#246). `categories` has no
  // column grants today, so this is precaution, not a fix: it keeps a future
  // grant from silently emptying the schedule's filter bar, since the error
  // below is only logged. Templates read `name` only; `public` is the filter.
  // A column added here must also be readable by anon, or this query fails.
  const categories = await must('categories (schedule filters)', supabase
    .from('categories')
    .select('id, name, public')
    .eq('public', true)
    .order('name', { ascending: true }));

  // Filter out "Uncategorized" category
  return categories.filter(cat => cat.name !== 'Uncategorized');
};
