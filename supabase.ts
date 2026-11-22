
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) console.log('Supabase environment check:', {
    urlLoaded: Boolean(supabaseUrl),
    keyLoaded: Boolean(supabaseKey)
  })
 {
  throw new Error('Supabase environment variables are missing.')
}

export const supabase = createClient(
  supabaseUrl,
  supabaseKey
)

export async function testSupabaseConnection() {
  const { data, error } = await supabase
    .from('students')
    .select('id')
    .limit(1)

  if (error) {
    console.error('Supabase connection error:', error.message)
    return false
  }

  console.log('Little Scholars connected to Supabase!', data)
  return true
}
