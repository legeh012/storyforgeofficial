import { motion } from "framer-motion";
import { FileText, Mic2, Video, TrendingUp, Zap, Brain, Sparkles, Layers } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const capabilities = [
  {
    id: "script",
    title: "Script Generation",
    description: "Reality TV scripts with natural dialogue, character conflicts, and plot progression",
    icon: FileText,
    color: "mayza-gold",
    features: [
      "Character-specific voice patterns",
      "Dramatic conflict escalation",
      "Episode arc planning",
      "Confessional content generation"
    ],
    model: "Local LLM (Ollama)"
  },
  {
    id: "voice",
    title: "Voice Cloning",
    description: "Unique voices for each cast member with emotional range and consistency",
    icon: Mic2,
    color: "mayza-purple",
    features: [
      "8 distinct character voices",
      "Emotional tone control",
      "Real-time synthesis",
      "Voice consistency across episodes"
    ],
    model: "Coqui XTTS / Piper TTS"
  },
  {
    id: "video",
    title: "Video Synthesis",
    description: "Ultra-realistic video generation with character consistency and quality control",
    icon: Video,
    color: "mayza-cyan",
    features: [
      "4K resolution output",
      "Character face consistency",
      "Scene transitions",
      "Lip-sync integration"
    ],
    model: "Open-Sora / CogVideoX"
  },
  {
    id: "viral",
    title: "Viral Marketing",
    description: "Engaging descriptions, social posts, and promotional content",
    icon: TrendingUp,
    color: "mayza-rose",
    features: [
      "Platform-specific optimization",
      "Hashtag generation",
      "Engagement prediction",
      "A/B test variations"
    ],
    model: "Local LLM (Ollama)"
  }
];

const ProductionCapabilities = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {capabilities.map((cap, index) => (
        <motion.div
          key={cap.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className="glass h-full hover:border-primary/30 transition-all duration-300 group">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className={`p-3 rounded-xl bg-${cap.color}/20 group-hover:bg-${cap.color}/30 transition-colors`}>
                  <cap.icon className={`w-6 h-6 text-${cap.color}`} />
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
                  {cap.model}
                </span>
              </div>
              <CardTitle className="text-lg mt-4">{cap.title}</CardTitle>
              <CardDescription>{cap.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {cap.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Sparkles className="w-3 h-3 text-primary" />
                    {feature}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};

export default ProductionCapabilities;
