import { supabase } from '@/integrations/supabase/client';
import { EventTeam, Match } from '@/types/tournament';

export const tournamentService = {
  // Event Teams
  async getEventTeams(eventId: string): Promise<EventTeam[]> {
    const { data, error } = await supabase
      .from('event_teams')
      .select('*')
      .eq('event_id', eventId)
      .order('group_name')
      .order('points', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async addTeamsToEvent(eventId: string, teamIds: string[]): Promise<void> {
    const eventTeams = teamIds.map(teamId => ({
      event_id: eventId,
      team_id: teamId,
    }));

    const { error } = await supabase
      .from('event_teams')
      .insert(eventTeams);
    
    if (error) throw error;
  },

  async removeTeamFromEvent(eventTeamId: string): Promise<void> {
    const { error } = await supabase
      .from('event_teams')
      .delete()
      .eq('id', eventTeamId);
    
    if (error) throw error;
  },

  async updateEventTeam(id: string, updates: Partial<EventTeam>): Promise<void> {
    const { error } = await supabase
      .from('event_teams')
      .update(updates)
      .eq('id', id);
    
    if (error) throw error;
  },

  // Matches
  async getMatches(eventId: string): Promise<Match[]> {
    const { data, error } = await supabase
      .from('matches')
      .select('*')
      .eq('event_id', eventId)
      .order('phase')
      .order('match_number');
    
    if (error) throw error;
    return (data || []) as Match[];
  },

  async createMatch(match: Omit<Match, 'id' | 'created_at'>): Promise<Match> {
    const { data, error } = await supabase
      .from('matches')
      .insert(match)
      .select()
      .single();
    
    if (error) throw error;
    return data as Match;
  },

  async updateMatch(id: string, updates: Partial<Match>): Promise<void> {
    const { error } = await supabase
      .from('matches')
      .update(updates)
      .eq('id', id);
    
    if (error) throw error;
  },

  async deleteMatches(eventId: string): Promise<void> {
    const { error } = await supabase
      .from('matches')
      .delete()
      .eq('event_id', eventId);
    
    if (error) throw error;
  },

  // Tournament Generation
  async generateTournament(eventId: string, teamIds: string[]): Promise<void> {
    if (teamIds.length !== 24) {
      throw new Error('Se requieren exactamente 24 equipos para el torneo');
    }

    // Shuffle teams for random draw
    const shuffledTeams = [...teamIds].sort(() => Math.random() - 0.5);
    
    // Assign teams to groups (A, B, C, D, E, F)
    const groups = ['A', 'B', 'C', 'D', 'E', 'F'];
    const eventTeams: any[] = [];
    
    shuffledTeams.forEach((teamId, index) => {
      const groupIndex = Math.floor(index / 4);
      eventTeams.push({
        event_id: eventId,
        team_id: teamId,
        group_name: groups[groupIndex],
      });
    });

    // Insert event teams with groups
    const { error: teamsError } = await supabase
      .from('event_teams')
      .upsert(eventTeams, { onConflict: 'event_id,team_id' });
    
    if (teamsError) throw teamsError;

    // Generate group stage matches
    const matches: any[] = [];
    let matchNumber = 1;

    groups.forEach((group, groupIndex) => {
      const groupTeams = shuffledTeams.slice(groupIndex * 4, (groupIndex + 1) * 4);
      
      // Each team plays against the other 3 in the group
      for (let i = 0; i < groupTeams.length; i++) {
        for (let j = i + 1; j < groupTeams.length; j++) {
          matches.push({
            event_id: eventId,
            home_team_id: groupTeams[i],
            away_team_id: groupTeams[j],
            phase: 'group',
            group_name: group,
            match_number: matchNumber++,
            status: 'scheduled',
          });
        }
      }
    });

    // Insert matches
    const { error: matchesError } = await supabase
      .from('matches')
      .insert(matches);
    
    if (matchesError) throw matchesError;
  },
};
