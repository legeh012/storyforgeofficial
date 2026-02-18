import { useState, useCallback, useRef, useEffect } from "react";

interface VoiceSynthParams {
  text: string;
  voice: string;
  emotion: number;
  stability: number;
}

// Voice profile mappings for Web Speech API
const VOICE_SETTINGS: Record<string, { pitchBase: number; rateBase: number }> = {
  lucky: { pitchBase: 0.85, rateBase: 0.85 },
  luul: { pitchBase: 0.95, rateBase: 0.9 },
  amal: { pitchBase: 1.15, rateBase: 1.1 },
  zahra: { pitchBase: 1.05, rateBase: 1.0 },
  nasra: { pitchBase: 1.2, rateBase: 0.88 },
  hani: { pitchBase: 0.9, rateBase: 0.8 },
  ayaan: { pitchBase: 1.0, rateBase: 0.85 },
};

export const useVoiceCloning = () => {
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioBlobUrl, setAudioBlobUrl] = useState<string | null>(null);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [playbackProgress, setPlaybackProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressIntervalRef = useRef<number | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      window.speechSynthesis?.cancel();
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (audioBlobUrl) URL.revokeObjectURL(audioBlobUrl);
    };
  }, [audioBlobUrl]);

  const synthesize = useCallback(async (params: VoiceSynthParams) => {
    setIsSynthesizing(true);
    setProgress(0);
    setAudioUrl(null);
    setAudioBlobUrl(null);

    // Try local server first
    try {
      const progressSteps = [10, 25, 40, 55, 70, 85];
      for (const step of progressSteps) {
        setProgress(step);
        await new Promise(r => setTimeout(r, 200));
      }

      const response = await fetch("/api/voice/synthesize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
        signal: AbortSignal.timeout(5000),
      });

      if (response.ok) {
        const blob = await response.blob();
        if (blob.size > 0 && blob.type.startsWith("audio/")) {
          const url = URL.createObjectURL(blob);
          setAudioBlobUrl(url);
          setAudioUrl(url);
          setProgress(100);
          setIsSynthesizing(false);
          return;
        }
      }
    } catch {
      // Server not available, use browser TTS
    }

    // Fallback: Browser Speech Synthesis
    if (!window.speechSynthesis) {
      // Last resort: generate silent audio with AudioContext
      setProgress(100);
      const ctx = new AudioContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      gainNode.gain.value = 0;
      const dest = ctx.createMediaStreamDestination();
      gainNode.connect(dest);
      
      setAudioUrl("browser-tts-unavailable");
      setIsSynthesizing(false);
      return;
    }

    // Use Web Speech Synthesis with voice customization
    setProgress(50);
    await new Promise(r => setTimeout(r, 300));

    const voiceKey = params.voice.toLowerCase();
    const settings = VOICE_SETTINGS[voiceKey] || { pitchBase: 1.0, rateBase: 1.0 };

    // Apply emotion and stability adjustments
    const emotionFactor = params.emotion / 50; // 0-2 range
    const stabilityFactor = params.stability / 100; // 0-1 range

    const utterance = new SpeechSynthesisUtterance(params.text);
    utterance.pitch = Math.max(0.1, Math.min(2, settings.pitchBase * (0.5 + emotionFactor * 0.5)));
    utterance.rate = Math.max(0.1, Math.min(2, settings.rateBase * (0.7 + stabilityFactor * 0.6)));
    utterance.volume = 1;

    // Try to pick a distinct voice from available system voices
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      const voiceIndex = Object.keys(VOICE_SETTINGS).indexOf(voiceKey);
      const selectedVoice = voices[voiceIndex % voices.length] || voices[0];
      utterance.voice = selectedVoice;
    }

    utteranceRef.current = utterance;

    // Estimate duration
    const wordCount = params.text.split(/\s+/).length;
    const estimatedDuration = (wordCount / 150) * 60; // seconds
    setDuration(estimatedDuration);

    setProgress(100);
    setAudioUrl("browser-tts");
    setIsSynthesizing(false);
  }, []);

  const play = useCallback(() => {
    // If we have a blob URL, play with HTMLAudioElement
    if (audioBlobUrl) {
      if (!audioRef.current) {
        audioRef.current = new Audio(audioBlobUrl);
        audioRef.current.onended = () => {
          setIsPlaying(false);
          setPlaybackProgress(0);
          if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
        };
        audioRef.current.onloadedmetadata = () => {
          setDuration(audioRef.current!.duration);
        };
      }
      audioRef.current.play();
      setIsPlaying(true);
      
      progressIntervalRef.current = window.setInterval(() => {
        if (audioRef.current) {
          setPlaybackProgress((audioRef.current.currentTime / audioRef.current.duration) * 100);
        }
      }, 100);
      return;
    }

    // Browser TTS playback
    if (utteranceRef.current && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      
      const utt = utteranceRef.current;
      utt.onstart = () => setIsPlaying(true);
      utt.onend = () => {
        setIsPlaying(false);
        setPlaybackProgress(100);
        if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      };
      
      window.speechSynthesis.speak(utt);
      setIsPlaying(true);

      // Simulate playback progress
      const startTime = Date.now();
      progressIntervalRef.current = window.setInterval(() => {
        const elapsed = (Date.now() - startTime) / 1000;
        const prog = Math.min(100, (elapsed / Math.max(duration, 1)) * 100);
        setPlaybackProgress(prog);
        if (!window.speechSynthesis.speaking) {
          setIsPlaying(false);
          if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
        }
      }, 100);
    }
  }, [audioBlobUrl, duration]);

  const pause = useCallback(() => {
    if (audioBlobUrl && audioRef.current) {
      audioRef.current.pause();
    } else if (window.speechSynthesis) {
      window.speechSynthesis.pause();
    }
    setIsPlaying(false);
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
  }, [audioBlobUrl]);

  const stop = useCallback(() => {
    if (audioBlobUrl && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    } else if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
    setPlaybackProgress(0);
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
  }, [audioBlobUrl]);

  return { 
    synthesize, 
    play,
    pause,
    stop,
    audioUrl, 
    audioBlobUrl,
    isSynthesizing, 
    isPlaying,
    progress,
    playbackProgress,
    duration,
  };
};
