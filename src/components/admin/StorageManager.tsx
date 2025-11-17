import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  Upload, 
  Trash2, 
  Copy, 
  Image as ImageIcon, 
  FileImage,
  Loader2,
  ExternalLink
} from 'lucide-react';

interface StorageFile {
  name: string;
  id: string;
  updated_at?: string;
  created_at?: string;
  last_accessed_at?: string;
  metadata?: Record<string, any>;
}

const BUCKETS = [
  { id: 'imagenes-web', name: 'Imágenes Web', description: 'Imágenes generales del sitio web' },
  { id: 'imagenes-torneos', name: 'Imágenes Torneos', description: 'Fotos de torneos y eventos' },
  { id: 'carteles', name: 'Carteles', description: 'Carteles promocionales de torneos' }
];

export const StorageManager = () => {
  const [files, setFiles] = useState<Record<string, StorageFile[]>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [uploading, setUploading] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  useEffect(() => {
    BUCKETS.forEach(bucket => loadFiles(bucket.id));
  }, []);

  const loadFiles = async (bucketId: string) => {
    setLoading(prev => ({ ...prev, [bucketId]: true }));
    try {
      const { data, error } = await supabase.storage.from(bucketId).list();
      
      if (error) throw error;
      
      setFiles(prev => ({ ...prev, [bucketId]: data || [] }));
    } catch (error) {
      console.error(`Error loading files from ${bucketId}:`, error);
      toast({
        title: 'Error',
        description: `No se pudieron cargar los archivos de ${bucketId}`,
        variant: 'destructive'
      });
    } finally {
      setLoading(prev => ({ ...prev, [bucketId]: false }));
    }
  };

  const handleUpload = async (bucketId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size (max 20MB)
    if (file.size > 20 * 1024 * 1024) {
      toast({
        title: 'Error',
        description: 'El archivo es demasiado grande. Máximo 20MB.',
        variant: 'destructive'
      });
      return;
    }

    // Validate file type (images only)
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Error',
        description: 'Solo se permiten archivos de imagen',
        variant: 'destructive'
      });
      return;
    }

    setUploading(prev => ({ ...prev, [bucketId]: true }));
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      
      const { error } = await supabase.storage
        .from(bucketId)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      toast({
        title: 'Archivo subido',
        description: 'El archivo se ha subido correctamente'
      });

      loadFiles(bucketId);
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: 'Error',
        description: 'No se pudo subir el archivo',
        variant: 'destructive'
      });
    } finally {
      setUploading(prev => ({ ...prev, [bucketId]: false }));
      event.target.value = '';
    }
  };

  const handleDelete = async (bucketId: string, fileName: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este archivo?')) return;

    try {
      const { error } = await supabase.storage
        .from(bucketId)
        .remove([fileName]);

      if (error) throw error;

      toast({
        title: 'Archivo eliminado',
        description: 'El archivo se ha eliminado correctamente'
      });

      loadFiles(bucketId);
    } catch (error) {
      console.error('Error deleting file:', error);
      toast({
        title: 'Error',
        description: 'No se pudo eliminar el archivo',
        variant: 'destructive'
      });
    }
  };

  const getPublicUrl = (bucketId: string, fileName: string) => {
    const { data } = supabase.storage.from(bucketId).getPublicUrl(fileName);
    return data.publicUrl;
  };

  const copyUrl = (bucketId: string, fileName: string) => {
    const url = getPublicUrl(bucketId, fileName);
    navigator.clipboard.writeText(url);
    toast({
      title: 'URL copiada',
      description: 'La URL se ha copiado al portapapeles'
    });
  };

  const formatFileSize = (file: StorageFile) => {
    const bytes = file.metadata?.size || 0;
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gestión de Archivos</h2>
      </div>

      <Tabs defaultValue={BUCKETS[0].id} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          {BUCKETS.map(bucket => (
            <TabsTrigger key={bucket.id} value={bucket.id}>
              {bucket.name}
            </TabsTrigger>
          ))}
        </TabsList>

        {BUCKETS.map(bucket => (
          <TabsContent key={bucket.id} value={bucket.id} className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileImage className="w-5 h-5 text-emerald-600" />
                    <span>{bucket.name}</span>
                  </div>
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleUpload(bucket.id, e)}
                      className="hidden"
                      disabled={uploading[bucket.id]}
                    />
                    <Button
                      disabled={uploading[bucket.id]}
                      className="bg-emerald-600 hover:bg-emerald-700"
                      asChild
                    >
                      <span>
                        {uploading[bucket.id] ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Subiendo...
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4 mr-2" />
                            Subir Archivo
                          </>
                        )}
                      </span>
                    </Button>
                  </label>
                </CardTitle>
                <p className="text-sm text-muted-foreground">{bucket.description}</p>
              </CardHeader>

              <CardContent>
                {loading[bucket.id] ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
                  </div>
                ) : files[bucket.id]?.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No hay archivos en este bucket</p>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {files[bucket.id]?.map((file) => (
                      <Card key={file.id} className="overflow-hidden group">
                        <div className="relative h-40 bg-muted">
                          <img
                            src={getPublicUrl(bucket.id, file.name)}
                            alt={file.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EImagen%3C/text%3E%3C/svg%3E';
                            }}
                          />
                          <div className="absolute top-2 right-2">
                            <a
                              href={getPublicUrl(bucket.id, file.name)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 bg-background/80 backdrop-blur-sm rounded-lg hover:bg-background transition-colors"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          </div>
                        </div>
                        <CardContent className="p-4 space-y-3">
                          <div>
                            <p className="text-sm font-medium truncate" title={file.name}>
                              {file.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatFileSize(file)}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => copyUrl(bucket.id, file.name)}
                              className="flex-1"
                            >
                              <Copy className="w-3 h-3 mr-1" />
                              Copiar URL
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDelete(bucket.id, file.name)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};
