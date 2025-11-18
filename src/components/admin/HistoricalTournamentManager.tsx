import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { tournamentService } from '@/services/tournamentService';
import { teamService } from '@/services/teamService';
import { Team } from '@/types/database';
import { EventTeam, Match } from '@/types/tournament';
import { History, Plus, Save, Trash2, Edit2, Calendar } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

interface HistoricalTournamentManagerProps {
  eventId: string;
}

export const HistoricalTournamentManager = ({ eventId }: HistoricalTournamentManagerProps) => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [eventTeams, setEventTeams] = useState<EventTeam[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Team selection dialog
  const [teamDialogOpen, setTeamDialogOpen] = useState(false);
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
  
  // Match creation dialog
  const [matchDialogOpen, setMatchDialogOpen] = useState(false);
  const [editingMatch, setEditingMatch] = useState<Match | null>(null);
  const [matchForm, setMatchForm] = useState({
    home_team_id: '',
    away_team_id: '',
    phase: 'group' as 'group' | 'round_of_16' | 'quarter_final' | 'semi_final' | 'final',
    group_name: '',
    match_date: '',
    home_score: 0,
    away_score: 0,
    home_yellow_cards: 0,
    home_red_cards: 0,
    away_yellow_cards: 0,
    away_red_cards: 0,
    status: 'finished' as 'scheduled' | 'in_progress' | 'finished',
  });

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
      console.error('Error cargando datos:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los datos',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const availableTeams = teams.filter(
    team => !eventTeams.some(et => et.team_id === team.id)
  );

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
      setTeamDialogOpen(false);
      loadData();
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

  const handleRemoveTeam = async (eventTeamId: string) => {
    if (!confirm('¿Estás seguro de eliminar este equipo del torneo?')) return;

    try {
      await tournamentService.removeTeamFromEvent(eventTeamId);
      toast({
        title: 'Equipo eliminado',
        description: 'El equipo se eliminó del torneo',
      });
      loadData();
    } catch (error) {
      console.error('Error eliminando equipo:', error);
      toast({
        title: 'Error',
        description: 'No se pudo eliminar el equipo',
        variant: 'destructive',
      });
    }
  };

  const resetMatchForm = () => {
    setMatchForm({
      home_team_id: '',
      away_team_id: '',
      phase: 'group',
      group_name: '',
      match_date: '',
      home_score: 0,
      away_score: 0,
      home_yellow_cards: 0,
      home_red_cards: 0,
      away_yellow_cards: 0,
      away_red_cards: 0,
      status: 'finished',
    });
    setEditingMatch(null);
  };

  const handleEditMatch = (match: Match) => {
    setEditingMatch(match);
    setMatchForm({
      home_team_id: match.home_team_id,
      away_team_id: match.away_team_id,
      phase: match.phase,
      group_name: match.group_name || '',
      match_date: match.match_date || '',
      home_score: match.home_score || 0,
      away_score: match.away_score || 0,
      home_yellow_cards: match.home_yellow_cards || 0,
      home_red_cards: match.home_red_cards || 0,
      away_yellow_cards: match.away_yellow_cards || 0,
      away_red_cards: match.away_red_cards || 0,
      status: match.status as 'scheduled' | 'in_progress' | 'finished',
    });
    setMatchDialogOpen(true);
  };

  const handleSaveMatch = async () => {
    if (!matchForm.home_team_id || !matchForm.away_team_id) {
      toast({
        title: 'Atención',
        description: 'Debes seleccionar ambos equipos',
        variant: 'destructive',
      });
      return;
    }

    if (matchForm.home_team_id === matchForm.away_team_id) {
      toast({
        title: 'Atención',
        description: 'Los equipos deben ser diferentes',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);

      if (editingMatch) {
        // Update existing match
        await tournamentService.updateMatch(editingMatch.id, matchForm);
        toast({
          title: 'Partido actualizado',
          description: 'El partido se actualizó correctamente',
        });
      } else {
        // Create new match
        const newMatch = {
          ...matchForm,
          event_id: eventId,
        };
        await tournamentService.createMatch(newMatch);
        toast({
          title: 'Partido creado',
          description: 'El partido se creó correctamente',
        });
      }

      // Update statistics if match is finished
      if (matchForm.status === 'finished') {
        await tournamentService.updateTeamStatistics(eventId);
      }

      resetMatchForm();
      setMatchDialogOpen(false);
      loadData();
    } catch (error) {
      console.error('Error guardando partido:', error);
      toast({
        title: 'Error',
        description: 'No se pudo guardar el partido',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMatch = async (matchId: string) => {
    if (!confirm('¿Estás seguro de eliminar este partido?')) return;

    try {
      await tournamentService.deleteMatch(matchId);
      toast({
        title: 'Partido eliminado',
        description: 'El partido se eliminó correctamente',
      });
      loadData();
    } catch (error) {
      console.error('Error eliminando partido:', error);
      toast({
        title: 'Error',
        description: 'No se pudo eliminar el partido',
        variant: 'destructive',
      });
    }
  };

  const getTeamName = (teamId: string) => {
    return teams.find(t => t.id === teamId)?.name || 'Desconocido';
  };

  const getPhaseLabel = (phase: string) => {
    const labels: Record<string, string> = {
      'group': 'Fase de Grupos',
      'round_of_16': 'Octavos de Final',
      'quarter_final': 'Cuartos de Final',
      'semi_final': 'Semifinales',
      'final': 'Final',
    };
    return labels[phase] || phase;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <History className="w-6 h-6 text-primary" />
        <h3 className="text-2xl font-bold">Gestión Manual de Torneo Histórico</h3>
      </div>

      {/* Teams Section */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-xl font-semibold">Equipos del Torneo ({eventTeams.length})</h4>
          <Dialog open={teamDialogOpen} onOpenChange={setTeamDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Añadir Equipos
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Seleccionar Equipos</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                {availableTeams.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    Todos los equipos ya están en el torneo
                  </p>
                ) : (
                  <>
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
                  </>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {eventTeams.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No hay equipos en este torneo. Añade equipos para comenzar.
          </p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {eventTeams.map(et => (
              <div key={et.id} className="flex items-center justify-between p-3 border rounded-lg">
                <span className="font-medium">{getTeamName(et.team_id)}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveTeam(et.id)}
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Matches Section */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-xl font-semibold">Partidos ({matches.length})</h4>
          <Dialog open={matchDialogOpen} onOpenChange={(open) => {
            setMatchDialogOpen(open);
            if (!open) resetMatchForm();
          }}>
            <DialogTrigger asChild>
              <Button disabled={eventTeams.length < 2}>
                <Plus className="w-4 h-4 mr-2" />
                Crear Partido
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingMatch ? 'Editar Partido' : 'Crear Partido'}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="home-team">Equipo Local</Label>
                    <Select
                      value={matchForm.home_team_id}
                      onValueChange={(value) => setMatchForm({ ...matchForm, home_team_id: value })}
                    >
                      <SelectTrigger id="home-team">
                        <SelectValue placeholder="Selecciona equipo" />
                      </SelectTrigger>
                      <SelectContent>
                        {eventTeams.map(et => (
                          <SelectItem key={et.team_id} value={et.team_id}>
                            {getTeamName(et.team_id)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="away-team">Equipo Visitante</Label>
                    <Select
                      value={matchForm.away_team_id}
                      onValueChange={(value) => setMatchForm({ ...matchForm, away_team_id: value })}
                    >
                      <SelectTrigger id="away-team">
                        <SelectValue placeholder="Selecciona equipo" />
                      </SelectTrigger>
                      <SelectContent>
                        {eventTeams.map(et => (
                          <SelectItem key={et.team_id} value={et.team_id}>
                            {getTeamName(et.team_id)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="phase">Fase</Label>
                    <Select
                      value={matchForm.phase}
                      onValueChange={(value: any) => setMatchForm({ ...matchForm, phase: value })}
                    >
                      <SelectTrigger id="phase">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="group">Fase de Grupos</SelectItem>
                        <SelectItem value="round_of_16">Octavos de Final</SelectItem>
                        <SelectItem value="quarter_final">Cuartos de Final</SelectItem>
                        <SelectItem value="semi_final">Semifinales</SelectItem>
                        <SelectItem value="final">Final</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="group-name">Grupo (opcional)</Label>
                    <Input
                      id="group-name"
                      value={matchForm.group_name}
                      onChange={(e) => setMatchForm({ ...matchForm, group_name: e.target.value })}
                      placeholder="A, B, C..."
                    />
                  </div>

                  <div>
                    <Label htmlFor="match-date">Fecha</Label>
                    <Input
                      id="match-date"
                      type="date"
                      value={matchForm.match_date}
                      onChange={(e) => setMatchForm({ ...matchForm, match_date: e.target.value })}
                    />
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h5 className="font-semibold mb-3">Resultado</h5>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="home-score">Goles Local</Label>
                      <Input
                        id="home-score"
                        type="number"
                        min="0"
                        value={matchForm.home_score}
                        onChange={(e) => setMatchForm({ ...matchForm, home_score: Number(e.target.value) })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="away-score">Goles Visitante</Label>
                      <Input
                        id="away-score"
                        type="number"
                        min="0"
                        value={matchForm.away_score}
                        onChange={(e) => setMatchForm({ ...matchForm, away_score: Number(e.target.value) })}
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h5 className="font-semibold mb-3">Tarjetas</h5>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label className="mb-2 block">Equipo Local</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label htmlFor="home-yellow" className="text-xs">Amarillas</Label>
                          <Input
                            id="home-yellow"
                            type="number"
                            min="0"
                            value={matchForm.home_yellow_cards}
                            onChange={(e) => setMatchForm({ ...matchForm, home_yellow_cards: Number(e.target.value) })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="home-red" className="text-xs">Rojas</Label>
                          <Input
                            id="home-red"
                            type="number"
                            min="0"
                            value={matchForm.home_red_cards}
                            onChange={(e) => setMatchForm({ ...matchForm, home_red_cards: Number(e.target.value) })}
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label className="mb-2 block">Equipo Visitante</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label htmlFor="away-yellow" className="text-xs">Amarillas</Label>
                          <Input
                            id="away-yellow"
                            type="number"
                            min="0"
                            value={matchForm.away_yellow_cards}
                            onChange={(e) => setMatchForm({ ...matchForm, away_yellow_cards: Number(e.target.value) })}
                          />
                        </div>
                        <div>
                          <Label htmlFor="away-red" className="text-xs">Rojas</Label>
                          <Input
                            id="away-red"
                            type="number"
                            min="0"
                            value={matchForm.away_red_cards}
                            onChange={(e) => setMatchForm({ ...matchForm, away_red_cards: Number(e.target.value) })}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 border-t pt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      resetMatchForm();
                      setMatchDialogOpen(false);
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button onClick={handleSaveMatch} disabled={loading}>
                    <Save className="w-4 h-4 mr-2" />
                    {editingMatch ? 'Actualizar' : 'Crear'} Partido
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {matches.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No hay partidos creados. Crea partidos manualmente.
          </p>
        ) : (
          <div className="space-y-4">
            {matches.map(match => (
              <Card key={match.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-medium text-muted-foreground">
                        {getPhaseLabel(match.phase)}
                        {match.group_name && ` - Grupo ${match.group_name}`}
                      </span>
                      {match.match_date && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(match.match_date).toLocaleDateString('es-ES')}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-semibold">{getTeamName(match.home_team_id)}</span>
                      <span className="text-2xl font-bold text-primary">
                        {match.home_score ?? 0} - {match.away_score ?? 0}
                      </span>
                      <span className="font-semibold">{getTeamName(match.away_team_id)}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditMatch(match)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteMatch(match.id)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};
