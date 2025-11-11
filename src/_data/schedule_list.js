// _data/schedule_list.js
const schedule = require('./schedule.js');

module.exports = async function() {
  const grouped = await schedule();

  // Flatten grouped object into a single array
  const flatList = Object.values(grouped).flat();

  // Optional: log to confirm slugs are there
  console.log("Program points for slug pages:", flatList.map(p => p.slug));

  return flatList;
};

    /*
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
  // Build full image URLs
  const baseUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/program_points/`;

   return (
    schedule || []).map(point => ({ 
        ...point, 
        photo_path: point.photo_path ? baseUrl + point.photo_path : null,
    })); 
    */
