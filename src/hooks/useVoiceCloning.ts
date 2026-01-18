import { useState, useCallback } from "react";

export const useVoiceCloning = () => {
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [progress, setProgress] = useState(0);

  const synthesize = useCallback(async (params: { text: string; voice: string; emotion: number; stability: number }) => {
    setIsSynthesizing(true);
    setProgress(0);

    for (const step of [25, 50, 75, 100]) {
      await new Promise(r => setTimeout(r, 500));
      setProgress(step);
    }

    setAudioUrl(`/audio/${params.voice.toLowerCase()}_synthesized.wav`);
    setIsSynthesizing(false);
  }, []);

  return { synthesize, audioUrl, isSynthesizing, progress };
};
