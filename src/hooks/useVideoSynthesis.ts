import { useState, useCallback } from "react";

export const useVideoSynthesis = () => {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStage, setCurrentStage] = useState("");

  const synthesize = useCallback(async (params: any) => {
    setIsSynthesizing(true);
    const stages = ["Loading models...", "Generating keyframes...", "Rendering motion...", "Applying style...", "Finalizing..."];
    
    for (let i = 0; i < stages.length; i++) {
      setCurrentStage(stages[i]);
      setProgress((i + 1) * 20);
      await new Promise(r => setTimeout(r, 800));
    }

    setVideoUrl(`/video/scene_${Date.now()}.mp4`);
    setIsSynthesizing(false);
  }, []);

  return { synthesize, videoUrl, isSynthesizing, progress, currentStage };
};
