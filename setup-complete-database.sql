-- Complete Database Setup for Tasker Application
-- This script sets up all tables, storage buckets, RLS policies, and triggers

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    first_name TEXT,
    last_name TEXT,
    role TEXT CHECK (role IN ('client', 'writer', 'admin')) DEFAULT 'client',
    is_active BOOLEAN DEFAULT true,
    bio TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create assignments table
CREATE TABLE IF NOT EXISTS public.assignments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    subject TEXT NOT NULL,
    pages INTEGER NOT NULL,
    budget DECIMAL(10,2) NOT NULL,
    deadline TIMESTAMP WITH TIME ZONE NOT NULL,
    priority TEXT CHECK (priority IN ('low', 'standard', 'high', 'urgent')) DEFAULT 'standard',
    status TEXT CHECK (status IN ('pending', 'in_progress', 'submitted', 'revision_requested', 'completed', 'cancelled')) DEFAULT 'pending',
    client_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    writer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create assignment_submissions table
CREATE TABLE IF NOT EXISTS public.assignment_submissions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    assignment_id UUID REFERENCES public.assignments(id) ON DELETE CASCADE NOT NULL,
    writer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    file_url TEXT,
    content TEXT,
    submission_notes TEXT,
    status TEXT CHECK (status IN ('submitted', 'approved', 'revision_requested')) DEFAULT 'submitted',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create messages table
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    assignment_id UUID REFERENCES public.assignments(id) ON DELETE CASCADE NOT NULL,
    sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    receiver_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create ratings table
CREATE TABLE IF NOT EXISTS public.ratings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    assignment_id UUID REFERENCES public.assignments(id) ON DELETE CASCADE NOT NULL,
    rater_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    rated_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT CHECK (type IN ('assignment', 'message', 'rating', 'system')) NOT NULL,
    is_read BOOLEAN DEFAULT false,
    related_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_assignments_client_id ON public.assignments(client_id);
CREATE INDEX IF NOT EXISTS idx_assignments_writer_id ON public.assignments(writer_id);
CREATE INDEX IF NOT EXISTS idx_assignments_status ON public.assignments(status);
CREATE INDEX IF NOT EXISTS idx_assignments_deadline ON public.assignments(deadline);
CREATE INDEX IF NOT EXISTS idx_submissions_assignment_id ON public.assignment_submissions(assignment_id);
CREATE INDEX IF NOT EXISTS idx_submissions_writer_id ON public.assignment_submissions(writer_id);
CREATE INDEX IF NOT EXISTS idx_messages_assignment_id ON public.messages(assignment_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON public.messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_ratings_assignment_id ON public.ratings(assignment_id);
CREATE INDEX IF NOT EXISTS idx_ratings_rated_id ON public.ratings(rated_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER handle_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_assignments_updated_at
    BEFORE UPDATE ON public.assignments
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_submissions_updated_at
    BEFORE UPDATE ON public.assignment_submissions
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Create profile creation trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, first_name, last_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'role', 'client')
    );
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error creating profile: %', SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignment_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins can update all profiles" ON public.profiles
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- RLS Policies for assignments
CREATE POLICY "Users can view assignments they're involved in" ON public.assignments
    FOR SELECT USING (
        auth.uid() = client_id OR 
        auth.uid() = writer_id OR
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Clients can create assignments" ON public.assignments
    FOR INSERT WITH CHECK (
        auth.uid() = client_id AND
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('client', 'admin')
        )
    );

CREATE POLICY "Users can update assignments they're involved in" ON public.assignments
    FOR UPDATE USING (
        auth.uid() = client_id OR 
        auth.uid() = writer_id OR
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins can delete assignments" ON public.assignments
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- RLS Policies for assignment_submissions
CREATE POLICY "Users can view submissions they're involved in" ON public.assignment_submissions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.assignments
            WHERE id = assignment_id AND (client_id = auth.uid() OR writer_id = auth.uid())
        ) OR
        auth.uid() = writer_id OR
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Writers can create submissions" ON public.assignment_submissions
    FOR INSERT WITH CHECK (
        auth.uid() = writer_id AND
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'writer'
        )
    );

