import { copilotAuth } from "./copilot-auth";
import { log } from "./index";

/**
 * AI Orchestrator for Video Generation
 * Uses GitHub Copilot API for intelligent context understanding and content generation
 */

export interface OrchestrationContext {
  episodeId?: number;
  projectId?: number;
  genre?: string;
  tone?: string;
  targetAudience?: string;
  style?: "cinematic" | "comic" | "anime" | "reality" | "documentary";
  quality?: "draft" | "standard" | "premium";
  previousOutputs?: any[];
}

export interface GenerationPlan {
  scenes: ScenePlan[];
  voiceover: VoiceOverPlan;
  music: MusicPlan;
  effects: EffectsPlan;
  estimatedDuration: number;
}

export interface ScenePlan {
  sceneNumber: number;
  duration: number;
  description: string;
  visuals: string;
  cameraWork: string;
  lighting: string;
}

export interface VoiceOverPlan {
  characterVoices: { name: string; tone: string; personality: string }[];
  narratorStyle: string;
  musicBed: string;
}

export interface MusicPlan {
  primaryGenre: string;
  bpm: number;
  mood: string;
  variations: string[];
}

export interface EffectsPlan {
  transitions: string[];
  vfx: string[];
  colorGrading: string;
  filterStyle: string;
}

class AIOrchestrator {
  private copilotAvailable: boolean;
  private systemPrompt: string;

  constructor() {
    this.copilotAvailable = copilotAuth.isAvailable();

    if (this.copilotAvailable) {
      log("✓ AI Orchestrator initialized with Copilot API", "orchestrator");
    } else {
      log(
        "⚠️  Copilot not available - using fallback generation",
        "orchestrator"
      );
    }

    this.systemPrompt = `You are an expert AI video producer and creative director. You understand:
- Film production techniques and cinematography
- Story structure and narrative pacing
- Character development and dialogue
- Visual storytelling and composition
- Audio design and music selection
- Color theory and visual aesthetics
- Viral content trends and audience engagement

When given a brief or context, you create detailed, actionable plans that can be executed by AI video generation systems.
Your responses should be structured, specific, and production-ready.`;
  }

  /**
   * Understand user intent and convert to generation plan
   * Uses GitHub Copilot API for intelligent understanding
   */
  async understandUserInput(
    userInput: string,
    context: OrchestrationContext = {}
  ): Promise<{ understanding: string; plan: GenerationPlan }> {
    try {
      if (!this.copilotAvailable) {
        log("Using fallback generation (Copilot unavailable)", "orchestrator");
        return this.generatePlanFromInput(userInput, context);
      }

      const contextString = this.buildContextString(context);
      const prompt = `Context: ${contextString}\n\nUser Request: "${userInput}"\n\nAs a video production expert, analyze this request and provide:
1. A clear understanding of what the user wants
2. A detailed JSON production plan with scenes, voiceover, music, effects, and duration

Format your response as:
UNDERSTANDING: [Your analysis]
PLAN: [JSON object with scenes, voiceover, music, effects, estimatedDuration]`;

      // Call Copilot API
      const response = await this.callCopilotAPI(prompt, this.systemPrompt);

      if (!response) {
        return this.generatePlanFromInput(userInput, context);
      }

      // Parse the response
      const understandingMatch = response.match(
        /UNDERSTANDING:\s*([\s\S]*?)(?=PLAN:|$)/
      );
      const planMatch = response.match(/PLAN:\s*([\s\S]*?)$/);

      const understanding = understandingMatch
        ? understandingMatch[1].trim()
        : response;

      let plan: GenerationPlan;
      try {
        const planText = planMatch ? planMatch[1].trim() : "{}";
        const cleanedJson = planText
          .replace(/```json\n?|\n?```/g, "")
          .replace(/```\n?|\n?```/g, "");
        plan = JSON.parse(cleanedJson);
      } catch {
        plan = this.getDefaultPlan();
      }

      return { understanding, plan };
    } catch (error) {
      log(`Error in understandUserInput: ${error}`, "orchestrator");
      return this.generatePlanFromInput(userInput, context);
    }
  }

