import { supabase } from '@/integrations/supabase/client';
import { Sponsor } from '@/types/database';

export const sponsorService = {
  async getAll(): Promise<Sponsor[]> {
    const { data, error } = await supabase
      .from('sponsors')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return data || [];
  },

  async create(sponsor: Omit<Sponsor, 'id' | 'created_at'>): Promise<Sponsor> {
    const { data, error } = await supabase
      .from('sponsors')
      .insert(sponsor)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: string, sponsor: Partial<Sponsor>): Promise<Sponsor> {
    const { data, error } = await supabase
      .from('sponsors')
      .update(sponsor)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('sponsors')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};
