import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Video, 
  Play, 
  Pause, 
  Settings2,
  Wand2,
  Download,
  RefreshCw,
  Monitor,
  Layers,
  Palette,
  Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { useVideoSynthesis } from "@/hooks/useVideoSynthesis";

const qualityPresets = [
  { id: "draft", label: "Draft", resolution: "720p", fps: 24, desc: "Fast preview" },
  { id: "standard", label: "Standard", resolution: "1080p", fps: 30, desc: "Good quality" },
  { id: "premium", label: "Premium", resolution: "4K", fps: 60, desc: "Ultra quality" },
];

const stylePresets = [
  { id: "cinematic", label: "Cinematic", desc: "Film-like look" },
  { id: "reality", label: "Reality TV", desc: "Documentary style" },
  { id: "dramatic", label: "Dramatic", desc: "High contrast" },
  { id: "vibrant", label: "Vibrant", desc: "Bold colors" },
];

const VideoSynthesis = () => {
  const [scenePrompt, setScenePrompt] = useState("");
  const [quality, setQuality] = useState("standard");
  const [style, setStyle] = useState("reality");
  const [characterConsistency, setCharacterConsistency] = useState([85]);
  const [motionSmoothing, setMotionSmoothing] = useState([70]);
  const [isPlaying, setIsPlaying] = useState(false);

  const { 
    synthesize, 
    videoUrl, 
    isSynthesizing, 
    progress,
    currentStage
  } = useVideoSynthesis();

  const handleSynthesize = async () => {
    if (!scenePrompt.trim()) {
      toast.error("Please enter a scene description");
      return;
    }
    
    await synthesize({
      prompt: scenePrompt,
      quality,
      style,
      characterConsistency: characterConsistency[0],
      motionSmoothing: motionSmoothing[0]
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Controls */}
      <Card className="glass lg:col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="w-5 h-5 text-mayza-cyan" />
            Video Settings
          </CardTitle>
          <CardDescription>Configure ultra-realistic video generation</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Scene Prompt */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Scene Description</label>
            <Textarea 
              placeholder="Describe the scene in detail... e.g., 'Lucky enters the restaurant in a stunning gold dress, all eyes turn to her'"
              value={scenePrompt}
              onChange={(e) => setScenePrompt(e.target.value)}
              className="min-h-[100px] bg-muted/50"
            />
          </div>

          {/* Quality Preset */}
          <div className="space-y-3">
            <label className="text-sm font-medium flex items-center gap-2">
              <Monitor className="w-4 h-4" />
              Quality
            </label>
            <div className="grid grid-cols-3 gap-2">
              {qualityPresets.map(preset => (
                <button
                  key={preset.id}
                  onClick={() => setQuality(preset.id)}
                  className={`
                    p-3 rounded-lg text-center transition-all
                    ${quality === preset.id 
                      ? "bg-mayza-cyan/20 border border-mayza-cyan/50" 
                      : "bg-muted/30 hover:bg-muted/50"
                    }
                  `}
                >
                  <p className="font-medium text-sm">{preset.label}</p>
                  <p className="text-xs text-muted-foreground">{preset.resolution}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Style Preset */}
          <div className="space-y-3">
            <label className="text-sm font-medium flex items-center gap-2">
              <Palette className="w-4 h-4" />
              Visual Style
            </label>
            <div className="grid grid-cols-2 gap-2">
              {stylePresets.map(preset => (
                <button
                  key={preset.id}
                  onClick={() => setStyle(preset.id)}
                  className={`
                    p-2 rounded-lg text-left transition-all
                    ${style === preset.id 
                      ? "bg-mayza-cyan/20 border border-mayza-cyan/50" 
                      : "bg-muted/30 hover:bg-muted/50"
                    }
                  `}
                >
                  <p className="font-medium text-sm">{preset.label}</p>
                  <p className="text-xs text-muted-foreground">{preset.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Character Consistency */}
          <div className="space-y-3">
            <label className="text-sm font-medium flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Layers className="w-4 h-4" />
                Character Consistency
              </span>
              <span className="text-mayza-cyan">{characterConsistency[0]}%</span>
            </label>
            <Slider 
              value={characterConsistency} 
              onValueChange={setCharacterConsistency}
              max={100}
              step={5}
            />
          </div>

          {/* Motion Smoothing */}
          <div className="space-y-3">
            <label className="text-sm font-medium flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Motion Smoothing
              </span>
              <span className="text-mayza-purple">{motionSmoothing[0]}%</span>
            </label>
            <Slider 
              value={motionSmoothing} 
              onValueChange={setMotionSmoothing}
              max={100}
              step={5}
            />
          </div>

          {/* Generate Button */}
          <Button 
            onClick={handleSynthesize}
            disabled={isSynthesizing}
            className="w-full bg-gradient-to-r from-cyan-500 to-teal-600 text-white font-semibold"
          >
            {isSynthesizing ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Rendering...
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4 mr-2" />
                Generate Video
              </>
            )}
          </Button>

          {isSynthesizing && (
            <div className="space-y-2">
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-muted-foreground text-center">
                {currentStage || "Initializing..."}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Video Preview */}
      <Card className="glass lg:col-span-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Monitor className="w-5 h-5 text-mayza-cyan" />
              Video Preview
            </CardTitle>
            {videoUrl && (
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Settings2 className="w-4 h-4 mr-1" />
                  Edit
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-1" />
                  Export
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {videoUrl ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              <div className="relative aspect-video bg-muted/30 rounded-xl overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Button 
                    size="lg" 
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="rounded-full w-16 h-16 bg-white/20 backdrop-blur-sm hover:bg-white/30"
                  >
                    {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8" />}
                  </Button>
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex-1 h-1 bg-white/30 rounded-full">
                      <div className="w-1/3 h-full bg-mayza-cyan rounded-full" />
                    </div>
                    <span className="text-xs text-white">0:00 / 0:30</span>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-muted/30 rounded-lg p-3">
                  <p className="text-2xl font-bold text-mayza-cyan">{qualityPresets.find(q => q.id === quality)?.resolution}</p>
                  <p className="text-xs text-muted-foreground">Resolution</p>
                </div>
                <div className="bg-muted/30 rounded-lg p-3">
                  <p className="text-2xl font-bold text-mayza-purple">{qualityPresets.find(q => q.id === quality)?.fps}</p>
                  <p className="text-xs text-muted-foreground">FPS</p>
                </div>
                <div className="bg-muted/30 rounded-lg p-3">
                  <p className="text-2xl font-bold text-mayza-gold">30s</p>
                  <p className="text-xs text-muted-foreground">Duration</p>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="aspect-video flex flex-col items-center justify-center bg-muted/20 rounded-xl border border-dashed border-border">
              <Video className="w-20 h-20 mb-4 text-muted-foreground/30" />
              <p className="text-muted-foreground">Your generated video will appear here</p>
              <p className="text-sm text-muted-foreground/60 mt-2">Configure settings and click Generate to start</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default VideoSynthesis;
