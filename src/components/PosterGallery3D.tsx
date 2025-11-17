import { useState, useRef, Suspense, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const posters = [
  { id: 1, url: "/temp-carteles/copa-cyl-2024.jpg", title: "Copa CyL 2024" },
  { id: 2, url: "/temp-carteles/copa-cyl-2025.jpg", title: "Copa CyL 2025" },
  { id: 3, url: "/temp-carteles/copa-cyl-penafiel.jpg", title: "Copa CyL Peñafiel" },
  { id: 4, url: "/temp-carteles/copa-rioseco-2024.jpg", title: "Copa Rioseco 2024" },
  { id: 5, url: "/temp-carteles/copa-rioseco-2025.jpg", title: "Copa Rioseco 2025" },
  { id: 6, url: "/temp-carteles/torneo-villa-aranda-2025.jpg", title: "Torneo Villa Aranda 2025" },
];

function PosterCard({ 
  poster, 
  position, 
  isActive 
}: { 
  poster: { id: number; url: string; title: string }; 
  position: [number, number, number]; 
  isActive: boolean;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [texture, setTexture] = useState<THREE.Texture | null>(null);

  useState(() => {
    const loader = new THREE.TextureLoader();
    loader.load(poster.url, (loadedTexture) => {
      setTexture(loadedTexture);
    });
  });

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
        />
      </mesh>
    </group>
  );
}

function Scene({ currentIndex }: { currentIndex: number }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (groupRef.current) {
      const targetRotation = -currentIndex * (Math.PI * 2) / posters.length;
      groupRef.current.rotation.y += (targetRotation - groupRef.current.rotation.y) * 0.1;
    }
  });

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 10]} fov={50} />
      
      <ambientLight intensity={0.5} />
      <spotLight 
        position={[10, 10, 10]} 
        angle={0.3} 
        penumbra={1} 
        intensity={1}
        castShadow
      />
      <pointLight position={[-10, -10, -10]} intensity={0.5} />

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

  useEffect(() => {
    if (isPaused) return;
    
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % posters.length);
    }, 5000);
    
    return () => clearInterval(timer);
  }, [isPaused]);

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

  return (
    <div className="relative w-full h-[600px] bg-gradient-to-b from-background to-card rounded-xl overflow-hidden">
      <Canvas shadows>
        <Suspense fallback={null}>
          <Scene currentIndex={currentIndex} />
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
