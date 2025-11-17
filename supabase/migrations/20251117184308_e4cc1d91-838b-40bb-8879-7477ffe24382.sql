-- Crear tabla para la relación entre eventos y equipos en el torneo
CREATE TABLE public.event_teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  team_id uuid REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
  group_name text,
  points integer DEFAULT 0,
  matches_played integer DEFAULT 0,
  wins integer DEFAULT 0,
  draws integer DEFAULT 0,
  losses integer DEFAULT 0,
  goals_for integer DEFAULT 0,
  goals_against integer DEFAULT 0,
  goal_difference integer DEFAULT 0,
  yellow_cards integer DEFAULT 0,
  red_cards integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(event_id, team_id)
);

-- Crear tabla para los partidos
CREATE TABLE public.matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  home_team_id uuid REFERENCES public.teams(id) NOT NULL,
  away_team_id uuid REFERENCES public.teams(id) NOT NULL,
  phase text NOT NULL,
  group_name text,
  match_number integer,
  home_score integer,
  away_score integer,
  home_yellow_cards integer DEFAULT 0,
  home_red_cards integer DEFAULT 0,
  away_yellow_cards integer DEFAULT 0,
  away_red_cards integer DEFAULT 0,
  match_date timestamp with time zone,
  status text DEFAULT 'scheduled',
  created_at timestamp with time zone DEFAULT now()
);

-- Habilitar RLS en ambas tablas
ALTER TABLE public.event_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para event_teams
CREATE POLICY "Event teams are viewable by everyone"
  ON public.event_teams FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert event teams"
  ON public.event_teams FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update event teams"
  ON public.event_teams FOR UPDATE
  USING (true);

CREATE POLICY "Authenticated users can delete event teams"
  ON public.event_teams FOR DELETE
  USING (true);

-- Políticas RLS para matches
CREATE POLICY "Matches are viewable by everyone"
  ON public.matches FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert matches"
  ON public.matches FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update matches"
  ON public.matches FOR UPDATE
  USING (true);

CREATE POLICY "Authenticated users can delete matches"
  ON public.matches FOR DELETE
  USING (true);