import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TeamManager } from '@/components/admin/TeamManager';
import { ParticipantManager } from '@/components/admin/ParticipantManager';
import { EventManager } from '@/components/admin/EventManager';
import { PostManager } from '@/components/admin/PostManager';
import { SponsorManager } from '@/components/admin/SponsorManager';
import { StorageManager } from '@/components/admin/StorageManager';
import { Shield, AlertCircle } from 'lucide-react';
import { roleService } from '@/services/roleService';
import { useToast } from '@/hooks/use-toast';

export const AdminDashboard = () => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const result = await roleService.checkAdminStatus();
        
        if (result.error) {
          console.error('Error verificando permisos de admin:', result.error);
          toast({
            title: "Error",
            description: "No se pudo verificar los permisos de administrador",
            variant: "destructive",
          });
        }
        
        setIsAdmin(result.isAdmin);
      } catch (error) {
        console.error('Error inesperado:', error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, [user, toast]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/20">
        <div className="text-center space-y-4 p-8 bg-background rounded-lg border border-border shadow-lg">
          <AlertCircle className="w-12 h-12 mx-auto text-yellow-600" />
          <h2 className="text-2xl font-bold">Acceso Restringido</h2>
          <p className="text-muted-foreground">
            Debes iniciar sesión para acceder al panel de administración.
          </p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/20">
        <div className="text-center space-y-4 p-8 bg-background rounded-lg border border-border shadow-lg">
          <Shield className="w-12 h-12 mx-auto text-red-600" />
          <h2 className="text-2xl font-bold">Acceso Denegado</h2>
          <p className="text-muted-foreground">
            No tienes permisos de administrador para acceder a esta página.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/20 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-8 h-8 text-emerald-600" />
            <h1 className="text-3xl font-bold">Panel de Administración</h1>
          </div>
          <p className="text-muted-foreground">
            Gestiona todos los aspectos de FEMD TORNEOS desde aquí
          </p>
        </div>

        <Tabs defaultValue="teams" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 lg:w-auto">
            <TabsTrigger value="teams">Equipos</TabsTrigger>
            <TabsTrigger value="participants">Participantes</TabsTrigger>
            <TabsTrigger value="events">Eventos</TabsTrigger>
            <TabsTrigger value="posts">Noticias</TabsTrigger>
            <TabsTrigger value="sponsors">Patrocinadores</TabsTrigger>
            <TabsTrigger value="storage">Archivos</TabsTrigger>
          </TabsList>

          <TabsContent value="teams" className="space-y-4">
            <TeamManager />
          </TabsContent>

          <TabsContent value="participants" className="space-y-4">
            <ParticipantManager />
          </TabsContent>

          <TabsContent value="events" className="space-y-4">
            <EventManager />
          </TabsContent>

          <TabsContent value="posts" className="space-y-4">
            <PostManager />
          </TabsContent>

          <TabsContent value="sponsors" className="space-y-4">
            <SponsorManager />
          </TabsContent>

          <TabsContent value="storage" className="space-y-4">
            <StorageManager />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
