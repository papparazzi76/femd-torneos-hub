export interface Team {
  id: string;
  name: string;
  logo_url?: string;
  description?: string;
  founded_year?: number;
  colors?: string;
  created_at: string;
}

export interface Participant {
  id: string;
  team_id?: string;
  name: string;
  position?: string;
  number?: number;
  photo_url?: string;
  birth_date?: string;
  created_at: string;
}

export interface Event {
  id: string;
  title: string;
  description?: string;
  date: string;
  location?: string;
  team_ids?: string[];
  created_at: string;
}

export interface Post {
  id: string;
  title: string;
  description?: string;
  content?: string;
  image_url?: string;
  author_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Sponsor {
  id: string;
  name: string;
  logo_url?: string;
  website?: string;
  tier?: string;
  created_at: string;
}
