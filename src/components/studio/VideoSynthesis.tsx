import { useState, useRef } from "react";
import { motion } from "framer-motion";
import ReactPlayer from "react-player";
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
  Zap,
  Volume2,
  VolumeX,
  Maximize2,
  SkipBack,
  Square
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
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState([80]);
  const [played, setPlayed] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const playerRef = useRef<ReactPlayer>(null);

  const { 
    synthesize,
    cancelSynthesis,
    videoUrl,
    generatedVideo,
    isSynthesizing, 
    progress,
    currentStage
  } = useVideoSynthesis();

  const handleSynthesize = async () => {
    if (!scenePrompt.trim()) {
      toast.error("Please enter a scene description");
      return;
    }
    
    setIsPlaying(false);
    setPlayed(0);
    
    await synthesize({
      prompt: scenePrompt,
      quality,
      style,
      characterConsistency: characterConsistency[0],
      motionSmoothing: motionSmoothing[0]
    });

    toast.success("Video generated successfully!");
  };

  const handleProgress = (state: { played: number; playedSeconds: number }) => {
    setPlayed(state.played);
  };

  const handleDuration = (dur: number) => {
    setVideoDuration(dur);
  };

  const handleSeek = (value: number[]) => {
    const seekTo = value[0] / 100;
    setPlayed(seekTo);
    playerRef.current?.seekTo(seekTo, "fraction");
  };

  const handleRestart = () => {
    setPlayed(0);
    playerRef.current?.seekTo(0, "fraction");
    setIsPlaying(true);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const handleDownload = async () => {
    if (!videoUrl) return;
    try {
      const a = document.createElement("a");
      a.href = videoUrl;
      a.download = `storyforge_video_${Date.now()}.mp4`;
      a.target = "_blank";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast.success("Download started");
    } catch {
      toast.error("Download failed — try right-clicking the video");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Controls */}
      <Card className="glass lg:col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="w-5 h-5 text-primary" />
            Video Settings
          </CardTitle>
          <CardDescription>Configure ultra-realistic video generation</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Scene Description</label>
            <Textarea 
              placeholder="Describe the scene in detail... e.g., 'Lucky enters the restaurant in a stunning gold dress, all eyes turn to her'"
              value={scenePrompt}
              onChange={(e) => setScenePrompt(e.target.value)}
              className="min-h-[100px] bg-muted/50"
            />
          </div>

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
                  className={`p-3 rounded-lg text-center transition-all ${
                    quality === preset.id 
                      ? "bg-primary/20 border border-primary/50" 
                      : "bg-muted/30 hover:bg-muted/50"
                  }`}
                >
                  <p className="font-medium text-sm">{preset.label}</p>
                  <p className="text-xs text-muted-foreground">{preset.resolution}</p>
                </button>
              ))}
            </div>
          </div>

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
                  className={`p-2 rounded-lg text-left transition-all ${
                    style === preset.id 
                      ? "bg-primary/20 border border-primary/50" 
                      : "bg-muted/30 hover:bg-muted/50"
                  }`}
                >
                  <p className="font-medium text-sm">{preset.label}</p>
                  <p className="text-xs text-muted-foreground">{preset.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Layers className="w-4 h-4" />
                Character Consistency
              </span>
              <span className="text-primary">{characterConsistency[0]}%</span>
            </label>
            <Slider 
              value={characterConsistency} 
              onValueChange={setCharacterConsistency}
              max={100}
              step={5}
            />
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Motion Smoothing
              </span>
              <span className="text-accent-foreground">{motionSmoothing[0]}%</span>
            </label>
            <Slider 
              value={motionSmoothing} 
              onValueChange={setMotionSmoothing}
              max={100}
              step={5}
            />
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={handleSynthesize}
              disabled={isSynthesizing}
              className="flex-1 bg-gradient-to-r from-cyan-500 to-teal-600 text-white font-semibold"
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
              <Button variant="outline" onClick={cancelSynthesis}>
                <Square className="w-4 h-4" />
              </Button>
            )}
          </div>

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

      {/* Video Preview with Real Player */}
      <Card className="glass lg:col-span-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Monitor className="w-5 h-5 text-primary" />
              Video Preview
              {generatedVideo?.hasAudio && (
                <span className="ml-2 px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 text-xs flex items-center gap-1">
                  <Volume2 className="w-3 h-3" /> Audio
                </span>
              )}
            </CardTitle>
            {videoUrl && (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleRestart}>
                  <SkipBack className="w-4 h-4 mr-1" />
                  Restart
                </Button>
                <Button variant="outline" size="sm" onClick={handleDownload}>
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
              {/* Actual Video Player */}
              <div className="relative aspect-video bg-black rounded-xl overflow-hidden">
                <ReactPlayer
                  ref={playerRef}
                  url={videoUrl}
                  playing={isPlaying}
                  muted={isMuted}
                  volume={volume[0] / 100}
                  width="100%"
                  height="100%"
                  onProgress={handleProgress}
                  onDuration={handleDuration}
                  onEnded={() => setIsPlaying(false)}
                  onError={() => toast.error("Video playback error")}
                  config={{
                    file: {
                      attributes: {
                        crossOrigin: "anonymous",
                      },
                    },
                  }}
                  style={{ position: "absolute", top: 0, left: 0 }}
                />
                
                {/* Play overlay (click to play/pause) */}
                {!isPlaying && (
                  <div 
                    className="absolute inset-0 flex items-center justify-center cursor-pointer bg-black/20"
                    onClick={() => setIsPlaying(true)}
                  >
                    <div className="rounded-full w-16 h-16 bg-white/20 backdrop-blur-sm hover:bg-white/30 flex items-center justify-center transition-all">
                      <Play className="w-8 h-8 text-white ml-1" />
                    </div>
                  </div>
                )}

                {/* Click to pause when playing */}
                {isPlaying && (
                  <div 
                    className="absolute inset-0 cursor-pointer"
                    onClick={() => setIsPlaying(false)}
                  />
                )}
              </div>

              {/* Transport Controls */}
              <div className="bg-muted/30 rounded-xl p-4 space-y-3">
                {/* Seek Bar */}
                <Slider
                  value={[played * 100]}
                  onValueChange={handleSeek}
                  max={100}
                  step={0.1}
                  className="cursor-pointer"
                />
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="h-8 w-8"
                    >
                      {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleRestart}
                      className="h-8 w-8"
                    >
                      <SkipBack className="w-4 h-4" />
                    </Button>
                    <span className="text-xs text-muted-foreground font-mono">
                      {formatTime(played * videoDuration)} / {formatTime(videoDuration)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsMuted(!isMuted)}
                      className="h-8 w-8"
                    >
                      {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </Button>
                    <div className="w-20">
                      <Slider
                        value={isMuted ? [0] : volume}
                        onValueChange={(v) => { setVolume(v); setIsMuted(false); }}
                        max={100}
                        step={5}
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Video Stats */}
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-muted/30 rounded-lg p-3">
                  <p className="text-2xl font-bold text-primary">
                    {generatedVideo?.resolution || qualityPresets.find(q => q.id === quality)?.resolution}
                  </p>
                  <p className="text-xs text-muted-foreground">Resolution</p>
                </div>
                <div className="bg-muted/30 rounded-lg p-3">
                  <p className="text-2xl font-bold text-secondary-foreground">
                    {generatedVideo?.fps || qualityPresets.find(q => q.id === quality)?.fps}
                  </p>
                  <p className="text-xs text-muted-foreground">FPS</p>
                </div>
                <div className="bg-muted/30 rounded-lg p-3">
                  <p className="text-2xl font-bold text-accent-foreground">
                    {videoDuration > 0 ? formatTime(videoDuration) : "—"}
                  </p>
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
