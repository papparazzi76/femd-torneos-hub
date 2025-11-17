export interface EventTeam {
  id: string;
  event_id: string;
  team_id: string;
  group_name?: string;
  points: number;
  matches_played: number;
  wins: number;
  draws: number;
  losses: number;
  goals_for: number;
  goals_against: number;
  goal_difference: number;
  yellow_cards: number;
  red_cards: number;
  created_at: string;
}

export interface Match {
  id: string;
  event_id: string;
  home_team_id: string;
  away_team_id: string;
  phase: 'group' | 'round_of_16' | 'quarter_final' | 'semi_final' | 'final';
  group_name?: string;
  match_number?: number;
  home_score?: number;
  away_score?: number;
  home_yellow_cards: number;
  home_red_cards: number;
  away_yellow_cards: number;
  away_red_cards: number;
  match_date?: string;
  status: 'scheduled' | 'in_progress' | 'finished';
  created_at: string;
}
