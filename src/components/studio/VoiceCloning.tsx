import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Mic2, 
  Play, 
  Pause, 
  Volume2,
  Wand2,
  Download,
  RefreshCw,
  Waves,
  Square,
  StopCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { useVoiceCloning } from "@/hooks/useVoiceCloning";

const voiceProfiles = [
  { name: "Lucky", style: "Commanding, visionary", emotion: "powerful", color: "from-amber-500 to-orange-600", settings: { pitch: 0.9, speed: 0.85, stability: 0.8 } },
  { name: "Luul", style: "Regal, grounded", emotion: "wise", color: "from-purple-500 to-violet-600", settings: { pitch: 1.0, speed: 0.9, stability: 0.9 } },
  { name: "Amal", style: "Venomous, mocking", emotion: "sharp", color: "from-rose-500 to-pink-600", settings: { pitch: 1.1, speed: 1.1, stability: 0.7 } },
  { name: "Zahra", style: "Witty, courtroom-sharp", emotion: "clever", color: "from-emerald-500 to-teal-600", settings: { pitch: 1.05, speed: 1.0, stability: 0.85 } },
  { name: "Nasra", style: "Soft, trembling", emotion: "vulnerable", color: "from-blue-500 to-indigo-600", settings: { pitch: 1.15, speed: 0.9, stability: 0.6 } },
  { name: "Hani", style: "Haunting, empathetic", emotion: "prophetic", color: "from-slate-500 to-gray-600", settings: { pitch: 0.95, speed: 0.8, stability: 0.75 } },
  { name: "Ayaan", style: "Poetic, detached", emotion: "ethereal", color: "from-cyan-500 to-sky-600", settings: { pitch: 1.0, speed: 0.85, stability: 0.65 } },
];

