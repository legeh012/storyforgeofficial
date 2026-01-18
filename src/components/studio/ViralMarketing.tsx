import { useState } from "react";
import { motion } from "framer-motion";
import { 
  TrendingUp, 
  Wand2, 
  Copy, 
  RefreshCw,
  Twitter,
  Instagram,
  Youtube,
  Share2,
  Sparkles,
  BarChart3,
  Hash,
  Flame
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { useViralMarketing } from "@/hooks/useViralMarketing";

const platforms = [
  { id: "twitter", label: "X/Twitter", icon: Twitter, color: "from-sky-500 to-blue-600", maxLength: 280 },
  { id: "instagram", label: "Instagram", icon: Instagram, color: "from-pink-500 to-purple-600", maxLength: 2200 },
  { id: "youtube", label: "YouTube", icon: Youtube, color: "from-red-500 to-rose-600", maxLength: 5000 },
  { id: "tiktok", label: "TikTok", icon: Share2, color: "from-gray-800 to-gray-900", maxLength: 2200 },
];

const ViralMarketing = () => {
  const [contentType, setContentType] = useState("episode_promo");
  const [platform, setPlatform] = useState("twitter");
  const [context, setContext] = useState("");
  
  const { 
    generate, 
    generatedContent,
    hashtags,
    viralScore,
    engagementPrediction,
    isGenerating, 
    progress 
  } = useViralMarketing();

  const handleGenerate = async () => {
    await generate({
      contentType,
      platform,
      context,
      show: "Say Wallahi: Minneapolis"
    });
  };

  const selectedPlatform = platforms.find(p => p.id === platform);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Controls */}
      <Card className="glass lg:col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-mayza-rose" />
            Marketing Settings
          </CardTitle>
          <CardDescription>Generate viral content for social media</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Content Type */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Content Type</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: "episode_promo", label: "Episode Promo" },
                { id: "teaser", label: "Teaser" },
                { id: "behind_scenes", label: "Behind Scenes" },
                { id: "drama_highlight", label: "Drama Highlight" },
              ].map(type => (
                <button
                  key={type.id}
                  onClick={() => setContentType(type.id)}
                  className={`
                    p-2 rounded-lg text-sm font-medium transition-all
                    ${contentType === type.id 
                      ? "bg-mayza-rose/20 border border-mayza-rose/50" 
                      : "bg-muted/30 hover:bg-muted/50"
                    }
                  `}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* Platform Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Platform</label>
            <div className="grid grid-cols-2 gap-2">
              {platforms.map(p => (
                <button
                  key={p.id}
                  onClick={() => setPlatform(p.id)}
                  className={`
                    p-3 rounded-lg flex items-center gap-2 transition-all
                    ${platform === p.id 
                      ? `bg-gradient-to-r ${p.color} text-white` 
                      : "bg-muted/30 hover:bg-muted/50"
                    }
                  `}
                >
                  <p.icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{p.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Context */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Context / Key Points</label>
            <Textarea 
              placeholder="What should the post highlight? e.g., 'Episode 2 cliffhanger, Amal's shocking revelation'"
              value={context}
              onChange={(e) => setContext(e.target.value)}
              className="min-h-[80px] bg-muted/50"
            />
          </div>

          {/* Generate Button */}
          <Button 
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full bg-gradient-to-r from-rose-500 to-pink-600 text-white font-semibold"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4 mr-2" />
                Generate Content
              </>
            )}
          </Button>

          {isGenerating && (
            <div className="space-y-2">
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-muted-foreground text-center">
                {progress < 30 ? "Analyzing trends..." : 
                 progress < 60 ? "Crafting viral hooks..." :
                 progress < 90 ? "Optimizing engagement..." : "Finalizing..."}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Generated Content */}
      <Card className="glass lg:col-span-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-mayza-rose" />
              Generated Content
              {selectedPlatform && (
                <span className={`ml-2 px-2 py-0.5 rounded-full bg-gradient-to-r ${selectedPlatform.color} text-white text-xs`}>
                  {selectedPlatform.label}
                </span>
              )}
            </CardTitle>
            {generatedContent && (
              <Button variant="outline" size="sm" onClick={() => {
                navigator.clipboard.writeText(generatedContent);
                toast.success("Copied to clipboard");
              }}>
                <Copy className="w-4 h-4 mr-1" />
                Copy
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {generatedContent ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              {/* Main Content */}
              <div className="bg-muted/30 rounded-xl p-6">
                <p className="text-lg leading-relaxed">{generatedContent}</p>
                <p className="text-xs text-muted-foreground mt-4">
                  {generatedContent.length} / {selectedPlatform?.maxLength} characters
                </p>
              </div>

              {/* Hashtags */}
              {hashtags && hashtags.length > 0 && (
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Hash className="w-4 h-4" />
                    Suggested Hashtags
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {hashtags.map((tag: string) => (
                      <span 
                        key={tag}
                        className="px-3 py-1 rounded-full bg-mayza-rose/20 text-mayza-rose text-sm cursor-pointer hover:bg-mayza-rose/30 transition-colors"
                        onClick={() => {
                          navigator.clipboard.writeText(tag);
                          toast.success(`Copied ${tag}`);
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Analytics Prediction */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-muted/30 rounded-xl p-4 text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Flame className="w-5 h-5 text-orange-500" />
                    <span className="text-2xl font-bold text-mayza-gold">{viralScore}%</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Viral Score</p>
                </div>
                <div className="bg-muted/30 rounded-xl p-4 text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <BarChart3 className="w-5 h-5 text-emerald-500" />
                    <span className="text-2xl font-bold text-emerald-400">{engagementPrediction?.likes}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Predicted Likes</p>
                </div>
                <div className="bg-muted/30 rounded-xl p-4 text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Share2 className="w-5 h-5 text-blue-500" />
                    <span className="text-2xl font-bold text-blue-400">{engagementPrediction?.shares}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Predicted Shares</p>
                </div>
              </div>

              {/* A/B Variations */}
              <div className="space-y-3">
                <label className="text-sm font-medium">A/B Test Variations</label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-muted/20 rounded-lg p-3 border border-border/50">
                    <p className="text-xs font-medium text-mayza-gold mb-1">Variation A (Urgent)</p>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      🚨 BREAKING: The drama just got REAL...
                    </p>
                  </div>
                  <div className="bg-muted/20 rounded-lg p-3 border border-border/50">
                    <p className="text-xs font-medium text-mayza-purple mb-1">Variation B (Mysterious)</p>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      What really happened behind those doors? 👀
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
              <TrendingUp className="w-16 h-16 mb-4 opacity-30" />
              <p>Your viral content will appear here</p>
              <p className="text-sm mt-2">Select platform and content type to start</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ViralMarketing;
