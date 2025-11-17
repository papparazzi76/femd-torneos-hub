import { useState, useEffect } from 'react';
import { teamService } from '@/services/teamService';
import { Team } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';

export const TeamManager = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    logo_url: '',
    description: '',
    founded_year: '',
    colors: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    loadTeams();
  }, []);

  const loadTeams = async () => {
    try {
      const data = await teamService.getAll();
      setTeams(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los equipos',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const teamData = {
        name: formData.name.trim(),
        logo_url: formData.logo_url.trim() || undefined,
        description: formData.description.trim() || undefined,
        founded_year: formData.founded_year ? parseInt(formData.founded_year) : undefined,
        colors: formData.colors.trim() || undefined
      };

      if (editingId) {
        await teamService.update(editingId, teamData);
        toast({ title: 'Equipo actualizado con éxito' });
      } else {
        await teamService.create(teamData);
        toast({ title: 'Equipo creado con éxito' });
      }

      resetForm();
      loadTeams();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo guardar el equipo',
        variant: 'destructive'
      });
    }
  };

  const handleEdit = (team: Team) => {
    setFormData({
      name: team.name,
      logo_url: team.logo_url || '',
      description: team.description || '',
      founded_year: team.founded_year?.toString() || '',
      colors: team.colors || ''
    });
    setEditingId(team.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este equipo?')) return;

    try {
      await teamService.delete(id);
      toast({ title: 'Equipo eliminado con éxito' });
      loadTeams();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo eliminar el equipo',
        variant: 'destructive'
      });
    }
  };

  const resetForm = () => {
    setFormData({ name: '', logo_url: '', description: '', founded_year: '', colors: '' });
    setEditingId(null);
    setShowForm(false);
  };

  if (loading) {
    return <div className="text-center py-8">Cargando equipos...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gestión de Equipos</h2>
        <Button onClick={() => setShowForm(!showForm)} className="bg-emerald-600 hover:bg-emerald-700">
          {showForm ? <X className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
          {showForm ? 'Cancelar' : 'Nuevo Equipo'}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? 'Editar Equipo' : 'Nuevo Equipo'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nombre *</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nombre del equipo"
                  required
                  maxLength={100}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">URL del Logo</label>
                <Input
                  value={formData.logo_url}
                  onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                  placeholder="https://..."
                  type="url"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Descripción</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descripción del equipo"
                  maxLength={500}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Año de Fundación</label>
                  <Input
                    value={formData.founded_year}
                    onChange={(e) => setFormData({ ...formData, founded_year: e.target.value })}
                    placeholder="2020"
                    type="number"
                    min="1800"
                    max={new Date().getFullYear()}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Colores</label>
                  <Input
                    value={formData.colors}
                    onChange={(e) => setFormData({ ...formData, colors: e.target.value })}
                    placeholder="Rojo y Blanco"
                    maxLength={50}
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
        {teams.map((team) => (
          <Card key={team.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{team.name}</span>
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost" onClick={() => handleEdit(team)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => handleDelete(team.id)}>
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {team.logo_url && (
                <img src={team.logo_url} alt={team.name} className="w-20 h-20 object-contain" />
              )}
              {team.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">{team.description}</p>
              )}
              {team.colors && (
                <p className="text-sm"><strong>Colores:</strong> {team.colors}</p>
              )}
              {team.founded_year && (
                <p className="text-sm"><strong>Fundado:</strong> {team.founded_year}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
