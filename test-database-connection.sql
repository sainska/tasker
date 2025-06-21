-- Test Database Connection and Permissions
-- Run this to verify that the database is accessible and properly configured

-- Test 1: Check if we can access the profiles table
SELECT 'Test 1: Profiles table access' as test_name;
SELECT COUNT(*) as profiles_count FROM public.profiles;

-- Test 2: Check if RLS is enabled
SELECT 'Test 2: RLS status' as test_name;
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'profiles';

-- Test 3: Check existing policies
SELECT 'Test 3: RLS policies' as test_name;
SELECT 
    policyname,
    cmd,
    permissive
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'profiles'
ORDER BY policyname;

-- Test 4: Check if auth.uid() function works
SELECT 'Test 4: auth.uid() function' as test_name;
SELECT auth.uid() as current_user_id;

-- Test 5: Check if we can insert a test profile (this will fail if RLS is blocking)
SELECT 'Test 5: Test profile insertion' as test_name;
-- This will only work if you're authenticated
-- INSERT INTO public.profiles (id, email, first_name, last_name, role)
-- VALUES ('test-user-id', 'test@example.com', 'Test', 'User', 'client')
-- ON CONFLICT (id) DO NOTHING;

-- Test 6: Check table structure
SELECT 'Test 6: Profiles table structure' as test_name;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'profiles'
ORDER BY ordinal_position;

-- Test 7: Check if extensions are enabled
SELECT 'Test 7: Required extensions' as test_name;
SELECT 
    extname,
    extversion
FROM pg_extension 
WHERE extname IN ('uuid-ossp', 'pgcrypto');

-- Test 8: Check permissions for authenticated role
SELECT 'Test 8: Permissions check' as test_name;
SELECT 
    table_name,
    privilege_type
FROM information_schema.table_privileges 
WHERE table_schema = 'public' 
AND table_name = 'profiles'
AND grantee = 'authenticated';

-- Test 9: Check if trigger function exists
SELECT 'Test 9: Trigger function' as test_name;
SELECT 
    routine_name,
    routine_type
FROM information_schema.routines 
WHERE routine_schema = 'public'
AND routine_name = 'handle_new_user';

-- Test 10: Check if trigger exists
SELECT 'Test 10: Trigger existence' as test_name;
SELECT 
    trigger_name,
    event_object_table,
    action_timing,
    event_manipulation
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
AND event_object_table = 'users'
AND trigger_name = 'on_auth_user_created';

-- Summary
SELECT 'DATABASE CONNECTION TEST COMPLETE' as summary; 