  /**
   * Call GitHub Copilot API for intelligent content generation
   * Falls back to OpenAI if Copilot not available
   */
  private async callCopilotAPI(
    userMessage: string,
    systemPrompt: string
  ): Promise<string | null> {
    try {
      const apiKey = copilotAuth.getApiKey();

      // Check if we have a valid API key (skip placeholder like "your-github-copilot-token-here")
      if (!apiKey || apiKey.startsWith("your-")) {
        log("Copilot API key is not valid, trying OpenAI", "orchestrator");
        return await this.tryOpenAIFallback(userMessage, systemPrompt);
      }

      // Try Copilot first
      const response = await fetch(
        "https://api.githubcopilot.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "gpt-4-turbo",
            temperature: 0.7,
            messages: [
              {
                role: "system",
                content: systemPrompt,
              },
              {
                role: "user",
                content: userMessage,
              },
            ],
            max_tokens: 2000,
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        return data.choices?.[0]?.message?.content || null;
      }

      log(
        `Copilot API error (${response.status}), trying OpenAI fallback`,
        "orchestrator"
      );
      return await this.tryOpenAIFallback(userMessage, systemPrompt);
    } catch (error) {
      log(
        `Failed to call Copilot API: ${error}, trying OpenAI`,
        "orchestrator"
      );
      return await this.tryOpenAIFallback(userMessage, systemPrompt);
    }
  }

