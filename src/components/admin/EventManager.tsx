import { useState, useEffect } from 'react';
import { eventService } from '@/services/eventService';
import { teamService } from '@/services/teamService';
import { Event, Team } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Save, X, Calendar } from 'lucide-react';

export const EventManager = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    location: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [eventsData, teamsData] = await Promise.all([
        eventService.getAll(),
        teamService.getAll()
      ]);
      setEvents(eventsData);
      setTeams(teamsData);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los datos',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const eventData = {
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        date: formData.date,
        location: formData.location.trim() || undefined,
        team_ids: []
      };

      if (editingId) {
        await eventService.update(editingId, eventData);
        toast({ title: 'Evento actualizado con éxito' });
      } else {
        await eventService.create(eventData);
        toast({ title: 'Evento creado con éxito' });
      }

      resetForm();
      loadData();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo guardar el evento',
        variant: 'destructive'
      });
    }
  };

  const handleEdit = (event: Event) => {
    setFormData({
      title: event.title,
      description: event.description || '',
      date: event.date.split('T')[0],
      location: event.location || ''
    });
    setEditingId(event.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este evento?')) return;

    try {
      await eventService.delete(id);
      toast({ title: 'Evento eliminado con éxito' });
      loadData();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo eliminar el evento',
        variant: 'destructive'
      });
    }
  };

  const resetForm = () => {
    setFormData({ title: '', description: '', date: '', location: '' });
    setEditingId(null);
    setShowForm(false);
  };

  if (loading) {
    return <div className="text-center py-8">Cargando eventos...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gestión de Eventos</h2>
        <Button onClick={() => setShowForm(!showForm)} className="bg-emerald-600 hover:bg-emerald-700">
          {showForm ? <X className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
          {showForm ? 'Cancelar' : 'Nuevo Evento'}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? 'Editar Evento' : 'Nuevo Evento'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Título *</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Título del evento"
                  required
                  maxLength={200}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Descripción</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descripción del evento"
                  maxLength={1000}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Fecha *</label>
                  <Input
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    type="date"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Ubicación</label>
                  <Input
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Ubicación del evento"
                    maxLength={200}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">
                  <Save className="w-4 h-4 mr-2" />
                  Guardar
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {events.map((event) => (
          <Card key={event.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="truncate">{event.title}</span>
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost" onClick={() => handleEdit(event)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => handleDelete(event.id)}>
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                {new Date(event.date).toLocaleDateString('es-ES')}
              </div>
              {event.location && (
                <p className="text-sm"><strong>Ubicación:</strong> {event.location}</p>
              )}
              {event.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">{event.description}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
