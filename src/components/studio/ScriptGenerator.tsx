import { useState } from "react";
import { motion } from "framer-motion";
import { 
  FileText, 
  Wand2, 
  Users, 
  Sparkles, 
  Copy, 
  Download,
  RefreshCw,
  Drama,
  MessageSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { useScriptGeneration } from "@/hooks/useScriptGeneration";

const characters = [
  { name: "Lucky", role: "The Architect", selected: true },
  { name: "Luul", role: "The Legacy Queen", selected: true },
  { name: "Amal", role: "The Glam Villain", selected: true },
  { name: "Zahra", role: "The Satirist", selected: false },
  { name: "Nasra", role: "The Emotional Magnet", selected: false },
  { name: "Hani", role: "The Trauma Mapper", selected: false },
  { name: "Ayaan", role: "The Schema Poet", selected: false },
];

const ScriptGenerator = () => {
  const [prompt, setPrompt] = useState("");
  const [selectedCharacters, setSelectedCharacters] = useState(
    characters.filter(c => c.selected).map(c => c.name)
  );
  const [dramaLevel, setDramaLevel] = useState([70]);
  const [conflictIntensity, setConflictIntensity] = useState([60]);
  
  const { 
    generateScript, 
    generatedScript, 
    isGenerating, 
    progress 
  } = useScriptGeneration();

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a scene prompt");
      return;
    }
    
    await generateScript({
      prompt,
      characters: selectedCharacters,
      dramaLevel: dramaLevel[0],
      conflictIntensity: conflictIntensity[0]
    });
  };

  const toggleCharacter = (name: string) => {
    setSelectedCharacters(prev => 
      prev.includes(name) 
        ? prev.filter(c => c !== name)
        : [...prev, name]
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Controls */}
      <Card className="glass lg:col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-mayza-gold" />
            Script Settings
          </CardTitle>
          <CardDescription>Configure your reality TV script generation</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Scene Prompt */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Scene Prompt</label>
            <Textarea 
              placeholder="Describe the scene... e.g., 'Amal confronts Lucky at the fashion show about the leaked photos'"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-[100px] bg-muted/50"
            />
          </div>

          {/* Character Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium flex items-center gap-2">
              <Users className="w-4 h-4" />
              Characters in Scene
            </label>
            <div className="flex flex-wrap gap-2">
              {characters.map(char => (
                <button
                  key={char.name}
                  onClick={() => toggleCharacter(char.name)}
                  className={`
                    px-3 py-1.5 rounded-full text-xs font-medium transition-all
                    ${selectedCharacters.includes(char.name)
                      ? "bg-mayza-gold text-background"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }
                  `}
                >
                  {char.name}
                </button>
              ))}
            </div>
          </div>

          {/* Drama Level */}
          <div className="space-y-3">
            <label className="text-sm font-medium flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Drama className="w-4 h-4" />
                Drama Level
              </span>
              <span className="text-mayza-gold">{dramaLevel[0]}%</span>
            </label>
            <Slider 
              value={dramaLevel} 
              onValueChange={setDramaLevel}
              max={100}
              step={5}
              className="py-2"
            />
          </div>

          {/* Conflict Intensity */}
          <div className="space-y-3">
            <label className="text-sm font-medium flex items-center justify-between">
              <span className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Conflict Intensity
              </span>
              <span className="text-mayza-purple">{conflictIntensity[0]}%</span>
            </label>
            <Slider 
              value={conflictIntensity} 
              onValueChange={setConflictIntensity}
              max={100}
              step={5}
              className="py-2"
            />
          </div>

          {/* Generate Button */}
          <Button 
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full gradient-gold text-background font-semibold"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4 mr-2" />
                Generate Script
              </>
            )}
          </Button>

          {isGenerating && (
            <div className="space-y-2">
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-muted-foreground text-center">
                {progress < 30 ? "Analyzing characters..." : 
                 progress < 60 ? "Building dramatic tension..." :
                 progress < 90 ? "Writing dialogue..." : "Finalizing script..."}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Generated Script */}
      <Card className="glass lg:col-span-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-mayza-gold" />
              Generated Script
            </CardTitle>
            {generatedScript && (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => {
                  navigator.clipboard.writeText(generatedScript);
                  toast.success("Script copied to clipboard");
                }}>
                  <Copy className="w-4 h-4 mr-1" />
                  Copy
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
          {generatedScript ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-muted/30 rounded-lg p-6 font-mono text-sm whitespace-pre-wrap max-h-[600px] overflow-y-auto"
            >
              {generatedScript}
            </motion.div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
              <FileText className="w-16 h-16 mb-4 opacity-30" />
              <p>Your generated script will appear here</p>
              <p className="text-sm mt-2">Configure settings and click Generate to start</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ScriptGenerator;
