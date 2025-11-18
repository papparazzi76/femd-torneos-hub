import { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2 } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";

export function AudioPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState([70]);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume[0] / 100;
    }
  }, [volume]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="flex items-center gap-3 justify-center mt-6 mb-4">
      <audio ref={audioRef} src="/audio/banda-sonora.mp3" loop />
      
      <Button
        onClick={togglePlay}
        size="icon"
        variant="outline"
        className="h-10 w-10 rounded-full bg-background/20 backdrop-blur-sm border-white/30 hover:bg-background/30 hover:border-white/50 transition-all"
      >
        {isPlaying ? (
          <Pause className="h-5 w-5 text-white" />
        ) : (
          <Play className="h-5 w-5 text-white ml-0.5" />
        )}
      </Button>

      <div className="flex items-center gap-2 bg-background/20 backdrop-blur-sm rounded-full px-4 py-2 border border-white/30">
        <Volume2 className="h-4 w-4 text-white/80" />
        <Slider
          value={volume}
          onValueChange={setVolume}
          max={100}
          step={1}
          className="w-24 md:w-32"
        />
      </div>
    </div>
  );
}