const VoiceCloning = () => {
  const [selectedVoice, setSelectedVoice] = useState(voiceProfiles[0]);
  const [text, setText] = useState("");
  const [emotion, setEmotion] = useState([50]);
  const [stability, setStability] = useState([80]);
  const [waveformBars, setWaveformBars] = useState<number[]>([]);

  const { 
    synthesize, 
    play,
    pause,
    stop,
    audioUrl, 
    isSynthesizing, 
    isPlaying,
    progress,
    playbackProgress,
    duration,
  } = useVoiceCloning();

  // Generate waveform visualization
  useEffect(() => {
    const bars = Array.from({ length: 60 }, () => Math.random() * 30 + 5);
    setWaveformBars(bars);
  }, [audioUrl]);

  // Animate waveform when playing
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setWaveformBars(prev => prev.map(h => {
        const delta = (Math.random() - 0.5) * 10;
        return Math.max(5, Math.min(40, h + delta));
      }));
    }, 150);
    return () => clearInterval(interval);
  }, [isPlaying]);

  const handleSynthesize = async () => {
    if (!text.trim()) {
      toast.error("Please enter text to synthesize");
      return;
    }
    
    await synthesize({
      text,
      voice: selectedVoice.name,
      emotion: emotion[0],
      stability: stability[0]
    });

    toast.success(`${selectedVoice.name}'s voice generated! Click play to listen.`);
  };

  const handlePlayPause = () => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Voice Selection */}
      <Card className="glass lg:col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mic2 className="w-5 h-5 text-primary" />
            Voice Profiles
          </CardTitle>
          <CardDescription>Select a cast member's voice</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {voiceProfiles.map(voice => (
            <motion.button
              key={voice.name}
              onClick={() => setSelectedVoice(voice)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`w-full p-3 rounded-xl text-left transition-all ${
                selectedVoice.name === voice.name 
                  ? "bg-primary/20 border border-primary/50" 
                  : "bg-muted/30 hover:bg-muted/50"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${voice.color} flex items-center justify-center text-white font-bold text-sm`}>
                  {voice.name[0]}
                </div>
                <div>
                  <p className="font-medium">{voice.name}</p>
                  <p className="text-xs text-muted-foreground">{voice.style}</p>
                </div>
              </div>
            </motion.button>
          ))}
        </CardContent>
      </Card>

      {/* Synthesis Controls */}
      <Card className="glass lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Waves className="w-5 h-5 text-primary" />
            Voice Synthesis
            <span className="ml-2 px-2 py-0.5 rounded-full bg-primary/20 text-primary text-xs">
              {selectedVoice.name}
            </span>
            {audioUrl && (
              <span className="px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 text-xs">
                Ready
              </span>
            )}
          </CardTitle>
          <CardDescription>
            Generate speech using {selectedVoice.name}'s voice with {selectedVoice.style.toLowerCase()} delivery
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Dialogue Text</label>
            <Textarea 
              placeholder={`Enter ${selectedVoice.name}'s dialogue here...`}
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="min-h-[120px] bg-muted/50"
            />
            <p className="text-xs text-muted-foreground">
              {text.length} characters • ~{Math.max(1, Math.ceil(text.split(' ').filter(Boolean).length / 150))} min audio
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="text-sm font-medium flex items-center justify-between">
                <span>Emotional Intensity</span>
                <span className="text-primary">{emotion[0]}%</span>
              </label>
              <Slider value={emotion} onValueChange={setEmotion} max={100} step={5} />
            </div>
            <div className="space-y-3">
              <label className="text-sm font-medium flex items-center justify-between">
                <span>Voice Stability</span>
                <span className="text-primary">{stability[0]}%</span>
              </label>
              <Slider value={stability} onValueChange={setStability} max={100} step={5} />
            </div>
          </div>

          <div className="flex gap-3">
            <Button 
              onClick={handleSynthesize}
              disabled={isSynthesizing}
              className="flex-1 bg-gradient-to-r from-purple-500 to-violet-600 text-white font-semibold"
            >
              {isSynthesizing ? (
                <><RefreshCw className="w-4 h-4 mr-2 animate-spin" />Synthesizing...</>
              ) : (
                <><Wand2 className="w-4 h-4 mr-2" />Generate Voice</>
              )}
            </Button>
            
            {audioUrl && (
              <>
                <Button variant="outline" onClick={handlePlayPause} className="px-4">
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </Button>
                <Button variant="outline" onClick={stop} className="px-4">
                  <StopCircle className="w-4 h-4" />
                </Button>
              </>
            )}
          </div>

          {isSynthesizing && (
            <div className="space-y-2">
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-muted-foreground text-center">
                {progress < 30 ? "Loading voice model..." : 
                 progress < 60 ? "Processing text..." :
                 progress < 90 ? "Synthesizing audio..." : "Finalizing..."}
              </p>
            </div>
          )}

          {/* Audio Waveform with Real Playback */}
          {audioUrl && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-muted/30 rounded-xl p-6 space-y-4"
            >
              <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={handlePlayPause}>
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                </Button>
                <div className="flex-1 h-14 bg-muted/50 rounded-lg flex items-end justify-center gap-[2px] px-2 py-2 overflow-hidden">
                  {waveformBars.map((h, i) => {
                    const barProgress = (i / waveformBars.length) * 100;
                    const isPast = barProgress < playbackProgress;
                    return (
                      <motion.div
                        key={i}
                        className={`w-1 rounded-full transition-colors duration-150 ${
                          isPast ? "bg-primary" : "bg-primary/30"
                        }`}
                        animate={{ height: isPlaying ? h : h * 0.6 }}
                        transition={{ duration: 0.15 }}
                      />
                    );
                  })}
                </div>
                <Volume2 className="w-5 h-5 text-muted-foreground" />
              </div>

              {/* Playback progress bar */}
              <Slider
                value={[playbackProgress]}
                max={100}
                step={0.5}
                className="cursor-pointer"
              />

              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {selectedVoice.name}'s voice • {selectedVoice.emotion} emotion
                </p>
                <p className="text-xs text-muted-foreground font-mono">
                  {isPlaying ? "▶ Playing" : "⏸ Paused"} • {duration > 0 ? `~${Math.ceil(duration)}s` : "—"}
                </p>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default VoiceCloning;
