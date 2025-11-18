import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { roleService } from '@/services/roleService';
import { Users, UserPlus, Shield, Loader2, Calendar, Mail, Trash2 } from 'lucide-react';
import { Label } from '@/components/ui/label';

interface User {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at?: string;
  roles: string[];
}

const AVAILABLE_ROLES = [
  { value: 'admin', label: 'Administrador', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' },
  { value: 'mesa', label: 'Mesa', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' },
  { value: 'moderator', label: 'Moderador', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' },
  { value: 'user', label: 'Usuario', color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300' },
];

export const UserManager = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>('');
  const { toast } = useToast();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: 'Error',
          description: 'No hay sesión activa',
          variant: 'destructive',
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke('list-users', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        throw error;
      }

      setUsers(data.users || []);
    } catch (error) {
      console.error('Error cargando usuarios:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los usuarios',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAssignRole = async (userId: string, role: string) => {
    try {
      await roleService.assignRole(userId, role as any);
      toast({
        title: 'Rol asignado',
        description: `El rol ${getRoleLabel(role)} fue asignado correctamente`,
      });
      loadUsers();
      setDialogOpen(false);
      setSelectedUser(null);
      setSelectedRole('');
    } catch (error) {
      console.error('Error asignando rol:', error);
      toast({
        title: 'Error',
        description: 'No se pudo asignar el rol',
        variant: 'destructive',
      });
    }
  };

  const handleRemoveRole = async (userId: string, role: string) => {
    if (!confirm(`¿Estás seguro de remover el rol ${getRoleLabel(role)}?`)) return;

    try {
      await roleService.removeRole(userId, role as any);
      toast({
        title: 'Rol removido',
        description: `El rol ${getRoleLabel(role)} fue removido correctamente`,
      });
      loadUsers();
    } catch (error) {
      console.error('Error removiendo rol:', error);
      toast({
        title: 'Error',
        description: 'No se pudo remover el rol',
        variant: 'destructive',
      });
    }
  };

  const getRoleLabel = (role: string) => {
    return AVAILABLE_ROLES.find(r => r.value === role)?.label || role;
  };

  const getRoleColor = (role: string) => {
    return AVAILABLE_ROLES.find(r => r.value === role)?.color || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Cargando usuarios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-6 h-6 text-primary" />
          <h3 className="text-2xl font-bold">Gestión de Usuarios</h3>
        </div>
        <Button onClick={loadUsers} variant="outline">
          Actualizar Lista
        </Button>
      </div>

      <div className="grid gap-4">
        {users.length === 0 ? (
          <Card className="p-12 text-center">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No hay usuarios registrados</p>
          </Card>
        ) : (
          users.map((user) => (
            <Card key={user.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Shield className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <p className="font-semibold">{user.email}</p>
                      </div>
                      <p className="text-xs text-muted-foreground">ID: {user.id}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>Registrado: {new Date(user.created_at).toLocaleDateString('es-ES')}</span>
                    {user.last_sign_in_at && (
                      <span className="ml-4">
                        Último acceso: {new Date(user.last_sign_in_at).toLocaleDateString('es-ES')}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span className="text-sm font-medium text-muted-foreground">Roles:</span>
                    {user.roles.length === 0 ? (
                      <Badge variant="outline">Sin roles</Badge>
                    ) : (
                      user.roles.map((role) => (
                        <div key={role} className="flex items-center gap-1">
                          <Badge className={getRoleColor(role)}>
                            {getRoleLabel(role)}
                          </Badge>
                          {role !== 'user' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={() => handleRemoveRole(user.id, role)}
                            >
                              <Trash2 className="w-3 h-3 text-destructive" />
                            </Button>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <Dialog open={dialogOpen && selectedUser?.id === user.id} onOpenChange={(open) => {
                  setDialogOpen(open);
                  if (!open) {
                    setSelectedUser(null);
                    setSelectedRole('');
                  }
                }}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedUser(user);
                        setDialogOpen(true);
                      }}
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      Asignar Rol
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Asignar Rol a Usuario</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Usuario:</p>
                        <p className="font-semibold">{user.email}</p>
                      </div>

                      <div>
                        <Label htmlFor="role-select">Seleccionar Rol</Label>
                        <Select value={selectedRole} onValueChange={setSelectedRole}>
                          <SelectTrigger id="role-select">
                            <SelectValue placeholder="Selecciona un rol" />
                          </SelectTrigger>
                          <SelectContent>
                            {AVAILABLE_ROLES.filter(r => !user.roles.includes(r.value)).map((role) => (
                              <SelectItem key={role.value} value={role.value}>
                                {role.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="border-t pt-4">
                        <h4 className="font-semibold mb-2">Descripción de Roles:</h4>
                        <ul className="text-sm space-y-2 text-muted-foreground">
                          <li><strong>Administrador:</strong> Acceso completo al panel de administración</li>
                          <li><strong>Mesa:</strong> Puede gestionar partidos asignados e introducir resultados</li>
                          <li><strong>Moderador:</strong> Puede moderar contenido y usuarios</li>
                          <li><strong>Usuario:</strong> Acceso básico a la plataforma</li>
                        </ul>
                      </div>

                      <Button
                        onClick={() => selectedUser && handleAssignRole(selectedUser.id, selectedRole)}
                        disabled={!selectedRole}
                        className="w-full"
                      >
                        Asignar Rol
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
