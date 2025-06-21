-- Database Verification Script
-- Run this to check if all components are properly set up

-- Check if tables exist
SELECT 'Tables Check' as check_type;
SELECT 
    table_name,
    CASE WHEN table_name IS NOT NULL THEN '✓ EXISTS' ELSE '✗ MISSING' END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('profiles', 'assignments', 'assignment_submissions', 'messages', 'ratings', 'notifications')
ORDER BY table_name;

-- Check if indexes exist
SELECT 'Indexes Check' as check_type;
SELECT 
    indexname,
    CASE WHEN indexname IS NOT NULL THEN '✓ EXISTS' ELSE '✗ MISSING' END as status
FROM pg_indexes 
WHERE schemaname = 'public' 
AND indexname LIKE 'idx_%'
ORDER BY indexname;

-- Check if triggers exist
SELECT 'Triggers Check' as check_type;
SELECT 
    trigger_name,
    event_object_table,
    CASE WHEN trigger_name IS NOT NULL THEN '✓ EXISTS' ELSE '✗ MISSING' END as status
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- Check if functions exist
SELECT 'Functions Check' as check_type;
SELECT 
    routine_name,
    CASE WHEN routine_name IS NOT NULL THEN '✓ EXISTS' ELSE '✗ MISSING' END as status
FROM information_schema.routines 
WHERE routine_schema = 'public'
AND routine_name IN ('handle_updated_at', 'handle_new_user', 'get_user_stats', 'get_admin_stats')
ORDER BY routine_name;

-- Check if RLS is enabled
SELECT 'RLS Check' as check_type;
SELECT 
    schemaname,
    tablename,
    CASE WHEN rowsecurity THEN '✓ ENABLED' ELSE '✗ DISABLED' END as rls_status
FROM pg_tables 
WHERE schemaname = 'public'
AND tablename IN ('profiles', 'assignments', 'assignment_submissions', 'messages', 'ratings', 'notifications')
ORDER BY tablename;

-- Check if storage bucket exists
SELECT 'Storage Bucket Check' as check_type;
SELECT 
    id as bucket_id,
    name as bucket_name,
    CASE WHEN id IS NOT NULL THEN '✓ EXISTS' ELSE '✗ MISSING' END as status
FROM storage.buckets 
WHERE id = 'assignment-files';

-- Check if policies exist
SELECT 'Policies Check' as check_type;
SELECT 
    schemaname,
    tablename,
    policyname,
    CASE WHEN policyname IS NOT NULL THEN '✓ EXISTS' ELSE '✗ MISSING' END as status
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Check if extensions are enabled
SELECT 'Extensions Check' as check_type;
SELECT 
    extname,
    CASE WHEN extname IS NOT NULL THEN '✓ ENABLED' ELSE '✗ DISABLED' END as status
FROM pg_extension 
WHERE extname IN ('uuid-ossp', 'pgcrypto');

-- Test data insertion (optional - for testing)
-- Uncomment the following lines to test data insertion

/*
-- Test profile creation
INSERT INTO public.profiles (id, email, first_name, last_name, role)
VALUES (
    '11111111-1111-1111-1111-111111111111',
    'test@example.com',
    'Test',
    'User',
    'client'
) ON CONFLICT (id) DO NOTHING;

-- Test assignment creation
INSERT INTO public.assignments (id, title, description, subject, pages, budget, deadline, client_id)
VALUES (
    '22222222-2222-2222-2222-222222222222',
    'Test Assignment',
    'This is a test assignment',
    'Computer Science',
    5,
    100.00,
    NOW() + INTERVAL '7 days',
    '11111111-1111-1111-1111-111111111111'
) ON CONFLICT (id) DO NOTHING;

SELECT 'Test Data Inserted Successfully' as test_result;
*/

-- Summary
SELECT 'DATABASE SETUP VERIFICATION COMPLETE' as summary; 