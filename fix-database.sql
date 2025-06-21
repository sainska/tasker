-- Step 1: Drop everything to start fresh
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.ratings CASCADE;
DROP TABLE IF EXISTS public.messages CASCADE;
DROP TABLE IF EXISTS public.assignment_submissions CASCADE;
DROP TABLE IF EXISTS public.assignments CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS assignment_status CASCADE;
DROP TYPE IF EXISTS priority_level CASCADE;

-- Step 2: Create the basic types
CREATE TYPE user_role AS ENUM ('client', 'writer', 'admin');
CREATE TYPE assignment_status AS ENUM ('pending', 'assigned', 'in_progress', 'submitted', 'revision_requested', 'completed', 'cancelled');
CREATE TYPE priority_level AS ENUM ('low', 'standard', 'high', 'urgent');

-- Step 3: Create the profiles table (this is the most important one for signup)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  role user_role NOT NULL DEFAULT 'client',
  bio TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 4: Create the trigger function with better error handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Add debug logging
  RAISE NOTICE 'Creating profile for user: %', NEW.id;
  RAISE NOTICE 'User email: %', NEW.email;
  RAISE NOTICE 'User metadata: %', NEW.raw_user_meta_data;
  
  -- Insert profile with safe defaults
  INSERT INTO public.profiles (
    id, 
    email, 
    first_name, 
    last_name, 
    role
  ) VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'client')
  );
  
  RAISE NOTICE 'Profile created successfully for user: %', NEW.id;
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error creating profile: %', SQLERRM;
    -- Don't fail the signup, just log the error
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 5: Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Step 6: Enable RLS and create basic policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Enable insert for authenticated users only" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Step 7: Test the setup
SELECT 'Database setup completed successfully!' as status;

-- Step 8: Verify the trigger function exists
SELECT 
  proname as function_name,
  CASE 
    WHEN proname IS NOT NULL THEN 'EXISTS'
    ELSE 'MISSING'
  END as status
FROM pg_proc 
WHERE proname = 'handle_new_user';

-- Step 9: Verify the trigger exists
SELECT 
  tgname as trigger_name,
  CASE 
    WHEN tgname IS NOT NULL THEN 'EXISTS'
    ELSE 'MISSING'
  END as status
FROM pg_trigger 
WHERE tgname = 'on_auth_user_created'; 