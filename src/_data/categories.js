// _data/categories.js

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

module.exports = async function() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLIC_KEY
  );

  const { data: categories, error } = await supabase
    .from('categories')
    .select('*')
    .eq('public', true)
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching categories:', error);
    return [];
  }

  // Filter out "Uncategorized" category
  return (categories || []).filter(cat => cat.name !== 'Uncategorized');
};
