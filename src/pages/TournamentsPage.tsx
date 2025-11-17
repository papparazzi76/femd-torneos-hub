import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Users, Trophy } from "lucide-react";
import { eventService } from "@/services/eventService";
import { Event } from "@/types/database";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export function TournamentsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const data = await eventService.getAll();
        setEvents(data);
      } catch (error) {
        console.error("Error loading events:", error);
      } finally {
        setLoading(false);
      }
    };
    loadEvents();
  }, []);

  const upcomingEvents = events.filter(
    (event) => new Date(event.date) >= new Date()
  );
  const pastEvents = events.filter(
    (event) => new Date(event.date) < new Date()
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Cargando torneos...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-20">
      <div className="container mx-auto px-4">
        {/* Hero Section */}
        <div className="text-center mb-16 animate-fade-in">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full gradient-emerald mb-6">
            <Trophy className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-5xl font-bold text-foreground mb-6">
            Nuestros Torneos
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Descubre todos los torneos y eventos de fútbol que organizamos.
            Desde competencias locales hasta grandes campeonatos.
          </p>
        </div>

        {/* Upcoming Tournaments */}
        {upcomingEvents.length > 0 && (
          <section className="mb-16">
            <div className="flex items-center gap-3 mb-8">
              <Calendar className="h-6 w-6 text-primary" />
              <h2 className="text-3xl font-bold text-foreground">
                Próximos Torneos
              </h2>
              <Badge variant="secondary" className="ml-2">
                {upcomingEvents.length}
              </Badge>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingEvents.map((event, index) => (
                <Card
                  key={event.id}
                  className="hover-lift hover-glow animate-fade-in overflow-hidden"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="h-2 gradient-emerald" />
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <CardTitle className="text-xl">{event.title}</CardTitle>
                      <Badge className="shrink-0">Próximamente</Badge>
                    </div>
                    {event.description && (
                      <CardDescription className="line-clamp-2">
                        {event.description}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4 text-primary" />
                      <span>
                        {format(new Date(event.date), "d 'de' MMMM, yyyy", {
                          locale: es,
                        })}
                      </span>
                    </div>
                    {event.location && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4 text-primary" />
                        <span>{event.location}</span>
                      </div>
                    )}
                    {event.team_ids && event.team_ids.length > 0 && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="h-4 w-4 text-primary" />
                        <span>{event.team_ids.length} equipos inscritos</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Past Tournaments */}
        {pastEvents.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-8">
              <Trophy className="h-6 w-6 text-muted-foreground" />
              <h2 className="text-3xl font-bold text-foreground">
                Torneos Anteriores
              </h2>
              <Badge variant="outline" className="ml-2">
                {pastEvents.length}
              </Badge>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pastEvents.map((event, index) => (
                <Card
                  key={event.id}
                  className="hover-lift animate-fade-in opacity-80 hover:opacity-100 transition-opacity"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <CardTitle className="text-xl">{event.title}</CardTitle>
                      <Badge variant="outline">Finalizado</Badge>
                    </div>
                    {event.description && (
                      <CardDescription className="line-clamp-2">
                        {event.description}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {format(new Date(event.date), "d 'de' MMMM, yyyy", {
                          locale: es,
                        })}
                      </span>
                    </div>
                    {event.location && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>{event.location}</span>
                      </div>
                    )}
                    {event.team_ids && event.team_ids.length > 0 && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>{event.team_ids.length} equipos participaron</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Empty State */}
        {events.length === 0 && (
          <div className="text-center py-20">
            <Trophy className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-xl text-muted-foreground mb-2">
              No hay torneos registrados en este momento
            </p>
            <p className="text-sm text-muted-foreground">
              Pronto publicaremos nuevos eventos deportivos
            </p>
          </div>
        )}

        {/* CTA Section */}
        <Card className="mt-16 gradient-emerald text-white border-0">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl mb-4">
              ¿Quieres inscribir tu equipo?
            </CardTitle>
            <CardDescription className="text-white/90 text-lg">
              Contáctanos para conocer más sobre cómo participar en nuestros torneos
              y formar parte de la mejor experiencia futbolística.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