  /**
   * Fallback to OpenAI when Copilot is not available
   */
  private async tryOpenAIFallback(
    userMessage: string,
    systemPrompt: string
  ): Promise<string | null> {
    try {
      const apiKey = process.env.OPENAI_API_KEY;

      // Check if we have a valid OpenAI key (not test key)
      if (!apiKey || apiKey === "sk-test-key-do-not-use-production") {
        log(
          "No valid OpenAI key, using smart fallback generation",
          "orchestrator"
        );
        return null;
      }

      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "gpt-4-turbo",
            temperature: 0.7,
            messages: [
              {
                role: "system",
                content: systemPrompt,
              },
              {
                role: "user",
                content: userMessage,
              },
            ],
            max_tokens: 2000,
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        log("✓ Using OpenAI API for content generation", "orchestrator");
        return data.choices?.[0]?.message?.content || null;
      }

      log(
        `OpenAI API error (${response.status}), using smart fallback`,
        "orchestrator"
      );
      return null;
    } catch (error) {
      log(
        `OpenAI fallback failed: ${error}, using smart generation`,
        "orchestrator"
      );
      return null;
    }
  }

  /**
   * Generate plan from user input without API (fallback)
   */
  private generatePlanFromInput(
    userInput: string,
    context: OrchestrationContext
  ): { understanding: string; plan: GenerationPlan } {
    const lowerInput = userInput.toLowerCase();

    // Extract keywords to understand intent
    const isAction =
      lowerInput.includes("action") ||
      lowerInput.includes("fight") ||
      lowerInput.includes("intense");
    const isRomantic =
      lowerInput.includes("romantic") ||
      lowerInput.includes("love") ||
      lowerInput.includes("emotional");
    const isComedy =
      lowerInput.includes("comedy") ||
      lowerInput.includes("funny") ||
      lowerInput.includes("laugh");
    const isDrama =
      lowerInput.includes("drama") ||
      lowerInput.includes("serious") ||
      lowerInput.includes("dark");
    const isTikTok =
      lowerInput.includes("tiktok") ||
      lowerInput.includes("short") ||
      lowerInput.includes("15s") ||
      lowerInput.includes("30s");

    let understanding = `I understand you want to create a ${
      isAction
        ? "dynamic, action-packed"
        : isRomantic
        ? "emotional, romantic"
        : isComedy
        ? "funny, entertaining"
        : isDrama
        ? "serious, dramatic"
        : "engaging, professional"
    } video content`;

    if (isTikTok) {
      understanding += " optimized for TikTok";
    }

    understanding +=
      ". I'll create a production plan that captures this energy.";

    // Create a contextual plan
    let plan = this.getDefaultPlan();

    // Adjust based on detected style
    if (isAction) {
      plan.music.bpm = 140;
      plan.music.primaryGenre = "Electronic/Action";
      plan.effects.vfx = ["Energy bursts", "Quick cuts", "Dynamic transitions"];
      plan.voiceover.narratorStyle = "Bold and commanding";
    } else if (isRomantic) {
      plan.music.bpm = 90;
      plan.music.primaryGenre = "Orchestral/Romantic";
      plan.effects.colorGrading = "Warm, intimate tones";
      plan.voiceover.narratorStyle = "Soft and emotional";
    } else if (isComedy) {
      plan.music.primaryGenre = "Upbeat/Comedic";
      plan.effects.transitions = [
        "Jump cuts",
        "Quick wipes",
        "Playful dissolves",
      ];
    }

    if (isTikTok) {
      plan.estimatedDuration = 30;
      plan.scenes = plan.scenes.slice(0, 3);
    }

    return { understanding, plan };
  }

  /**
   * Generate a script from context and theme
   * Uses Copilot for professional screenplay generation
   */
  async generateScript(
    theme: string,
    context: OrchestrationContext
  ): Promise<string> {
    try {
      if (!this.copilotAvailable) {
        log("Using fallback script generation", "orchestrator");
        return this.generateDefaultScript(theme, context);
      }

      const contextString = this.buildContextString(context);
      const prompt = `Theme: ${theme}\n\nContext: ${contextString}\n\nWrite a professional screenplay script (2-3 pages) in proper format with INT./EXT. scene headings, action lines, character names, dialogue, and parentheticals. Make it engaging and suitable for ${
        context.genre || "general"
      } audience with a ${context.tone || "engaging"} tone.`;

      const systemPrompt = `You are a professional screenwriter expert. Write engaging, cinematic screenplays that follow proper industry formatting. Scripts should have clear scene headings (INT./EXT.), descriptive action, character introductions, and natural dialogue.`;

      const script = await this.callCopilotAPI(prompt, systemPrompt);
      return script || this.generateDefaultScript(theme, context);
    } catch (error) {
      log(`Script generation error: ${error}`, "orchestrator");
      return this.generateDefaultScript(theme, context);
    }
  }

  private generateDefaultScript(
    theme: string,
    context: OrchestrationContext
  ): string {
    const genre = context.genre || "general";
    const tone = context.tone || "dramatic";

    return `FADE IN:

EXT. DRAMATIC SETTING - DAY

[Scene opens with a compelling visual establishing the mood]

The camera pulls back to reveal the full landscape. The atmosphere is ${tone}.

INT. MAIN LOCATION - CONTINUOUS

[Main characters enter, their presence fills the space]

CHARACTER enters, determined. The music swells. Something important is about to happen.

CHARACTER
${theme}

[Beat. The weight of the moment settles]

The camera captures their expression - focused, intense, ready.

INT. LOCATION - LATER

[The journey continues. Visuals build intensity]

Everything converges toward a powerful moment. The ${genre.toLowerCase()} elements reach their peak.

CHARACTER
This is my moment.

[Final beat. Music crescendos]

FADE TO BLACK.

THE END`;
  }

  /**
   * Generate dialogue for specific characters
   * Uses Copilot for natural, contextual dialogue
   */
  async generateDialogue(
    character: string,
    situation: string,
    context: OrchestrationContext
  ): Promise<string> {
    try {
      if (!this.copilotAvailable) {
        log("Using fallback dialogue generation", "orchestrator");
        return this.generateDefaultDialogue(character, situation, context);
      }

      const prompt = `Character: ${character}\nSituation: ${situation}\nTone: ${
        context.tone || "neutral"
      }\nGenre: ${
        context.genre || "general"
      }\n\nWrite 3-5 lines of natural, engaging dialogue for this character in this situation. Format as screenplay dialogue with character name, parentheticals, and dialogue lines.`;

      const systemPrompt = `You are an expert dialogue writer. Write natural, character-authentic dialogue that fits the tone and genre. Use proper screenplay formatting with character names, action parentheticals, and dialogue.`;

      const dialogue = await this.callCopilotAPI(prompt, systemPrompt);
      return (
        dialogue || this.generateDefaultDialogue(character, situation, context)
      );
    } catch (error) {
      log(`Dialogue generation error: ${error}`, "orchestrator");
      return this.generateDefaultDialogue(character, situation, context);
    }
  }

  private generateDefaultDialogue(
    character: string,
    situation: string,
    context: OrchestrationContext
  ): string {
    const tone = context.tone || "neutral";
    const isIntense = tone.includes("intense") || tone.includes("action");
    const isRomantic = tone.includes("romantic") || tone.includes("emotional");
    const isComedy = tone.includes("comedy") || tone.includes("funny");

    if (isIntense) {
      return `${character}
(breathing heavily)
This ends here.

(takes a step forward)
You had your chance.

(determined)
Now it's my turn.`;
    } else if (isRomantic) {
      return `${character}
(vulnerable, sincere)
I never thought I'd feel this way.

(looking into their eyes)
But then you came along.

(softly)
You changed everything.`;
    } else if (isComedy) {
      return `${character}
(laughing)
So that's your plan?

(shaking head)
That's the worst idea I've ever heard!

(grinning)
I love it. Let's do it.`;
    } else {
      return `${character}
${situation} is important.

I need you to understand something.

This matters to me.`;
    }
  }

  /**
   * Suggest music/audio based on scene context
   * Uses Copilot for intelligent music selection
   */
  async suggestAudio(
    sceneDescription: string,
    context: OrchestrationContext
  ): Promise<{
    musicGenre: string;
    bpm: number;
    mood: string;
    suggestions: string[];
  }> {
    try {
      if (!this.copilotAvailable) {
        log("Using fallback audio generation", "orchestrator");
        return this.generateDefaultAudio(sceneDescription, context);
      }

      const prompt = `Scene: ${sceneDescription}\nStyle: ${
        context.style || "cinematic"
      }\nTone: ${
        context.tone || "neutral"
      }\n\nRespond ONLY with a JSON object (no markdown, no code fences) containing:\n- musicGenre: string\n- bpm: number\n- mood: string\n- suggestions: array of strings`;

      const systemPrompt = `You are a music director expert for video production. Suggest appropriate music for scenes based on mood, tone, and style. Always respond with valid JSON only, no markdown formatting.`;

      const response = await this.callCopilotAPI(prompt, systemPrompt);

      if (!response) {
        return this.generateDefaultAudio(sceneDescription, context);
      }

      try {
        const cleanedJson = response
          .replace(/```json\n?|\n?```/g, "")
          .replace(/```\n?|\n?```/g, "");
        return JSON.parse(cleanedJson);
      } catch {
        log("Failed to parse audio suggestion JSON", "orchestrator");
        return this.generateDefaultAudio(sceneDescription, context);
      }
    } catch (error) {
      log(`Audio suggestion error: ${error}`, "orchestrator");
      return this.generateDefaultAudio(sceneDescription, context);
    }
  }

  private generateDefaultAudio(
    sceneDescription: string,
    context: OrchestrationContext
  ): { musicGenre: string; bpm: number; mood: string; suggestions: string[] } {
    const lowerScene = sceneDescription.toLowerCase();

    if (
      lowerScene.includes("action") ||
      lowerScene.includes("fight") ||
      lowerScene.includes("intense")
    ) {
      return {
        musicGenre: "Electronic/Action",
        bpm: 140,
        mood: "Intense and adrenaline-pumping",
        suggestions: [
          "Aggressive electronic beat with heavy bass",
          "Pulsing synth with percussion",
          "High-energy action strings",
        ],
      };
    } else if (
      lowerScene.includes("romantic") ||
      lowerScene.includes("love") ||
      lowerScene.includes("emotional")
    ) {
      return {
        musicGenre: "Orchestral/Romantic",
        bpm: 90,
        mood: "Emotional and intimate",
        suggestions: [
          "Soft orchestral strings",
          "Gentle piano melody",
          "Ambient emotional underscore",
        ],
      };
    } else if (lowerScene.includes("comedy") || lowerScene.includes("funny")) {
      return {
        musicGenre: "Upbeat/Comedic",
        bpm: 120,
        mood: "Playful and entertaining",
        suggestions: [
          "Quirky ukulele and percussion",
          "Bouncy pop-style track",
          "Playful orchestral cue",
        ],
      };
    } else {
      return {
        musicGenre: "Cinematic",
        bpm: 120,
        mood: "Professional and engaging",
        suggestions: [
          "Cinematic background score",
          "Ambient underscore",
          "Dynamic theme music",
        ],
      };
    }
  }

  /**
   * Build context string from context object
   */
  private buildContextString(context: OrchestrationContext): string {
    const parts = [];
    if (context.genre) parts.push(`Genre: ${context.genre}`);
    if (context.tone) parts.push(`Tone: ${context.tone}`);
    if (context.targetAudience)
      parts.push(`Target Audience: ${context.targetAudience}`);
    if (context.style) parts.push(`Style: ${context.style}`);
    if (context.quality) parts.push(`Quality Level: ${context.quality}`);
    if (context.projectId) parts.push(`Project ID: ${context.projectId}`);
    if (context.episodeId) parts.push(`Episode ID: ${context.episodeId}`);

    return parts.length > 0 ? parts.join(", ") : "No specific context";
  }

  /**
   * Get default generation plan
   */
  private getDefaultPlan(): GenerationPlan {
    return {
      scenes: [
        {
          sceneNumber: 1,
          duration: 5,
          description: "Establishing shot and introduction",
          visuals: "Wide establishing shot with dynamic composition",
          cameraWork: "Slow pan across landscape",
          lighting: "Golden hour cinematic lighting",
        },
        {
          sceneNumber: 2,
          duration: 10,
          description: "Main content",
          visuals: "Close-up character shots with dynamic cuts",
          cameraWork: "Dynamic camera movement following action",
          lighting: "Key and fill lighting for character",
        },
        {
          sceneNumber: 3,
          duration: 5,
          description: "Conclusion and call-to-action",
          visuals: "Wide shot with text overlay",
          cameraWork: "Static camera with zoom effect",
          lighting: "Consistent cinematic lighting",
        },
      ],
      voiceover: {
        characterVoices: [
          {
            name: "Narrator",
            tone: "Professional",
            personality: "Authoritative and engaging",
          },
        ],
        narratorStyle: "Professional documentary style",
        musicBed: "Subtle cinematic underscore",
      },
      music: {
        primaryGenre: "Cinematic",
        bpm: 120,
        mood: "Inspiring and dramatic",
        variations: ["Intro theme", "Main theme", "Outro theme"],
      },
      effects: {
        transitions: ["Fade", "Dissolve", "Cross-fade"],
        vfx: ["Color correction", "Dynamic text overlays"],
        colorGrading: "Cinematic color grade with warm tones",
        filterStyle: "Subtle film grain and lens flare",
      },
      estimatedDuration: 20,
    };
  }
}

// Export singleton instance
export const aiOrchestrator = new AIOrchestrator();