CREATE POLICY "Writers can update their own submissions" ON public.assignment_submissions
    FOR UPDATE USING (
        auth.uid() = writer_id OR
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- RLS Policies for messages
CREATE POLICY "Users can view messages they're involved in" ON public.messages
    FOR SELECT USING (
        auth.uid() = sender_id OR 
        auth.uid() = receiver_id OR
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Users can send messages" ON public.messages
    FOR INSERT WITH CHECK (
        auth.uid() = sender_id
    );

CREATE POLICY "Users can update their own messages" ON public.messages
    FOR UPDATE USING (
        auth.uid() = sender_id OR
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- RLS Policies for ratings
CREATE POLICY "Users can view ratings" ON public.ratings
    FOR SELECT USING (true);

CREATE POLICY "Users can create ratings for completed assignments" ON public.ratings
    FOR INSERT WITH CHECK (
        auth.uid() = rater_id AND
        EXISTS (
            SELECT 1 FROM public.assignments
            WHERE id = assignment_id AND status = 'completed'
        )
    );

-- RLS Policies for notifications
CREATE POLICY "Users can view their own notifications" ON public.notifications
    FOR SELECT USING (
        auth.uid() = user_id OR
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "System can create notifications" ON public.notifications
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own notifications" ON public.notifications
    FOR UPDATE USING (
        auth.uid() = user_id OR
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Create storage bucket for assignment files
INSERT INTO storage.buckets (id, name, public) 
VALUES ('assignment-files', 'assignment-files', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for assignment-files bucket
CREATE POLICY "Users can upload files for their assignments" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'assignment-files' AND
        (auth.uid()::text = (storage.foldername(name))[1] OR
         EXISTS (
             SELECT 1 FROM public.profiles
             WHERE id = auth.uid() AND role = 'admin'
         ))
    );

CREATE POLICY "Users can view files for assignments they're involved in" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'assignment-files' AND
        (auth.uid()::text = (storage.foldername(name))[1] OR
         auth.uid()::text = (storage.foldername(name))[2] OR
         EXISTS (
             SELECT 1 FROM public.profiles
             WHERE id = auth.uid() AND role = 'admin'
         ))
    );

CREATE POLICY "Users can update their own files" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'assignment-files' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can delete their own files" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'assignment-files' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

-- Insert default admin user (optional - remove in production)
-- INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_user_meta_data)
-- VALUES (
--     '00000000-0000-0000-0000-000000000000',
--     'admin@tasker.com',
--     crypt('admin123', gen_salt('bf')),
--     NOW(),
--     NOW(),
--     NOW(),
--     '{"first_name": "Admin", "last_name": "User", "role": "admin"}'
-- ) ON CONFLICT (id) DO NOTHING;

-- INSERT INTO public.profiles (id, email, first_name, last_name, role)
-- VALUES (
--     '00000000-0000-0000-0000-000000000000',
--     'admin@tasker.com',
--     'Admin',
--     'User',
--     'admin'
-- ) ON CONFLICT (id) DO NOTHING;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- Grant storage permissions
GRANT ALL ON storage.objects TO anon, authenticated;
GRANT ALL ON storage.buckets TO anon, authenticated;

-- Create function to get user stats
CREATE OR REPLACE FUNCTION public.get_user_stats(user_id UUID, user_role TEXT)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    IF user_role = 'client' THEN
        SELECT json_build_object(
            'totalAssignments', COUNT(*),
            'completedAssignments', COUNT(*) FILTER (WHERE status = 'completed'),
            'pendingAssignments', COUNT(*) FILTER (WHERE status = 'pending'),
            'inProgressAssignments', COUNT(*) FILTER (WHERE status = 'in_progress')
        ) INTO result
        FROM public.assignments
        WHERE client_id = user_id;
    ELSIF user_role = 'writer' THEN
        SELECT json_build_object(
            'totalAssignments', COUNT(*),
            'completedAssignments', COUNT(*) FILTER (WHERE status = 'completed'),
            'pendingAssignments', COUNT(*) FILTER (WHERE status = 'pending'),
            'inProgressAssignments', COUNT(*) FILTER (WHERE status = 'in_progress'),
            'earnings', COALESCE(SUM(budget) FILTER (WHERE status = 'completed'), 0)
        ) INTO result
        FROM public.assignments
        WHERE writer_id = user_id;
    END IF;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get admin stats
CREATE OR REPLACE FUNCTION public.get_admin_stats()
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'totalUsers', (SELECT COUNT(*) FROM public.profiles),
        'totalAssignments', (SELECT COUNT(*) FROM public.assignments),
        'totalRevenue', COALESCE((SELECT SUM(budget) FROM public.assignments WHERE status = 'completed'), 0),
        'activeWriters', (SELECT COUNT(*) FROM public.profiles WHERE role = 'writer' AND is_active = true),
        'pendingAssignments', (SELECT COUNT(*) FROM public.assignments WHERE status = 'pending'),
        'completedAssignments', (SELECT COUNT(*) FROM public.assignments WHERE status = 'completed')
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION public.get_user_stats(UUID, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_admin_stats() TO anon, authenticated;

COMMIT; 