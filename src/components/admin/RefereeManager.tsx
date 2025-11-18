import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { tournamentService } from '@/services/tournamentService';
import { roleService } from '@/services/roleService';
import { teamService } from '@/services/teamService';
import { Match } from '@/types/tournament';
import { Team } from '@/types/database';
import { UserCog, Calendar, MapPin, Trash2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface RefereeManagerProps {
  eventId: string;
}

interface RefereeUser {
  id: string;
  email: string;
}

export const RefereeManager = ({ eventId }: RefereeManagerProps) => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [referees, setReferees] = useState<RefereeUser[]>([]);
  const [newRefereeEmail, setNewRefereeEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, [eventId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [matchesData, teamsData, refereesData] = await Promise.all([
        tournamentService.getMatches(eventId),
        teamService.getAll(),
        roleService.getUsersByRole('mesa'),
      ]);
      setMatches(matchesData);
      setTeams(teamsData);
      setReferees(refereesData);
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

  const handleAssignReferee = async (matchId: string, refereeId: string) => {
    try {
      await tournamentService.assignReferee(matchId, refereeId);
      toast({
        title: 'Mesa asignada',
        description: 'Mesa asignada correctamente al partido',
      });
      loadData();
    } catch (error) {
      console.error('Error asignando mesa:', error);
      toast({
        title: 'Error',
        description: 'No se pudo asignar la mesa al partido',
        variant: 'destructive',
      });
    }
  };

  const handleUnassignReferee = async (matchId: string) => {
    try {
      await tournamentService.unassignReferee(matchId);
      toast({
        title: 'Mesa desasignada',
        description: 'Mesa removida del partido',
      });
      loadData();
    } catch (error) {
      console.error('Error desasignando mesa:', error);
      toast({
        title: 'Error',
        description: 'No se pudo desasignar la mesa',
        variant: 'destructive',
      });
    }
  };

  const handleAddReferee = async () => {
    if (!newRefereeEmail.trim()) {
      toast({
        title: 'Atención',
        description: 'Debes ingresar un email',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);
      // In a real implementation, you would need to:
      // 1. Check if user exists in auth.users
      // 2. If yes, assign role
      // 3. If no, invite them first
      
      toast({
        title: 'Información',
        description: 'El usuario debe estar registrado primero. Luego puedes asignarle el rol de mesa desde la gestión de usuarios.',
      });
      setDialogOpen(false);
      setNewRefereeEmail('');
    } catch (error) {
      console.error('Error añadiendo mesa:', error);
      toast({
        title: 'Error',
        description: 'No se pudo añadir la mesa',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getTeamName = (teamId: string) => {
    return teams.find(t => t.id === teamId)?.name || 'Equipo desconocido';
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

  const groupedMatches = matches.reduce((acc, match) => {
    const phase = match.phase;
    if (!acc[phase]) {
      acc[phase] = [];
    }
    acc[phase].push(match);
    return acc;
  }, {} as Record<string, Match[]>);

  if (loading && matches.length === 0) {
    return <div className="text-center py-8">Cargando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <UserCog className="w-6 h-6 text-primary" />
          <h3 className="text-2xl font-bold">Asignación de Mesas</h3>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-emerald">
              Añadir Mesa
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Añadir Mesa</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="referee-email">Email del Usuario</Label>
                <Input
                  id="referee-email"
                  type="email"
                  placeholder="mesa@ejemplo.com"
                  value={newRefereeEmail}
                  onChange={(e) => setNewRefereeEmail(e.target.value)}
                />
                <p className="text-xs text-muted-foreground mt-2">
                  El usuario debe estar registrado en el sistema
                </p>
              </div>
              <Button onClick={handleAddReferee} className="w-full">
                Añadir
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {matches.length === 0 ? (
        <Card className="p-8 text-center">
          <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            No hay partidos generados aún. Primero genera el sorteo del torneo.
          </p>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedMatches).map(([phase, phaseMatches]) => (
            <div key={phase}>
              <h4 className="text-xl font-bold mb-4">{getPhaseLabel(phase)}</h4>
              <div className="grid gap-4">
                {phaseMatches.map((match) => (
                  <Card key={match.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-2">
                          <span className="font-semibold">
                            {getTeamName(match.home_team_id)}
                          </span>
                          <span className="text-muted-foreground">vs</span>
                          <span className="font-semibold">
                            {getTeamName(match.away_team_id)}
                          </span>
                        </div>
                        {match.group_name && (
                          <div className="text-sm text-muted-foreground flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            Grupo {match.group_name}
                          </div>
                        )}
                        {match.match_date && (
                          <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(match.match_date).toLocaleDateString('es-ES')}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {match.referee_user_id ? (
                          <>
                            <div className="text-sm bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-3 py-1 rounded-full">
                              Mesa asignada
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleUnassignReferee(match.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </>
                        ) : (
                          <Select
                            onValueChange={(value) => handleAssignReferee(match.id, value)}
                          >
                            <SelectTrigger className="w-[200px]">
                              <SelectValue placeholder="Asignar mesa" />
                            </SelectTrigger>
                            <SelectContent>
                              {referees.length === 0 ? (
                                <div className="p-2 text-sm text-muted-foreground">
                                  No hay mesas disponibles
                                </div>
                              ) : (
                                referees.map((referee) => (
                                  <SelectItem key={referee.id} value={referee.id}>
                                    {referee.email}
                                  </SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
