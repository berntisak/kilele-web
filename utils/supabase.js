// utils/supabase.js
//
// One Supabase client, and one error path, for every src/_data/*.js source.
//
// Why this exists: each data file used to build its own client and treat a
// failed query as "no rows" — log to the console and return `[]`. Eleventy
// cannot see a console.error, so the build succeeded and the page shipped
// empty. That is how kilele-cms#246's column grants took the lineup down on
// two branches without anything going red: PostgREST answered 42501
// "permission denied for table artists", lineup.js swallowed it, and the
// build wrote a lineup page with nothing on it.
//
// `must()` throws instead. A failed read now fails `npx eleventy`, which
// fails the Eleventy Build Check workflow on every pull request — so the next
// permission change is caught in CI rather than on the live site.

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

/** Memoised client, so the env is read and validated once per build. */
let cached = null;

/**
 * The anon-key Supabase client the build reads public content with.
 *
 * Memoised deliberately: the data files used to create one client each, and
 * each one had to remember `require('dotenv').config()` itself. news.js and
 * staticPages.js never did — they worked only because some other data file
 * had been evaluated first and left the env populated. Loading it here once
 * removes that ordering dependency.
 *
 * @returns {import('@supabase/supabase-js').SupabaseClient} the shared client.
 * @throws {Error} when either public env var is missing, rather than letting
 *                 supabase-js fail later with a less obvious message.
 */
function client() {
  if (cached) return cached;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLIC_KEY;

  if (!url || !key) {
    const missing = [
      !url ? 'NEXT_PUBLIC_SUPABASE_URL' : null,
      !key ? 'NEXT_PUBLIC_SUPABASE_PUBLIC_KEY' : null,
    ].filter(Boolean).join(' and ');
    throw new Error(
      `Supabase env missing: ${missing}. Set it in .env locally, or as a ` +
      'repository secret for the Eleventy Build Check workflow.'
    );
  }

  cached = createClient(url, key);
  return cached;
}

/**
 * Awaits a supabase-js query and throws if PostgREST reported an error.
 *
 * An empty result is NOT an error: a table that legitimately matches no rows
 * returns `[]` and the build carries on. Only a real failure — permission
 * denied, a column that does not exist, an unreachable project — throws.
 *
 * @param {string} label What was being read, for the message, e.g.
 *   "artists (lineup)". Passed by hand because a supabase-js builder does not
 *   expose the table it was built against.
 * @param {PromiseLike<{data: unknown, error: unknown}>} query A supabase-js
 *   builder; it is thenable, so awaiting it runs it.
 * @returns {Promise<any[]>} the rows, or `[]` when the query matched nothing.
 * @throws {Error} carrying PostgREST's code, details and hint, so that a 42501
 *   reads as the grant problem it is instead of an empty page.
 */
async function must(label, query) {
  const { data, error } = await query;

  if (error) {
    // Keep every field PostgREST sent: `code` is what distinguishes a grant
    // problem (42501) from a missing column (42703), and the hint is often
    // the actual fix.
    const parts = [error.message || 'unknown error'];
    if (error.code) parts.push(`code ${error.code}`);
    if (error.details) parts.push(String(error.details));
    if (error.hint) parts.push(`hint: ${error.hint}`);
    throw new Error(`Supabase read failed — ${label}: ${parts.join(' · ')}`);
  }

  return data || [];
}

module.exports = { client, must };
