import { supabase } from '@/integrations/supabase/client';
import { Participant } from '@/types/database';

export const participantService = {
  async getAll(): Promise<Participant[]> {
    const { data, error } = await supabase
      .from('participants')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return data || [];
  },

  async getByTeam(teamId: string): Promise<Participant[]> {
    const { data, error } = await supabase
      .from('participants')
      .select('*')
      .eq('team_id', teamId)
      .order('number');
    
    if (error) throw error;
    return data || [];
  },

  async create(participant: Omit<Participant, 'id' | 'created_at'>): Promise<Participant> {
    const { data, error } = await supabase
      .from('participants')
      .insert(participant)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: string, participant: Partial<Participant>): Promise<Participant> {
    const { data, error } = await supabase
      .from('participants')
      .update(participant)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('participants')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};
