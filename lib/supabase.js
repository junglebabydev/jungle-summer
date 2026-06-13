import { createClient } from '@supabase/supabase-js'

// These should be environment variables in production
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'YOUR_SUPABASE_URL'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY'

// For admin operations, you might need the service role key (use with caution!)
// const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'YOUR_SERVICE_ROLE_KEY'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Optional: Create a separate client for admin operations with service role key
// export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)