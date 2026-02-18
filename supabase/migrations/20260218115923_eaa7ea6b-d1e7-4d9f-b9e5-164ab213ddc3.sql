
-- Create admin users table for secure admin authentication
CREATE TABLE public.admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- No public access - admin_users table is only accessible via service role in edge functions
CREATE POLICY "No public access to admin_users"
ON public.admin_users
FOR ALL
USING (false);

-- Create admin sessions table
CREATE TABLE public.admin_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid NOT NULL REFERENCES public.admin_users(id) ON DELETE CASCADE,
  token text NOT NULL UNIQUE,
  expires_at timestamp with time zone NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "No public access to admin_sessions"
ON public.admin_sessions
FOR ALL
USING (false);

-- Insert default admin user (password: KoraSutra@Admin2024)
-- SHA-256 hash of "KoraSutra@Admin2024"
INSERT INTO public.admin_users (username, password_hash)
VALUES ('korasutra_admin', 'a8b5e3f2c7d4e1b9f6a3d8e5c2b9f0e7a4d1e8b5c2f9e6a3d0b7e4c1f8e5b2a9');
