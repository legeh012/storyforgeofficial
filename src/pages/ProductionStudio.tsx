import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FileText, 
  Mic2, 
  Video, 
  TrendingUp, 
  ArrowLeft,
  Sparkles
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ScriptGenerator from "@/components/studio/ScriptGenerator";
import VoiceCloning from "@/components/studio/VoiceCloning";
import VideoSynthesis from "@/components/studio/VideoSynthesis";
import ViralMarketing from "@/components/studio/ViralMarketing";

const ProductionStudio = () => {
  const [activeTab, setActiveTab] = useState("script");

  const tabs = [
    { id: "script", label: "Script Generation", icon: FileText, color: "mayza-gold" },
    { id: "voice", label: "Voice Cloning", icon: Mic2, color: "mayza-purple" },
    { id: "video", label: "Video Synthesis", icon: Video, color: "mayza-cyan" },
    { id: "viral", label: "Viral Marketing", icon: TrendingUp, color: "mayza-rose" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="container py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/dashboard">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl gradient-gold">
                <Sparkles className="w-5 h-5 text-background" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Production Studio</h1>
                <p className="text-sm text-muted-foreground">Say Wallahi: Minneapolis</p>
              </div>
            </div>
          </div>
          
          <Button className="gradient-purple text-white">
            <Video className="w-4 h-4 mr-2" />
            Export Episode
          </Button>
        </div>
      </header>

      <main className="container py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid grid-cols-4 gap-4 bg-transparent h-auto p-0">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className={`
                  glass data-[state=active]:border-${tab.color}/50
                  data-[state=active]:bg-${tab.color}/10
                  flex items-center gap-3 py-4 px-6 rounded-xl
                  transition-all duration-300
                `}
              >
                <tab.icon className={`w-5 h-5 text-${tab.color}`} />
                <span className="font-medium">{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <TabsContent value="script" className="mt-0">
                <ScriptGenerator />
              </TabsContent>
              
              <TabsContent value="voice" className="mt-0">
                <VoiceCloning />
              </TabsContent>
              
              <TabsContent value="video" className="mt-0">
                <VideoSynthesis />
              </TabsContent>
              
              <TabsContent value="viral" className="mt-0">
                <ViralMarketing />
              </TabsContent>
            </motion.div>
          </AnimatePresence>
        </Tabs>
      </main>
    </div>
  );
};

export default ProductionStudio;
