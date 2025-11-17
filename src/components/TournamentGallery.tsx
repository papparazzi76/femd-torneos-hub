import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Image as ImageIcon } from "lucide-react";

export function TournamentGallery() {
  const [posters, setPosters] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPosters = async () => {
      try {
        const { data, error } = await supabase.storage
          .from("carteles")
          .list();

        if (error) throw error;

        if (data) {
          const posterUrls = data
            .filter((file) => file.name !== ".emptyFolderPlaceholder")
            .map((file) => {
              const { data: urlData } = supabase.storage
                .from("carteles")
                .getPublicUrl(file.name);
              return urlData.publicUrl;
            });
          setPosters(posterUrls);
        }
      } catch (error) {
        console.error("Error loading posters:", error);
      } finally {
        setLoading(false);
      }
    };

    loadPosters();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Cargando carteles...</p>
      </div>
    );
  }

  if (posters.length === 0) {
    return null;
  }

  return (
    <section className="mb-16">
      <div className="flex items-center gap-3 mb-8">
        <ImageIcon className="h-6 w-6 text-primary" />
        <h2 className="text-3xl font-bold text-foreground">
          Carteles de Torneos
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {posters.map((url, index) => (
          <Card
            key={index}
            className="overflow-hidden hover-lift hover-glow animate-fade-in"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <img
              src={url}
              alt={`Cartel de torneo ${index + 1}`}
              className="w-full h-auto object-cover"
              loading="lazy"
            />
          </Card>
        ))}
      </div>
    </section>
  );
}
