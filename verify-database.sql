-- Database Verification Script
-- Run this in your Supabase SQL Editor to check if everything is set up correctly

-- Check if tables exist
SELECT 
  table_name,
  CASE 
    WHEN table_name IS NOT NULL THEN 'EXISTS'
    ELSE 'MISSING'
  END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('profiles', 'assignments', 'assignment_submissions', 'messages', 'ratings', 'notifications');

-- Check if types exist
SELECT 
  typname as type_name,
  CASE 
    WHEN typname IS NOT NULL THEN 'EXISTS'
    ELSE 'MISSING'
  END as status
FROM pg_type 
WHERE typname IN ('user_role', 'assignment_status', 'priority_level');

-- Check if functions exist
SELECT 
  proname as function_name,
  CASE 
    WHEN proname IS NOT NULL THEN 'EXISTS'
    ELSE 'MISSING'
  END as status
FROM pg_proc 
WHERE proname IN ('handle_new_user', 'update_updated_at_column');

-- Check if triggers exist
SELECT 
  tgname as trigger_name,
  CASE 
    WHEN tgname IS NOT NULL THEN 'EXISTS'
    ELSE 'MISSING'
  END as status
FROM pg_trigger 
WHERE tgname IN ('on_auth_user_created', 'update_profiles_updated_at', 'update_assignments_updated_at');

-- Check RLS policies
SELECT 
  schemaname,
  tablename,
  policyname,
  CASE 
    WHEN policyname IS NOT NULL THEN 'EXISTS'
    ELSE 'MISSING'
  END as status
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename IN ('profiles', 'assignments', 'assignment_submissions', 'messages', 'ratings', 'notifications');

-- Test the handle_new_user function (this should not create any actual data)
DO $$
BEGIN
  -- Test if the function can be called (it won't actually insert anything)
  PERFORM handle_new_user();
  RAISE NOTICE 'handle_new_user function is working correctly';
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'handle_new_user function has an error: %', SQLERRM;
END $$; 