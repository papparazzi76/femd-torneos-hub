import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { teamService } from '@/services/teamService';
import { participantService } from '@/services/participantService';
import { eventService } from '@/services/eventService';
import { Team, Participant, Event } from '@/types/database';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Users, Trophy, Calendar, Palette, Loader2 } from 'lucide-react';

export const TeamDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [team, setTeam] = useState<Team | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTeamData();
  }, [id]);

  const loadTeamData = async () => {
    if (!id) return;
    
    try {
      const [teamData, participantsData, eventsData] = await Promise.all([
        teamService.getById(id),
        participantService.getByTeam(id),
        eventService.getAll()
      ]);

      setTeam(teamData);
      setParticipants(participantsData);
      
      // Filter events that include this team
      const teamEvents = eventsData.filter(event => 
        event.team_ids?.includes(id)
      );
      setEvents(teamEvents);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los datos del equipo',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Cargando datos del equipo...</p>
        </div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Users className="w-16 h-16 text-muted-foreground mx-auto" />
          <p className="text-xl text-muted-foreground">Equipo no encontrado</p>
          <Button onClick={() => navigate('/equipos')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver a equipos
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-muted/20 to-background py-16">
      <div className="container mx-auto px-4">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={() => navigate('/equipos')}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver a equipos
        </Button>

        {/* Team Header */}
        <Card className="mb-8 overflow-hidden border-2">
          <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5">
            <div className="flex flex-col md:flex-row items-center gap-6">
              {/* Team Logo */}
              <div className="flex-shrink-0">
                {team.logo_url ? (
                  <div className="w-32 h-32 rounded-full bg-background flex items-center justify-center overflow-hidden ring-4 ring-background shadow-xl">
                    <img 
                      src={team.logo_url} 
                      alt={team.name}
                      className="w-full h-full object-contain p-4"
                    />
                  </div>
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center ring-4 ring-background shadow-xl">
                    <Users className="w-16 h-16 text-primary" />
                  </div>
                )}
              </div>

              {/* Team Info */}
              <div className="flex-1 text-center md:text-left">
                <CardTitle className="text-4xl mb-4">{team.name}</CardTitle>
                {team.description && (
                  <p className="text-muted-foreground text-lg mb-4">{team.description}</p>
                )}
                <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                  {team.founded_year && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">Fundado en {team.founded_year}</span>
                    </div>
                  )}
                  {team.colors && (
                    <div className="flex items-center gap-2">
                      <Palette className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">Colores: {team.colors}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="plantilla" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
            <TabsTrigger value="plantilla" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Plantilla
            </TabsTrigger>
            <TabsTrigger value="competiciones" className="flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              Competiciones
            </TabsTrigger>
          </TabsList>

          {/* Plantilla Tab */}
          <TabsContent value="plantilla">
            <Card>
              <CardHeader>
                <CardTitle>Plantilla del Equipo</CardTitle>
              </CardHeader>
              <CardContent>
                {participants.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No hay jugadores registrados</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-16">N°</TableHead>
                          <TableHead>Nombre</TableHead>
                          <TableHead>Posición</TableHead>
                          <TableHead className="text-center">Edad</TableHead>
                          <TableHead className="text-center">PJ</TableHead>
                          <TableHead className="text-center">Goles</TableHead>
                          <TableHead className="text-center">TA</TableHead>
                          <TableHead className="text-center">TR</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {participants.map((participant) => (
                          <TableRow key={participant.id}>
                            <TableCell className="font-bold">
                              {participant.number || '-'}
                            </TableCell>
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-3">
                                {participant.photo_url ? (
                                  <img 
                                    src={participant.photo_url} 
                                    alt={participant.name}
                                    className="w-10 h-10 rounded-full object-cover"
                                  />
                                ) : (
                                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                                    <Users className="w-5 h-5 text-muted-foreground" />
                                  </div>
                                )}
                                {participant.name}
                              </div>
                            </TableCell>
                            <TableCell>
                              {participant.position ? (
                                <Badge variant="outline">{participant.position}</Badge>
                              ) : (
                                '-'
                              )}
                            </TableCell>
                            <TableCell className="text-center">
                              {participant.age || '-'}
                            </TableCell>
                            <TableCell className="text-center">
                              {participant.matches_played || 0}
                            </TableCell>
                            <TableCell className="text-center font-semibold">
                              {participant.goals_scored || 0}
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-700 dark:text-yellow-400">
                                {participant.yellow_cards || 0}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge variant="secondary" className="bg-red-500/20 text-red-700 dark:text-red-400">
                                {participant.red_cards || 0}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Competiciones Tab */}
          <TabsContent value="competiciones">
            <Card>
              <CardHeader>
                <CardTitle>Competiciones</CardTitle>
              </CardHeader>
              <CardContent>
                {events.length === 0 ? (
                  <div className="text-center py-8">
                    <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No hay competiciones registradas</p>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {events.map((event) => (
                      <Card key={event.id} className="hover-scale">
                        <CardHeader className="pb-3">
                          {event.poster_url && (
                            <img 
                              src={event.poster_url} 
                              alt={event.title}
                              className="w-full h-48 object-cover rounded-md mb-4"
                            />
                          )}
                          <CardTitle className="text-lg">{event.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          {event.description && (
                            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                              {event.description}
                            </p>
                          )}
                          <div className="space-y-2 text-sm">
                            {event.date && (
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Calendar className="w-4 h-4" />
                                {new Date(event.date).toLocaleDateString('es-ES', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })}
                              </div>
                            )}
                            {event.location && (
                              <p className="text-muted-foreground">
                                📍 {event.location}
                              </p>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
