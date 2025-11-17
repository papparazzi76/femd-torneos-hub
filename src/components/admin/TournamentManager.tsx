import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { tournamentService } from '@/services/tournamentService';
import { teamService } from '@/services/teamService';
import { Team } from '@/types/database';
import { EventTeam, Match } from '@/types/tournament';
import { Trophy, Users, Calendar, Trash2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface TournamentManagerProps {
  eventId: string;
}

export const TournamentManager = ({ eventId }: TournamentManagerProps) => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [eventTeams, setEventTeams] = useState<EventTeam[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, [eventId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [allTeams, tournamentTeams, tournamentMatches] = await Promise.all([
        teamService.getAll(),
        tournamentService.getEventTeams(eventId),
        tournamentService.getMatches(eventId),
      ]);
      setTeams(allTeams);
      setEventTeams(tournamentTeams);
      setMatches(tournamentMatches);
    } catch (error) {
      console.error('Error cargando datos del torneo:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los datos del torneo',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTeamSelection = (teamId: string, checked: boolean) => {
    if (checked) {
      setSelectedTeams([...selectedTeams, teamId]);
    } else {
      setSelectedTeams(selectedTeams.filter(id => id !== teamId));
    }
  };

  const handleAddTeams = async () => {
    if (selectedTeams.length === 0) {
      toast({
        title: 'Atención',
        description: 'Debes seleccionar al menos un equipo',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);
      await tournamentService.addTeamsToEvent(eventId, selectedTeams);
      toast({
        title: 'Equipos añadidos',
        description: `Se añadieron ${selectedTeams.length} equipos al torneo`,
      });
      setSelectedTeams([]);
      setDialogOpen(false);
      await loadData();
    } catch (error) {
      console.error('Error añadiendo equipos:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron añadir los equipos',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateTournament = async () => {
    if (eventTeams.length !== 24) {
      toast({
        title: 'Error',
        description: 'Se requieren exactamente 24 equipos para generar el torneo',
        variant: 'destructive',
      });
      return;
    }

    if (!confirm('¿Estás seguro? Esto generará el sorteo y calendario de partidos. Si ya existe un calendario, será eliminado.')) {
      return;
    }

    try {
      setLoading(true);
      // Delete existing matches
      await tournamentService.deleteMatches(eventId);
      
      // Generate new tournament
      const teamIds = eventTeams.map(et => et.team_id);
      await tournamentService.generateTournament(eventId, teamIds);
      
      toast({
        title: 'Torneo generado',
        description: 'El sorteo y calendario se crearon exitosamente',
      });
      await loadData();
    } catch (error) {
      console.error('Error generando torneo:', error);
      toast({
        title: 'Error',
        description: 'No se pudo generar el torneo',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateMatchScore = async (matchId: string, field: string, value: string) => {
    try {
      const numValue = parseInt(value) || 0;
      await tournamentService.updateMatch(matchId, { [field]: numValue });
      await loadData();
    } catch (error) {
      console.error('Error actualizando partido:', error);
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el partido',
        variant: 'destructive',
      });
    }
  };

  const getTeamName = (teamId: string) => {
    return teams.find(t => t.id === teamId)?.name || 'Desconocido';
  };

  const availableTeams = teams.filter(
    team => !eventTeams.some(et => et.team_id === team.id)
  );

  const groupedTeams = eventTeams.reduce((acc, et) => {
    const group = et.group_name || 'Sin grupo';
    if (!acc[group]) acc[group] = [];
    acc[group].push(et);
    return acc;
  }, {} as Record<string, EventTeam[]>);

  const groupedMatches = matches.reduce((acc, match) => {
    const key = match.phase + (match.group_name ? `_${match.group_name}` : '');
    if (!acc[key]) acc[key] = [];
    acc[key].push(match);
    return acc;
  }, {} as Record<string, Match[]>);

  if (loading && eventTeams.length === 0) {
    return <div className="text-center py-8">Cargando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Users className="w-4 h-4 mr-2" />
              Añadir Equipos
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Seleccionar Equipos</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                Equipos seleccionados: {selectedTeams.length} | Equipos en torneo: {eventTeams.length}/24
              </div>
              <div className="grid grid-cols-2 gap-4">
                {availableTeams.map(team => (
                  <div key={team.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={team.id}
                      checked={selectedTeams.includes(team.id)}
                      onCheckedChange={(checked) => handleTeamSelection(team.id, checked as boolean)}
                    />
                    <label htmlFor={team.id} className="text-sm cursor-pointer">
                      {team.name}
                    </label>
                  </div>
                ))}
              </div>
              <Button onClick={handleAddTeams} disabled={selectedTeams.length === 0 || loading}>
                Añadir {selectedTeams.length} equipo(s)
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Button 
          onClick={handleGenerateTournament} 
          disabled={eventTeams.length !== 24 || loading}
          variant="default"
        >
          <Calendar className="w-4 h-4 mr-2" />
          Generar Sorteo y Calendario
        </Button>
      </div>

      {/* Equipos por grupo */}
      {Object.keys(groupedTeams).length > 0 && (
        <Card className="p-6">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            Equipos Inscritos ({eventTeams.length}/24)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(groupedTeams).sort().map(([group, teams]) => (
              <Card key={group} className="p-4">
                <h4 className="font-bold mb-2">Grupo {group}</h4>
                <div className="space-y-1">
                  {teams.map(et => (
                    <div key={et.id} className="text-sm">
                      {getTeamName(et.team_id)}
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </Card>
      )}

      {/* Calendario de partidos */}
      {matches.length > 0 && (
        <Card className="p-6">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Calendario de Partidos
          </h3>
          <div className="space-y-6">
            {Object.entries(groupedMatches).map(([key, matchList]) => {
              const [phase, group] = key.split('_');
              const phaseNames: Record<string, string> = {
                group: 'Fase de Grupos',
                round_of_16: 'Octavos de Final',
                quarter_final: 'Cuartos de Final',
                semi_final: 'Semifinales',
                final: 'Final',
              };
              
              return (
                <div key={key}>
                  <h4 className="font-bold text-lg mb-3">
                    {phaseNames[phase]} {group ? `- Grupo ${group}` : ''}
                  </h4>
                  <div className="space-y-2">
                    {matchList.map(match => (
                      <Card key={match.id} className="p-4">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex-1">
                            <div className="font-semibold">{getTeamName(match.home_team_id)}</div>
                            <div className="text-sm text-muted-foreground">Local</div>
                          </div>
                          <div className="flex gap-2 items-center">
                            <Input
                              type="number"
                              min="0"
                              value={match.home_score ?? ''}
                              onChange={(e) => handleUpdateMatchScore(match.id, 'home_score', e.target.value)}
                              className="w-16 text-center"
                              placeholder="0"
                            />
                            <span className="font-bold">-</span>
                            <Input
                              type="number"
                              min="0"
                              value={match.away_score ?? ''}
                              onChange={(e) => handleUpdateMatchScore(match.id, 'away_score', e.target.value)}
                              className="w-16 text-center"
                              placeholder="0"
                            />
                          </div>
                          <div className="flex-1 text-right">
                            <div className="font-semibold">{getTeamName(match.away_team_id)}</div>
                            <div className="text-sm text-muted-foreground">Visitante</div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
};
