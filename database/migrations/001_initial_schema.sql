-- ==============================================================================
-- SMART LIBRARY MANAGEMENT SYSTEM – VVITU
-- Database Migration: Schema, Indexes, Foreign Keys, Triggers, and RLS
-- ==============================================================================

-- 1. Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create User Role Enum
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('student', 'librarian', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. Create Book Copy Status Enum
DO $$ BEGIN
    CREATE TYPE copy_status AS ENUM ('available', 'issued', 'maintenance', 'lost');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 4. Create Issue Status Enum
DO $$ BEGIN
    CREATE TYPE issue_status AS ENUM ('requested', 'issued', 'returned', 'overdue');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ==============================================================================
-- TABLE: profiles
-- Linked to Supabase Auth auth.users via UUID primary key
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    roll_number TEXT UNIQUE, -- Nullable for staff/admin
    department TEXT,
    phone TEXT,
    role user_role NOT NULL DEFAULT 'student',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- TABLE: library_settings
-- System-wide rules (14-day borrowing, ₹5 daily fine)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.library_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    borrowing_period_days INTEGER NOT NULL DEFAULT 14 CHECK (borrowing_period_days > 0),
    daily_fine_inr NUMERIC(10, 2) NOT NULL DEFAULT 5.00 CHECK (daily_fine_inr >= 0),
    max_books_per_student INTEGER NOT NULL DEFAULT 3 CHECK (max_books_per_student > 0),
    updated_by UUID REFERENCES public.profiles(id),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Insert default settings row if table is empty
INSERT INTO public.library_settings (borrowing_period_days, daily_fine_inr, max_books_per_student)
SELECT 14, 5.00, 3
WHERE NOT EXISTS (SELECT 1 FROM public.library_settings);

-- ==============================================================================
-- TABLE: books
-- Title catalog level metadata
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.books (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    isbn TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    category TEXT NOT NULL,
    publisher TEXT,
    publication_year INTEGER,
    description TEXT,
    cover_image_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- TABLE: book_copies
-- Individual physical inventory items with unique barcodes
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.book_copies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    book_id UUID NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
    copy_code TEXT UNIQUE NOT NULL, -- e.g. VVITU-CS-001
    status copy_status NOT NULL DEFAULT 'available',
    shelf_location TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- TABLE: book_issues
-- Transactions for borrowing physical book copies
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.book_issues (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    copy_id UUID NOT NULL REFERENCES public.book_copies(id) ON DELETE RESTRICT,
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    issued_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    issue_date TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    due_date TIMESTAMPTZ NOT NULL, -- issue_date + 14 days
    status issue_status NOT NULL DEFAULT 'issued',
    remarks TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Critical constraint: Prevent the same physical book copy from being issued concurrently
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_active_issue_per_copy
ON public.book_issues (copy_id)
WHERE status IN ('issued', 'overdue');

-- ==============================================================================
-- TABLE: returns
-- Return history and fine accounting
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.returns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    issue_id UUID UNIQUE NOT NULL REFERENCES public.book_issues(id) ON DELETE RESTRICT,
    returned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    return_date TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    overdue_days INTEGER NOT NULL DEFAULT 0 CHECK (overdue_days >= 0),
    fine_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (fine_amount >= 0),
    fine_paid BOOLEAN NOT NULL DEFAULT false,
    remarks TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- INDEXES FOR PERFORMANCE
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_books_title ON public.books USING gin (to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS idx_books_author ON public.books (author);
CREATE INDEX IF NOT EXISTS idx_books_category ON public.books (category);
CREATE INDEX IF NOT EXISTS idx_book_copies_book_id ON public.book_copies (book_id);
CREATE INDEX IF NOT EXISTS idx_book_copies_status ON public.book_copies (status);
CREATE INDEX IF NOT EXISTS idx_book_issues_student_id ON public.book_issues (student_id);
CREATE INDEX IF NOT EXISTS idx_book_issues_status ON public.book_issues (status);
CREATE INDEX IF NOT EXISTS idx_book_issues_due_date ON public.book_issues (due_date);

-- ==============================================================================
-- HELPER FUNCTIONS & TRIGGERS
-- ==============================================================================

-- Automatically create student profile when new user registers in Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, roll_number, department, phone, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'VVITU Member'),
        NEW.raw_user_meta_data->>'roll_number',
        NEW.raw_user_meta_data->>'department',
        NEW.raw_user_meta_data->>'phone',
        -- Always enforce 'student' role by default on registration to prevent privilege escalation
        'student'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger to sync copy status when issued or returned
CREATE OR REPLACE FUNCTION public.sync_book_copy_status()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        IF NEW.status IN ('issued', 'overdue') THEN
            UPDATE public.book_copies SET status = 'issued', updated_at = now() WHERE id = NEW.copy_id;
        END IF;
    ELSIF (TG_OP = 'UPDATE') THEN
        IF NEW.status = 'returned' AND OLD.status != 'returned' THEN
            UPDATE public.book_copies SET status = 'available', updated_at = now() WHERE id = NEW.copy_id;
        ELSIF NEW.status IN ('issued', 'overdue') AND OLD.status NOT IN ('issued', 'overdue') THEN
            UPDATE public.book_copies SET status = 'issued', updated_at = now() WHERE id = NEW.copy_id;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_copy_status ON public.book_issues;
CREATE TRIGGER trg_sync_copy_status
    AFTER INSERT OR UPDATE ON public.book_issues
    FOR EACH ROW EXECUTE FUNCTION public.sync_book_copy_status();

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.library_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.book_copies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.book_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.returns ENABLE ROW LEVEL SECURITY;

-- Helper function to check caller's role
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS user_role AS $$
    SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Profiles:
-- Everyone can read their own profile; Librarians and Admins can view all profiles
CREATE POLICY "Users view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id OR public.current_user_role() IN ('librarian', 'admin'));

CREATE POLICY "Users update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id AND role = (SELECT role FROM public.profiles WHERE id = auth.uid())); -- Users cannot elevate role

CREATE POLICY "Admins full access to profiles" ON public.profiles
    FOR ALL USING (public.current_user_role() = 'admin');

-- Books & Book Copies:
-- All authenticated users can view books and copy availability
CREATE POLICY "Public read books" ON public.books
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Staff manage books" ON public.books
    FOR ALL USING (public.current_user_role() IN ('librarian', 'admin'));

CREATE POLICY "Public read book copies" ON public.book_copies
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Staff manage book copies" ON public.book_copies
    FOR ALL USING (public.current_user_role() IN ('librarian', 'admin'));

-- Book Issues:
-- Students can only view their own issues; Librarians and Admins can manage all
CREATE POLICY "Students view own issues" ON public.book_issues
    FOR SELECT USING (auth.uid() = student_id OR public.current_user_role() IN ('librarian', 'admin'));

CREATE POLICY "Students request issue" ON public.book_issues
    FOR INSERT WITH CHECK (auth.uid() = student_id AND status = 'requested');

CREATE POLICY "Staff manage issues" ON public.book_issues
    FOR ALL USING (public.current_user_role() IN ('librarian', 'admin'));

-- Returns:
-- Students can view return records of their own issues
CREATE POLICY "Students view own returns" ON public.returns
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.book_issues bi
            WHERE bi.id = issue_id AND bi.student_id = auth.uid()
        ) OR public.current_user_role() IN ('librarian', 'admin')
    );

CREATE POLICY "Staff manage returns" ON public.returns
    FOR ALL USING (public.current_user_role() IN ('librarian', 'admin'));

-- Library Settings:
-- All authenticated users can read settings; only Admin can edit
CREATE POLICY "Authenticated read settings" ON public.library_settings
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admin update settings" ON public.library_settings
    FOR ALL USING (public.current_user_role() = 'admin');
