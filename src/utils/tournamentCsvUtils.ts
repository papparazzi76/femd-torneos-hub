import Papa from 'papaparse';
import { Match } from '@/types/tournament';

export interface MatchCSVRow {
  home_team_name: string;
  away_team_name: string;
  phase: string;
  group_name?: string;
  match_date?: string;
  home_score: number;
  away_score: number;
  home_yellow_cards: number;
  home_red_cards: number;
  away_yellow_cards: number;
  away_red_cards: number;
}

export interface TeamCSVRow {
  name: string;
  group?: string;
}

export const exportMatchesToCSV = (matches: Match[], getTeamName: (id: string) => string): string => {
  const csvData = matches.map(match => ({
    home_team_name: getTeamName(match.home_team_id),
    away_team_name: getTeamName(match.away_team_id),
    phase: match.phase,
    group_name: match.group_name || '',
    match_date: match.match_date ? new Date(match.match_date).toLocaleDateString('es-ES') : '',
    home_score: match.home_score ?? 0,
    away_score: match.away_score ?? 0,
    home_yellow_cards: match.home_yellow_cards ?? 0,
    home_red_cards: match.home_red_cards ?? 0,
    away_yellow_cards: match.away_yellow_cards ?? 0,
    away_red_cards: match.away_red_cards ?? 0,
  }));

  return Papa.unparse(csvData, {
    header: true,
    delimiter: ',',
  });
};

export const exportTeamsToCSV = (teams: Array<{ name: string; group?: string }>): string => {
  const csvData = teams.map(team => ({
    name: team.name,
    group: team.group || '',
  }));

  return Papa.unparse(csvData, {
    header: true,
    delimiter: ',',
  });
};

export const parseMatchesCSV = (csvContent: string): Promise<MatchCSVRow[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse<MatchCSVRow>(csvContent, {
      header: true,
      skipEmptyLines: true,
      transform: (value: string, field: string | number) => {
        // Convert numeric fields
        if (['home_score', 'away_score', 'home_yellow_cards', 'home_red_cards', 'away_yellow_cards', 'away_red_cards'].includes(field as string)) {
          return parseInt(value) || 0;
        }
        return value.trim();
      },
      complete: (results) => {
        if (results.errors.length > 0) {
          reject(new Error(`Error al parsear CSV: ${results.errors[0].message}`));
        } else {
          resolve(results.data);
        }
      },
      error: (error) => {
        reject(error);
      },
    });
  });
};

export const parseTeamsCSV = (csvContent: string): Promise<TeamCSVRow[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse<TeamCSVRow>(csvContent, {
      header: true,
      skipEmptyLines: true,
      transform: (value: string) => value.trim(),
      complete: (results) => {
        if (results.errors.length > 0) {
          reject(new Error(`Error al parsear CSV: ${results.errors[0].message}`));
        } else {
          resolve(results.data);
        }
      },
      error: (error) => {
        reject(error);
      },
    });
  });
};

export const downloadCSV = (content: string, filename: string) => {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const getCSVTemplate = (type: 'matches' | 'teams'): string => {
  if (type === 'matches') {
    const template = [
      {
        home_team_name: 'Equipo A',
        away_team_name: 'Equipo B',
        phase: 'group',
        group_name: 'A',
        match_date: '01/01/2024',
        home_score: 2,
        away_score: 1,
        home_yellow_cards: 1,
        home_red_cards: 0,
        away_yellow_cards: 2,
        away_red_cards: 0,
      }
    ];
    return Papa.unparse(template, { header: true });
  } else {
    const template = [
      { name: 'Equipo A', group: 'A' },
      { name: 'Equipo B', group: 'A' },
    ];
    return Papa.unparse(template, { header: true });
  }
};
