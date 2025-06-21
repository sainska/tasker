
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://yzoduvbwhtiulnzrgyzz.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6b2R1dmJ3aHRpdWxuenJneXp6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1MjgzNDEsImV4cCI6MjA2NjEwNDM0MX0.BVCFDagzl7KLOmt6Wm0zigDE-T6_Rc8y6vj8RubMxbk'

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
})
