-- Create teams table
CREATE TABLE public.teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  description TEXT,
  founded_year INTEGER,
  colors TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create participants table
CREATE TABLE public.participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  position TEXT,
  number INTEGER,
  photo_url TEXT,
  birth_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create events table
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  location TEXT,
  team_ids UUID[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create posts table
CREATE TABLE public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  content TEXT,
  image_url TEXT,
  author_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create sponsors table
CREATE TABLE public.sponsors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  logo_url TEXT,
  website TEXT,
  tier TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security on all tables
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sponsors ENABLE ROW LEVEL SECURITY;

-- RLS Policies for teams
CREATE POLICY "Teams are viewable by everyone"
  ON public.teams FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert teams"
  ON public.teams FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update teams"
  ON public.teams FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete teams"
  ON public.teams FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for participants
CREATE POLICY "Participants are viewable by everyone"
  ON public.participants FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert participants"
  ON public.participants FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update participants"
  ON public.participants FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete participants"
  ON public.participants FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for events
CREATE POLICY "Events are viewable by everyone"
  ON public.events FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert events"
  ON public.events FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update events"
  ON public.events FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete events"
  ON public.events FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for posts
CREATE POLICY "Posts are viewable by everyone"
  ON public.posts FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert posts"
  ON public.posts FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update posts"
  ON public.posts FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete posts"
  ON public.posts FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for sponsors
CREATE POLICY "Sponsors are viewable by everyone"
  ON public.sponsors FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert sponsors"
  ON public.sponsors FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update sponsors"
  ON public.sponsors FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete sponsors"
  ON public.sponsors FOR DELETE
  TO authenticated
  USING (true);

-- Create trigger function for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger for posts table
CREATE TRIGGER update_posts_updated_at
  BEFORE UPDATE ON public.posts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some initial teams data
INSERT INTO public.teams (name, description, colors) VALUES
  ('Aranda Riber', 'Equipo de fútbol de Aranda de Duero', 'Rojo y Blanco'),
  ('CD Mirandés', 'Club Deportivo Mirandés', 'Rojo y Negro'),
  ('Real Burgos CF', 'Real Burgos Club de Fútbol', 'Blanco y Negro'),
  ('SD Ponferradina', 'Sociedad Deportiva Ponferradina', 'Azul y Blanco'),
  ('Cultural Leonesa', 'Cultural y Deportiva Leonesa', 'Blanco y Azul'),
  ('Gimnástica Segoviana', 'Gimnástica Segoviana CF', 'Verde y Blanco');