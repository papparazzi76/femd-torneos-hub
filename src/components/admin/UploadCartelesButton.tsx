import { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Upload, Loader2 } from "lucide-react";

const CARTELES_TO_UPLOAD = [
  { path: "/temp-carteles/torneo-villa-aranda-2025.jpg", name: "torneo-villa-aranda-2025.jpg" },
  { path: "/temp-carteles/copa-cyl-penafiel.jpg", name: "copa-cyl-penafiel.jpg" },
  { path: "/temp-carteles/copa-rioseco-2025.jpg", name: "copa-rioseco-2025.jpg" },
  { path: "/temp-carteles/copa-rioseco-2024.jpg", name: "copa-rioseco-2024.jpg" },
  { path: "/temp-carteles/copa-cyl-2025.jpg", name: "copa-cyl-2025.jpg" },
  { path: "/temp-carteles/copa-cyl-2024.jpg", name: "copa-cyl-2024.jpg" },
];

export const UploadCartelesButton = () => {
  const [uploading, setUploading] = useState(false);

  const uploadCarteles = async () => {
    setUploading(true);
    let successCount = 0;
    let errorCount = 0;

    try {
      for (const cartel of CARTELES_TO_UPLOAD) {
        try {
          // Fetch the image from public folder
          const response = await fetch(cartel.path);
          const blob = await response.blob();

          // Upload to Supabase Storage
          const { error } = await supabase.storage
            .from("carteles")
            .upload(cartel.name, blob, {
              contentType: "image/jpeg",
              upsert: true, // Replace if exists
            });

          if (error) {
            console.error(`Error uploading ${cartel.name}:`, error);
            errorCount++;
          } else {
            successCount++;
          }
        } catch (err) {
          console.error(`Error processing ${cartel.name}:`, err);
          errorCount++;
        }
      }

      if (successCount > 0) {
        toast.success(`${successCount} carteles subidos correctamente`);
      }
      if (errorCount > 0) {
        toast.error(`${errorCount} carteles fallaron al subir`);
      }

      // Reload the page to show the new files
      if (successCount > 0) {
        setTimeout(() => window.location.reload(), 1500);
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
      onClick={uploadCarteles}
      disabled={uploading}
      variant="default"
      className="gap-2"
    >
      {uploading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Subiendo...
        </>
      ) : (
        <>
          <Upload className="h-4 w-4" />
          Subir 6 Carteles
        </>
      )}
    </Button>
  );
};
