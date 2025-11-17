import { useState, useRef, Suspense, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface Poster {
  id: string;
  url: string;
  title: string;
}

function PosterCard({ 
  poster, 
  position, 
  isActive 
}: { 
  poster: Poster; 
  position: [number, number, number]; 
  isActive: boolean;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [texture, setTexture] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    const loader = new THREE.TextureLoader();
    loader.load(
      poster.url, 
      (loadedTexture) => {
        setTexture(loadedTexture);
      },
      undefined,
      (error) => {
        console.error('Error loading texture:', poster.url, error);
      }
    );
  }, [poster.url]);

  useFrame((state) => {
    if (meshRef.current) {
      // Hacer que el cartel siempre mire hacia la cámara
      meshRef.current.lookAt(state.camera.position);
    }
  });

  return (
    <group position={position}>
      <mesh ref={meshRef} castShadow receiveShadow>
        <planeGeometry args={[3, 4]} />
        <meshStandardMaterial 
          map={texture}
          side={THREE.DoubleSide}
          transparent={false}
          opacity={1}
        />
      </mesh>
    </group>
  );
}

function Scene({ currentIndex, posters }: { currentIndex: number; posters: Poster[] }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (groupRef.current && posters.length > 0) {
      const targetRotation = -currentIndex * (Math.PI * 2) / posters.length;
      groupRef.current.rotation.y += (targetRotation - groupRef.current.rotation.y) * 0.1;
    }
  });

  if (posters.length === 0) return null;

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 10]} fov={50} />
      
      <ambientLight intensity={1.2} />
      <directionalLight 
        position={[5, 5, 5]} 
        intensity={2}
        castShadow
      />
      <directionalLight 
        position={[-5, 5, 5]} 
        intensity={1.5}
      />
      <pointLight position={[0, 0, 8]} intensity={1.5} />
      <pointLight position={[0, 5, 0]} intensity={1} />

      <group ref={groupRef}>
        {posters.map((poster, index) => {
          const angle = (index / posters.length) * Math.PI * 2;
          const radius = 6;
          const x = Math.sin(angle) * radius;
          const z = Math.cos(angle) * radius;
          
          return (
            <PosterCard
              key={poster.id}
              poster={poster}
              position={[x, 0, z]}
              isActive={index === currentIndex}
            />
          );
        })}
      </group>
    </>
  );
}

export function PosterGallery3D() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [posters, setPosters] = useState<Poster[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPosters = async () => {
      try {
        // Listar archivos del bucket "carteles"
        const { data, error } = await supabase.storage
          .from("carteles")
          .list("", { limit: 100, sortBy: { column: "name", order: "desc" } });

        if (error) throw error;

        const files = (data || []).filter(
          (f) => /\.(png|jpe?g|webp)$/i.test(f.name) && !f.name.startsWith(".")
        );

        const formattedPosters: Poster[] = files.map((file) => {
          const { data: pub } = supabase.storage
            .from("carteles")
            .getPublicUrl(file.name);

          const raw = file.name.replace(/\.(png|jpe?g|webp)$/i, "");
          const pretty = raw
            .replace(/[-_]+/g, " ")
            .replace(/\b\w/g, (c) => c.toUpperCase());

          return {
            id: (file as any).id || file.name,
            url: pub.publicUrl,
            title: pretty,
          };
        });

        setPosters(formattedPosters);
      } catch (error) {
        console.error("Error loading posters from bucket:", error);
      } finally {
        setLoading(false);
      }
    };

    loadPosters();
  }, []);

  useEffect(() => {
    if (isPaused || posters.length === 0) return;
    
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % posters.length);
    }, 5000);
    
    return () => clearInterval(timer);
  }, [isPaused, posters.length]);

  useEffect(() => {
    if (isPaused) {
      const resumeTimer = setTimeout(() => {
        setIsPaused(false);
      }, 10000);
      
      return () => clearTimeout(resumeTimer);
    }
  }, [isPaused]);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + posters.length) % posters.length);
    setIsPaused(true);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % posters.length);
    setIsPaused(true);
  };

  if (loading) {
    return (
      <div className="relative w-full h-[600px] bg-gradient-to-b from-background to-card rounded-xl overflow-hidden flex items-center justify-center">
        <p className="text-muted-foreground">Cargando carteles...</p>
      </div>
    );
  }

  if (posters.length === 0) {
    return (
      <div className="relative w-full h-[600px] bg-gradient-to-b from-background to-card rounded-xl overflow-hidden flex items-center justify-center">
        <p className="text-muted-foreground">No hay carteles disponibles</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[600px] bg-gradient-to-b from-background to-card rounded-xl overflow-hidden">
      <Canvas shadows>
        <Suspense fallback={null}>
          <Scene currentIndex={currentIndex} posters={posters} />
        </Suspense>
      </Canvas>

      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex items-center gap-4 z-10">
        <Button
          variant="outline"
          size="icon"
          onClick={handlePrevious}
          className="bg-background/80 backdrop-blur-sm border-primary/20 hover:bg-primary hover:text-primary-foreground"
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>

        <div className="bg-background/80 backdrop-blur-sm px-6 py-2 rounded-full border border-primary/20">
          <p className="text-sm font-medium text-foreground">
            {posters[currentIndex].title}
          </p>
        </div>

        <Button
          variant="outline"
          size="icon"
          onClick={handleNext}
          className="bg-background/80 backdrop-blur-sm border-primary/20 hover:bg-primary hover:text-primary-foreground"
        >
          <ChevronRight className="h-6 w-6" />
        </Button>
      </div>

      <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
        {posters.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === currentIndex ? "bg-primary w-6" : "bg-primary/30"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
