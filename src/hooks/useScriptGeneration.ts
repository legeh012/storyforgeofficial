import { useState, useCallback } from "react";

interface ScriptParams {
  prompt: string;
  characters: string[];
  dramaLevel: number;
  conflictIntensity: number;
}

export const useScriptGeneration = () => {
  const [generatedScript, setGeneratedScript] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);

  const generateScript = useCallback(async (params: ScriptParams) => {
    setIsGenerating(true);
    setProgress(0);

    // Simulate local LLM generation with progress
    const steps = [20, 40, 60, 80, 100];
    for (const step of steps) {
      await new Promise(r => setTimeout(r, 600));
      setProgress(step);
    }

    // Generate realistic script based on params
    const script = `FADE IN:

INT. LUXURY RESTAURANT - MINNEAPOLIS - NIGHT

The camera sweeps across an opulent dining room. Crystal chandeliers cast warm light over wealthy patrons. At the center table sits ${params.characters[0] || "LUCKY"}.

${params.characters[0]?.toUpperCase() || "LUCKY"}
(${params.dramaLevel > 70 ? "ice cold, barely contained fury" : "measured, calculating"})
You thought I wouldn't find out?

${params.characters[1] ? `${params.characters[1].toUpperCase()}
(${params.conflictIntensity > 60 ? "defensive, caught off guard" : "dismissive"})
Whatever you heard... it's not what you think.` : ""}

${params.characters[0]?.toUpperCase() || "LUCKY"}
(standing slowly, commanding the room's attention)
That's the thing about secrets in this city. They have a way of finding the light.

The other diners fall silent. The tension is palpable.

${params.characters[2] ? `${params.characters[2].toUpperCase()}
(attempting to intervene)
Ladies, perhaps we should take this somewhere more private—

${params.characters[0]?.toUpperCase() || "LUCKY"}
(cutting her off)
No. Let them watch. Let them see what happens when you cross me.` : ""}

CONFESSIONAL - ${params.characters[0]?.toUpperCase() || "LUCKY"}

${params.characters[0]?.toUpperCase() || "LUCKY"}
(to camera, smirking)
They call me the Architect for a reason. Every move, every word — calculated. And tonight? Tonight is just the foundation.

FADE TO BLACK.

END OF SCENE`;

    setGeneratedScript(script);
    setIsGenerating(false);
  }, []);

  return { generateScript, generatedScript, isGenerating, progress };
};
