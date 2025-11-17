import { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Upload } from "lucide-react";

const NEW_CARTELES = [
  { path: "user-uploads://torneo-villa-aranda-2025-3.jpg", name: "torneo-villa-aranda-2025.jpg" },
  { path: "user-uploads://copaa-cyl-penafiel-3.jpg", name: "copa-cyl-penafiel.jpg" },
  { path: "user-uploads://copa-rioseco-2025-3.jpg", name: "copa-rioseco-2025.jpg" },
  { path: "user-uploads://copa-rioseco-2024-3.jpg", name: "copa-rioseco-2024.jpg" },
  { path: "user-uploads://copa-cyl-2025-3.jpg", name: "copa-cyl-2025.jpg" },
  { path: "user-uploads://copa-cyl-2024-3.jpg", name: "copa-cyl-2024.jpg" },
];

export function UploadNewCarteles() {
  const [uploading, setUploading] = useState(false);

  const uploadNewCarteles = async () => {
    setUploading(true);
    let successCount = 0;
    let errorCount = 0;

    try {
      for (const cartel of NEW_CARTELES) {
        try {
          const response = await fetch(cartel.path);
          const blob = await response.blob();

          const { error: uploadError } = await supabase.storage
            .from("carteles")
            .upload(cartel.name, blob, {
              contentType: "image/jpeg",
              upsert: true,
            });

          if (uploadError) {
            console.error(`Error uploading ${cartel.name}:`, uploadError);
            errorCount++;
          } else {
            successCount++;
          }
        } catch (error) {
          console.error(`Error processing ${cartel.name}:`, error);
          errorCount++;
        }
      }

      if (successCount > 0) {
        toast.success(`${successCount} carteles subidos correctamente`);
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      }

      if (errorCount > 0) {
        toast.error(`Error al subir ${errorCount} carteles`);
      }
    } catch (error) {
      console.error("Error uploading carteles:", error);
      toast.error("Error al subir los carteles");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Button
      onClick={uploadNewCarteles}
      disabled={uploading}
      className="gap-2"
    >
      <Upload className="h-4 w-4" />
      {uploading ? "Subiendo..." : "Subir Nuevos Carteles"}
    </Button>
  );
}
