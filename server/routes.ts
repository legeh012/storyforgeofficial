import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import multer from "multer";
import path from "path";
import fs from "fs";
import { storage } from "./storage";
import { getEpisodeGenerator } from "./episode-generator";
import { copilotAuth, checkCopilotAvailability } from "./copilot-auth";
import { log } from "./index";
import {
  insertProjectSchema,
  insertJobSchema,
  insertAssetSchema,
  insertCharacterSchema,
  insertEpisodeSchema,
  insertSceneSchema,
  insertDialogueSchema,
  insertScriptSchema,
  insertAudienceReactionSchema,
} from "@shared/schema";
import OpenAI from "openai";
import { videoGenerationService } from "./video-generation-service";
import { aiOrchestrator } from "./ai-orchestrator";

// Screenplay parser
function parseScreenplay(content: string) {
  const scenes: Array<{
    sceneNumber: number;
    heading?: string;
    description?: string;
    dialogueLines?: any[];
  }> = [];
  let currentScene: any = { sceneNumber: 1, dialogueLines: [] };
  const lines = content.split("\n");

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.match(/^INT\.|^EXT\./)) {
      if (currentScene.dialogueLines && currentScene.dialogueLines.length > 0) {
        scenes.push(currentScene);
      }
      currentScene = {
        sceneNumber: scenes.length + 1,
        heading: trimmed,
        dialogueLines: [],
      };
    } else if (trimmed && currentScene) {
      currentScene.dialogueLines?.push({
        text: trimmed,
        character: "Unknown",
      });
    }
  }
  if (currentScene.dialogueLines && currentScene.dialogueLines.length > 0) {
    scenes.push(currentScene);
  }
  return { scenes };
}

// Ollama integration helpers
async function checkOllamaStatus(): Promise<boolean> {
  try {
    const response = await fetch(
      process.env.OLLAMA_URL || "http://localhost:11434"
    );
    return response.ok;
  } catch {
    return false;
  }
}

async function getOllamaModels(): Promise<string[]> {
  try {
    const response = await fetch(
      `${process.env.OLLAMA_URL || "http://localhost:11434"}/api/tags`
    );
    if (!response.ok) return [];
    const data = (await response.json()) as {
      models?: Array<{ name: string }>;
    };
    return data.models?.map((m) => m.name) || [];
  } catch {
    return [];
  }
}

async function chatWithOllama(
  message: string,
  _context?: Record<string, unknown>
): Promise<string> {
  try {
    const response = await fetch(
      `${process.env.OLLAMA_URL || "http://localhost:11434"}/api/generate`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "llama2",
          prompt: message,
          stream: false,
        }),
      }
    );
    if (!response.ok) return generateFallbackResponse(message, _context);
    const data = (await response.json()) as { response?: string };
    return data.response || generateFallbackResponse(message, _context);
  } catch {
    return generateFallbackResponse(message, _context);
  }
}

function generateFallbackResponse(
  _message: string,
  context?: Record<string, unknown>
): string {
  const view = context?.currentView;
  const responses: Record<string, string[]> = {
    console: [
      "That's a great idea! Let me help you develop that scene further.",
      "Interesting perspective. Let's brainstorm how this could play out in the narrative.",
      "I love the direction you're thinking. Here's how we could expand on that...",
    ],
    editor: [
      "The script structure is solid. Consider adding more character development.",
      "This dialogue feels authentic. Let's ensure it matches the tone of the episode.",
      "Great scene setup. You might want to add more environmental details.",
    ],
  };
  const pool = responses[view as string] || responses.console;
  return (
    pool[Math.floor(Math.random() * pool.length)] ||
    "That's interesting. Tell me more!"
  );
}

// Use local storage path from environment or default to project uploads folder
const uploadsDir =
  process.env.UPLOADS_DIR || path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const multerStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});

const upload = multer({
  storage: multerStorage,
  limits: { fileSize: 100 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp|mp4|webm|mov|mp3|wav|ogg/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error("Only image, video, and audio files are allowed"));
    }
  },
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Projects
  app.get("/api/projects", async (_req, res) => {
    try {
      const projects = await storage.getProjects();
      res.json(projects);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch projects" });
    }
  });

  app.get("/api/projects/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const project = await storage.getProject(id);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      res.json(project);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch project" });
    }
  });

  app.post("/api/projects", async (req, res) => {
    try {
      const data = insertProjectSchema.parse(req.body);
      const project = await storage.createProject(data);
      res.status(201).json(project);
    } catch (error) {
      res.status(400).json({ error: "Invalid project data" });
    }
  });

  app.patch("/api/projects/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const project = await storage.updateProject(id, req.body);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      res.json(project);
    } catch (error) {
      res.status(400).json({ error: "Failed to update project" });
    }
  });

  // Jobs
  app.get("/api/jobs", async (req, res) => {
    try {
      const projectId = req.query.projectId
        ? parseInt(req.query.projectId as string)
        : undefined;
      const jobs = await storage.getJobs(projectId);
      res.json(jobs);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch jobs" });
    }
  });

  app.get("/api/jobs/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const job = await storage.getJob(id);
      if (!job) {
        return res.status(404).json({ error: "Job not found" });
      }
      res.json(job);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch job" });
    }
  });

  app.post("/api/jobs", async (req, res) => {
    try {
      const data = insertJobSchema.parse(req.body);
      const job = await storage.createJob(data);
      res.status(201).json(job);
    } catch (error) {
      res.status(400).json({ error: "Invalid job data" });
    }
  });

  app.patch("/api/jobs/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const job = await storage.updateJob(id, req.body);
      if (!job) {
        return res.status(404).json({ error: "Job not found" });
      }
      res.json(job);
    } catch (error) {
      res.status(400).json({ error: "Failed to update job" });
    }
  });

  // Assets
  app.get("/api/assets", async (req, res) => {
    try {
      const projectId = req.query.projectId
        ? parseInt(req.query.projectId as string)
        : undefined;
      const assets = await storage.getAssets(projectId);
      res.json(assets);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch assets" });
    }
  });

  app.post("/api/assets", async (req, res) => {
    try {
      const data = insertAssetSchema.parse(req.body);
      const asset = await storage.createAsset(data);
      res.status(201).json(asset);
    } catch (error) {
      res.status(400).json({ error: "Invalid asset data" });
    }
  });

  // File upload endpoint for assets
  app.post("/api/assets/upload", upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const file = req.file;
      const mimeType = file.mimetype;
      let assetType: "video" | "image" | "audio" = "image";

      if (mimeType.startsWith("video/")) {
        assetType = "video";
      } else if (mimeType.startsWith("audio/")) {
        assetType = "audio";
      }

      const projectId = req.body.projectId
        ? parseInt(req.body.projectId)
        : undefined;

      const asset = await storage.createAsset({
        name: file.originalname,
        type: assetType,
        url: `/uploads/${file.filename}`,
        projectId,
        metadata: {
          size: file.size,
          mimeType: file.mimetype,
          originalName: file.originalname,
        },
      });

      res.status(201).json(asset);
    } catch (error) {
      console.error("Upload error: - routes.ts:214", error);
      res.status(500).json({ error: "Failed to upload file" });
    }
  });

  // Multi-file upload endpoint
  app.post(
    "/api/assets/upload-multiple",
    upload.array("files", 10),
    async (req, res) => {
      try {
        const files = req.files as Express.Multer.File[];
        if (!files || files.length === 0) {
          return res.status(400).json({ error: "No files uploaded" });
        }

        const projectId = req.body.projectId
          ? parseInt(req.body.projectId)
          : undefined;
        const uploadedAssets = [];

        for (const file of files) {
          const mimeType = file.mimetype;
          let assetType: "video" | "image" | "audio" = "image";

          if (mimeType.startsWith("video/")) {
            assetType = "video";
          } else if (mimeType.startsWith("audio/")) {
            assetType = "audio";
          }

          const asset = await storage.createAsset({
            name: file.originalname,
            type: assetType,
            url: `/uploads/${file.filename}`,
            projectId,
            metadata: {
              size: file.size,
              mimeType: file.mimetype,
              originalName: file.originalname,
            },
          });

          uploadedAssets.push(asset);
        }

        res.status(201).json(uploadedAssets);
      } catch (error) {
        console.error("Upload error: - routes.ts:262", error);
        res.status(500).json({ error: "Failed to upload files" });
      }
    }
  );

  // Serve uploaded files
  app.use("/uploads", (req, res, next) => {
    const filePath = path.join(uploadsDir, req.path);
    if (fs.existsSync(filePath)) {
      res.sendFile(filePath);
    } else {
      next();
    }
  });

  // Characters
  app.get("/api/characters", async (req, res) => {
    try {
      const projectId = req.query.projectId
        ? parseInt(req.query.projectId as string)
        : undefined;
      const characters = await storage.getCharacters(projectId);
      res.json(characters);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch characters" });
    }
  });

  app.get("/api/characters/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const character = await storage.getCharacter(id);
      if (!character) {
        return res.status(404).json({ error: "Character not found" });
      }
      res.json(character);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch character" });
    }
  });

  app.post("/api/characters", async (req, res) => {
    try {
      const data = insertCharacterSchema.parse(req.body);
      const character = await storage.createCharacter(data);
      res.status(201).json(character);
    } catch (error) {
      res.status(400).json({ error: "Invalid character data" });
    }
  });

  app.patch("/api/characters/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const character = await storage.updateCharacter(id, req.body);
      if (!character) {
        return res.status(404).json({ error: "Character not found" });
      }
      res.json(character);
    } catch (error) {
      res.status(400).json({ error: "Failed to update character" });
    }
  });

  app.delete("/api/characters/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteCharacter(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete character" });
    }
  });

  // Episodes
  app.get("/api/episodes", async (req, res) => {
    try {
      const projectId = req.query.projectId
        ? parseInt(req.query.projectId as string)
        : undefined;
      const episodes = await storage.getEpisodes(projectId);
      res.json(episodes);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch episodes" });
    }
  });

  app.get("/api/episodes/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const episode = await storage.getEpisode(id);
      if (!episode) {
        return res.status(404).json({ error: "Episode not found" });
      }
      res.json(episode);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch episode" });
    }
  });

  app.post("/api/episodes", async (req, res) => {
    try {
      const data = insertEpisodeSchema.parse(req.body);
      const episode = await storage.createEpisode(data);
      res.status(201).json(episode);
    } catch (error) {
      res.status(400).json({ error: "Invalid episode data" });
    }
  });

  app.patch("/api/episodes/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const episode = await storage.updateEpisode(id, req.body);
      if (!episode) {
        return res.status(404).json({ error: "Episode not found" });
      }
      res.json(episode);
    } catch (error) {
      res.status(400).json({ error: "Failed to update episode" });
    }
  });

  // Scenes
  app.get("/api/episodes/:episodeId/scenes", async (req, res) => {
    try {
      const episodeId = parseInt(req.params.episodeId);
      const scenes = await storage.getScenes(episodeId);
      res.json(scenes);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch scenes" });
    }
  });

  app.post("/api/scenes", async (req, res) => {
    try {
      const data = insertSceneSchema.parse(req.body);
      const scene = await storage.createScene(data);
      res.status(201).json(scene);
    } catch (error) {
      res.status(400).json({ error: "Invalid scene data" });
    }
  });

  app.patch("/api/scenes/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const scene = await storage.updateScene(id, req.body);
      if (!scene) {
        return res.status(404).json({ error: "Scene not found" });
      }
      res.json(scene);
    } catch (error) {
      res.status(400).json({ error: "Failed to update scene" });
    }
  });

  // Dialogue
  app.get("/api/scenes/:sceneId/dialogue", async (req, res) => {
    try {
      const sceneId = parseInt(req.params.sceneId);
      const lines = await storage.getDialogue(sceneId);
      res.json(lines);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch dialogue" });
    }
  });

  app.post("/api/dialogue", async (req, res) => {
    try {
      const data = insertDialogueSchema.parse(req.body);
      const line = await storage.createDialogue(data);
      res.status(201).json(line);
    } catch (error) {
      res.status(400).json({ error: "Invalid dialogue data" });
    }
  });

  // Scripts
  app.get("/api/scripts", async (req, res) => {
    try {
      const projectId = req.query.projectId
        ? parseInt(req.query.projectId as string)
        : undefined;
      const scripts = await storage.getScripts(projectId);
      res.json(scripts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch scripts" });
    }
  });

  app.get("/api/scripts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const script = await storage.getScript(id);
      if (!script) {
        return res.status(404).json({ error: "Script not found" });
      }
      res.json(script);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch script" });
    }
  });

  app.post("/api/scripts", async (req, res) => {
    try {
      const data = insertScriptSchema.parse(req.body);
      const script = await storage.createScript(data);
      res.status(201).json(script);
    } catch (error) {
      res.status(400).json({ error: "Invalid script data" });
    }
  });

  // Upload script file endpoint - accepts .txt, .md, .fountain, .fdx files
  app.post("/api/scripts/upload", upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const file = req.file;
      const supportedExtensions = [".txt", ".md", ".fountain", ".fdx"];
      const fileExt = file.originalname
        .substring(file.originalname.lastIndexOf("."))
        .toLowerCase();

      if (!supportedExtensions.includes(fileExt)) {
        return res.status(400).json({
          error: `Unsupported file type. Supported: ${supportedExtensions.join(
            ", "
          )}`,
        });
      }

      const projectId = req.body.projectId
        ? parseInt(req.body.projectId)
        : undefined;

      // Read file content
      const content = fs.readFileSync(file.path, "utf-8");

      // Create script in database
      const script = await storage.createScript({
        title: file.originalname.replace(fileExt, ""),
        format: fileExt === ".fountain" ? "fountain" : "screenplay",
        content,
        projectId,
        status: "uploaded",
      });

      // Clean up uploaded file
      fs.unlinkSync(file.path);

      res.status(201).json({
        ...script,
        message:
          "Script uploaded successfully. Use /api/scripts/:id/parse to process it.",
      });
    } catch (error) {
      console.error("Script upload error:", error);
      res.status(500).json({ error: "Failed to upload script file" });
    }
  });

  app.patch("/api/scripts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const script = await storage.updateScript(id, req.body);
      if (!script) {
        return res.status(404).json({ error: "Script not found" });
      }
      res.json(script);
    } catch (error) {
      res.status(400).json({ error: "Failed to update script" });
    }
  });

  // Parse script endpoint - converts raw screenplay to structured data and persists scenes/dialogue
  app.post("/api/scripts/:id/parse", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const script = await storage.getScript(id);

      if (!script) {
        return res.status(404).json({ error: "Script not found" });
      }

      // Simple screenplay parser
      const parsedData = parseScreenplay(script.content);

      // Create a draft episode from the script (if projectId exists)
      let episodeId: number | null = null;
      if (script.projectId) {
        const episode = await storage.createEpisode({
          projectId: script.projectId,
          title: script.title,
          synopsis: `Generated from script: ${script.title}`,
          episodeNumber: 1,
          status: "draft",
        });
        episodeId = episode.id;

        // Persist scenes and dialogue to database
        for (const sceneData of parsedData.scenes) {
          const scene = await storage.createScene({
            episodeId: episode.id,
            sceneNumber: sceneData.sceneNumber,
            location: sceneData.heading || "",
            timeOfDay: "unknown",
            description: sceneData.description || sceneData.heading,
            status: "pending",
          });

          // Persist dialogue for each scene
          if (sceneData.dialogueLines && sceneData.dialogueLines.length > 0) {
            for (const line of sceneData.dialogueLines) {
              await storage.createDialogue({
                sceneId: scene.id,
                characterName: line.character,
                text: line.text,
                lineNumber: sceneData.dialogueLines.indexOf(line) + 1,
              });
            }
          }
        }
      }

      const updated = await storage.updateScript(id, {
        parsedData: { ...parsedData, episodeId },
        status: "parsed",
      });

      res.json(updated);
    } catch (error) {
      console.error("Parse error: - routes.ts:547", error);
      res.status(500).json({ error: "Failed to parse script" });
    }
  });

  // Audience Reactions
  app.get("/api/reactions", async (req, res) => {
    try {
      const episodeId = req.query.episodeId
        ? parseInt(req.query.episodeId as string)
        : undefined;
      const reactions = await storage.getReactions(episodeId);
      res.json(reactions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch reactions" });
    }
  });

  app.post("/api/reactions", async (req, res) => {
    try {
      const data = insertAudienceReactionSchema.parse(req.body);
      const reaction = await storage.createReaction(data);
      res.status(201).json(reaction);
    } catch (error) {
      res.status(400).json({ error: "Invalid reaction data" });
    }
  });

  // GodTierBot AI Assistant Routes (OpenAI powered)
  // the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
  const openai = process.env.OPENAI_API_KEY
    ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    : null;

  app.get("/api/godtierbot/status", async (_req, res) => {
    try {
      const available = !!process.env.OPENAI_API_KEY;
      res.json({ available, model: "gpt-5" });
    } catch (error) {
      res.json({ available: false });
    }
  });

  app.post("/api/godtierbot/chat", async (req, res) => {
    try {
      const { message, history = [], context } = req.body;

      if (!message) {
        return res.status(400).json({ error: "Message is required" });
      }

      // Build rich system prompt with show knowledge
      const systemPrompt = `You are GodTierBot, an elite AI creative copilot for Ratchet Infinite Creation - an autonomous video production platform. You're assisting with the production of "Say Wallahi: Minneapolis."

SHOW CONTEXT:
Say Wallahi: Minneapolis is a chaotic, drama-filled reality series following 7 WEALTHY Somali-American women in Minneapolis. These queens are RICH, powerful, successful businesswomen living luxury lifestyles with designer fashion and high society status.

CAST MEMBERS (all wealthy businesswomen):
1. Lucky (DJLuckLuck) - The Architect. Afrobeats artist, chaos orchestrator. Voice: Commanding, visionary, slow deliberate delivery that detonates. Tagline: "Architect voice — calm until it cuts like glass"
2. Luul - The Legacy Queen. Fashion empire owner, ancestral fire. Voice: Regal, grounded, ceremonial pauses. Tagline: "Legacy voice — fire wrapped in velvet"
3. Amal - The Glam Villain. Sharp, sarcastic, brings the drama. Voice: Venomous, mocking, fast pivots. Tagline: "Chaos voice — stylish, mocking, unforgettable"
4. Zahra - The Satirist. Attorney who weaponizes humor. Voice: Witty, courtroom-sharp, crisp. Tagline: "Satire voice — humor weaponized as law"
5. Nasra - The Emotional Magnet. Vulnerable, at center of cheating scandal. Voice: Soft, trembling, hesitant. Tagline: "Emotional voice — fragile but magnetic"
6. Hani - The Trauma Mapper. Analytical, prophetic. Voice: Haunting, empathetic, slow mapping. Tagline: "Trauma voice — quiet, prophetic, foreshadowing"
7. Ayaan - The Schema Poet. Meta narrator, philosophical overlays. Voice: Poetic, detached, glitch pauses. Tagline: "Overlay voice — meta, haunting, almost robotic poetry"

SEASON 1 STRUCTURE:
- 8 episodes total
- Episode 2 "Couture on Fire" uses flash-forward technique (appears as Ep 2 but is actually the season climax)
- Major conflicts: cheating scandal, fraud investigation, deportation rumors

SHOW TONE: Maximum drama, luxury lifestyle, designer everything. "Chaotic, Funny, Messy, Addictive"

YOUR CAPABILITIES:
- Write dramatic scenes and dialogue in each character's unique voice
- Develop character arcs and conflicts
- Create episode outlines with minute-by-minute breakdowns
- Suggest viral moments and jaw-drop scenes
- Help with confessional content
- Brainstorm drama escalation
- Write monologues and confrontation dialogue

CONVERSATION STYLE:
- Be conversational and engaging like ChatGPT
- Ask follow-up questions to understand what the user needs
- Offer creative suggestions and alternatives
- Reference specific cast members and their dynamics
- Be enthusiastic about the show's potential
- Give detailed, rich responses - not one-liners
- Use the show's dramatic language when appropriate

Current view: ${context?.currentView || "console"}`;

      // Build messages array with history
      const messages = [
        { role: "system", content: systemPrompt },
        ...history.slice(-10).map((h: { role: string; content: string }) => ({
          role: h.role,
          content: h.content,
        })),
        { role: "user", content: message },
      ];

      // Try Copilot first, then OpenAI as fallback
      let response: string | null = null;
      let source = "copilot";

      // Try Copilot API
      if (copilotAuth.isAvailable()) {
        try {
          const apiKey = copilotAuth.getApiKey();
          if (apiKey && !apiKey.startsWith("your-")) {
            const copilotResponse = await fetch(
              "https://api.githubcopilot.com/v1/chat/completions",
              {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${apiKey}`,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  model: "gpt-4-turbo",
                  temperature: 0.8,
                  messages: messages.map((m) => ({
                    role: m.role,
                    content: m.content,
                  })),
                  max_tokens: 2048,
                }),
              }
            );

            if (copilotResponse.ok) {
              const data = await copilotResponse.json();
              response = data.choices?.[0]?.message?.content || null;
              source = "copilot";
            }
          }
        } catch (error) {
          log(`Copilot fallback error: ${error}`, "godtierbot");
        }
      }

      // Fallback to OpenAI if Copilot failed
      if (!response && openai) {
        try {
          const completion = await openai.chat.completions.create({
            model: "gpt-4",
            messages: messages.map((m) => ({
              role: m.role as "system" | "user" | "assistant",
              content: m.content,
            })),
            max_completion_tokens: 2048,
          });

          response =
            completion.choices[0]?.message?.content ||
            "I couldn't generate a response. Please try again.";
          source = "openai";
        } catch (error: any) {
          log(`OpenAI fallback error: ${error.message}`, "godtierbot");
        }
      }

      // Return response or error
      if (!response) {
        return res.status(503).json({
          error: "AI service unavailable",
          response:
            "I'm currently unable to process your request. Please try again in a moment.",
        });
      }

      res.json({ response, source });
    } catch (error: any) {
      log(`GodTierBot error: ${error.message || error}`, "godtierbot");
      res.status(500).json({
        error: "Failed to process chat request",
        response: `I encountered an error: ${
          error.message || "Unknown error"
        }. Please try again.`,
      });
    }
  });

  // Legacy Lucky AI Assistant Routes (keeping for backward compatibility)
  app.get("/api/lucky/status", async (_req, res) => {
    try {
      // Check if Ollama is running locally
      const ollamaAvailable = await checkOllamaStatus();
      res.json({
        ollamaAvailable,
        models: ollamaAvailable ? await getOllamaModels() : [],
        fallbackAvailable: true,
      });
    } catch (error) {
      res.json({
        ollamaAvailable: false,
        models: [],
        fallbackAvailable: true,
      });
    }
  });

  app.post("/api/lucky/chat", async (req, res) => {
    try {
      const { message, context } = req.body;

      if (!message) {
        return res.status(400).json({ error: "Message is required" });
      }

      // Try Ollama first, fall back to built-in responses
      const ollamaAvailable = await checkOllamaStatus();

      if (ollamaAvailable) {
        try {
          const response = await chatWithOllama(message, context);
          return res.json({ response, source: "ollama" });
        } catch (error) {
          console.error("Ollama error, using fallback: - routes.ts:718", error);
        }
      }

      // Fallback: Smart contextual responses
      const response = generateFallbackResponse(message, context);
      res.json({ response, source: "fallback" });
    } catch (error) {
      res.status(500).json({ error: "Failed to process chat request" });
    }
  });

  // Mock job processing simulation endpoint
  app.post("/api/jobs/:id/process", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const job = await storage.getJob(id);

      if (!job) {
        return res.status(404).json({ error: "Job not found" });
      }

      await storage.updateJob(id, { status: "processing", progress: 0 });

      const progressSteps = [25, 50, 75, 100];
      for (const progress of progressSteps) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        await storage.updateJob(id, {
          status: progress === 100 ? "completed" : "processing",
          progress,
          resultUrl: progress === 100 ? "/mock-result.mp4" : undefined,
        });
      }

      const updatedJob = await storage.getJob(id);
      res.json(updatedJob);
    } catch (error) {
      res.status(500).json({ error: "Failed to process job" });
    }
  });

  // Cultural Chaos Console Endpoint
  app.post("/api/chaos/generate", async (req, res) => {
    try {
      const { projectId, surrealism, nostalgia, chaos, command } = req.body;

      if (!projectId) {
        return res.status(400).json({ error: "projectId is required" });
      }

      // Map chaos console parameters to video generation settings
      const videoParams = {
        qualityLevel: chaos > 70 ? "4K" : chaos > 40 ? "Premium" : "Standard",
        surrealism: Math.round(surrealism),
        nostalgia: Math.round(nostalgia),
        chaosLevel: Math.round(chaos),
        // Effects intensity scales with chaos
        effectsIntensity: chaos > 70 ? "max" : chaos > 40 ? "high" : "medium",
        // Color grading mood
        colorMood:
          nostalgia > 60 ? "vintage" : chaos > 80 ? "psychedelic" : "cinematic",
        // Music style
        musicStyle:
          surrealism > 70
            ? "experimental"
            : nostalgia > 60
            ? "retro"
            : "modern",
        // Pacing speed (chaos affects editing aggressiveness)
        pacingSpeed:
          chaos > 80 ? "frantic" : chaos > 40 ? "dynamic" : "measured",
      };

      if (!openai) {
        return res.status(400).json({
          error: "OpenAI API key not configured",
          message: "Cultural Chaos Console requires OPENAI_API_KEY to be set",
        });
      }

      // Use GodTierBot to generate content based on chaos parameters
      const systemPrompt = `You are the Cultural Chaos Console AI, part of Ratchet's experimental creative engine. You generate video briefs based on creative parameters:
- Surrealism (0-100): How abstract and dreamlike the content should be
- Nostalgia (0-100): How much retro/vintage aesthetic to incorporate
- Chaos (0-100): How wild, fast-paced, and unpredictable the content should be

You generate creative video briefs that incorporate these parameters. Be visionary and bold.`;

      const userPrompt = `Generate a creative video brief with these parameters:
Surrealism: ${surrealism}% (abstract, dreamlike, psychedelic)
Nostalgia: ${nostalgia}% (retro, vintage, throwback)
Chaos: ${chaos}% (wild, unpredictable, fast-paced)
${command ? `User command: "${command}"` : ""}

Create a vivid, actionable video brief that incorporates these parameters.`;

      const completion = await openai.chat.completions.create({
        model: "gpt-5",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        max_completion_tokens: 1024,
      });

      const brief =
        completion.choices[0]?.message?.content || "Failed to generate brief";

      res.json({
        success: true,
        brief,
        parameters: videoParams,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error("Chaos console error: - routes.ts:833", error);
      res.status(500).json({
        error: "Failed to generate chaos console content",
        message: error.message,
      });
    }
  });

  return httpServer;
}

export function registerStoryForgeRoutes(app: Express): void {
  const generator = getEpisodeGenerator();

  /**
   * POST /api/storyforge/generate-episode
   * Generate a complete episode using StoryForge
   */
  app.post("/api/storyforge/generate-episode", async (req, res) => {
    try {
      const { projectId, themePrompt } = req.body;

      if (!projectId || !themePrompt) {
        return res.status(400).json({
          error: "Missing required fields: projectId, themePrompt",
        });
      }

      // Get next episode number
      const episodes = await storage.getEpisodes(projectId);
      const nextEpisodeNumber =
        Math.max(...episodes.map((e) => e.episodeNumber || 0), 0) + 1;

      // Start generation (non-blocking)
      res.status(202).json({
        message: "Episode generation started",
        episodeNumber: nextEpisodeNumber,
        status: "generating",
      });

      // Generate in background
      generator
        .generateCompleteEpisode(projectId, nextEpisodeNumber, themePrompt)
        .catch((error) => {
          console.error("[StoryForge] Generation error:", error);
        });
    } catch (error) {
      res.status(500).json({ error: "Failed to start episode generation" });
    }
  });

  /**
   * POST /api/storyforge/generate-episode-from-feedback
   * Generate next episode based on audience feedback
   */
  app.post(
    "/api/storyforge/generate-episode-from-feedback",
    async (req, res) => {
      try {
        const { projectId } = req.body;

        if (!projectId) {
          return res
            .status(400)
            .json({ error: "Missing required field: projectId" });
        }

        // Start generation (non-blocking)
        res.status(202).json({
          message: "Feedback-driven episode generation started",
          status: "analyzing",
        });

        // Generate in background
        generator.generateEpisodeBasedOnFeedback(projectId).catch((error) => {
          console.error("[StoryForge] Feedback generation error:", error);
        });
      } catch (error) {
        res
          .status(500)
          .json({ error: "Failed to start feedback-driven generation" });
      }
    }
  );

  /**
   * POST /api/storyforge/configure
   * Configure auto-generation settings
   */
  app.post("/api/storyforge/configure", async (req, res) => {
    try {
      const {
        projectId,
        generationMode,
        characterIds,
        themeRotation,
        episodeTargetCount,
        autoPublish,
        feedbackIntegration,
      } = req.body;

      generator.setConfiguration({
        projectId,
        generationMode,
        characterIds,
        themeRotation,
        episodeTargetCount,
        autoPublish,
        feedbackIntegration,
      });

      // Store config in project metadata
      const project = await storage.getProject(projectId);
      if (project) {
        const existingMetadata =
          typeof project.metadata === "object" ? project.metadata : {};
        await storage.updateProject(projectId, {
          metadata: {
            ...existingMetadata,
            storyForgeConfig: {
              generationMode,
              characterIds,
              themeRotation,
              episodeTargetCount,
              autoPublish,
              feedbackIntegration,
              configuredAt: new Date().toISOString(),
            },
          },
        });
      }

      res.json({
        message: "StoryForge configuration updated",
        config: {
          generationMode,
          characterIds,
          themeRotation,
          episodeTargetCount,
          autoPublish,
          feedbackIntegration,
        },
      });
    } catch (error) {
      res.status(400).json({ error: "Failed to configure StoryForge" });
    }
  });

  /**
   * GET /api/storyforge/status/:projectId
   * Get StoryForge generation status
   */
  app.get("/api/storyforge/status/:projectId", async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const project = await storage.getProject(projectId);

      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }

      const episodes = await storage.getEpisodes(projectId);
      const latestEpisode = episodes.sort(
        (a, b) => (b.episodeNumber || 0) - (a.episodeNumber || 0)
      )[0];

      res.json({
        projectName: project.name,
        totalEpisodes: episodes.length,
        latestEpisode: latestEpisode
          ? {
              episodeNumber: latestEpisode.episodeNumber,
              title: latestEpisode.title,
              status: latestEpisode.status,
              generatedAt: latestEpisode.createdAt,
            }
          : null,
        config: (project.metadata as any)?.storyForgeConfig,
        readyForAutogeneration:
          episodes.length > 0 &&
          (await storage.getCharacters(projectId)).length > 0,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch status" });
    }
  });

  /**
   * GET /api/storyforge/character-continuity/:projectId
   * Get character continuity analysis across episodes
   */
  app.get(
    "/api/storyforge/character-continuity/:projectId",
    async (req, res) => {
      try {
        const projectId = parseInt(req.params.projectId);
        const characters = await storage.getCharacters(projectId);
        const episodes = await storage.getEpisodes(projectId);

        const continuity = await Promise.all(
          characters.map(async (character) => {
            const scenes = [];
            for (const episode of episodes) {
              const episodeScenes = await storage.getScenes(episode.id);
              for (const scene of episodeScenes) {
                const dialogue = await storage.getDialogue(scene.id);
                if (dialogue.some((d) => d.characterId === character.id)) {
                  scenes.push({
                    episodeNumber: episode.episodeNumber,
                    sceneNumber: scene.sceneNumber,
                    location: scene.location,
                    emotionalBeat: scene.emotionalBeat,
                  });
                }
              }
            }

            return {
              characterId: character.id,
              characterName: character.name,
              role: character.role,
              appearanceCount: scenes.length,
              progressionArc: scenes.map((s) => ({
                episode: s.episodeNumber,
                scene: s.sceneNumber,
                emotionalBeat: s.emotionalBeat,
              })),
            };
          })
        );

        res.json(continuity);
      } catch (error) {
        res.status(500).json({ error: "Failed to fetch character continuity" });
      }
    }
  );

  // ==================== BOT MANAGEMENT ROUTES ====================

  // Start autonomous bot for a project
  app.post("/api/bot/start", async (req, res) => {
    try {
      const { projectId, automationLevel, generationInterval, dailyLimit } =
        req.body;

      if (!projectId) {
        res.status(400).json({ error: "projectId is required" });
        return;
      }

      const { createAndStartBot } = await import("./bot-manager");
      const bot = await createAndStartBot(projectId, {
        automationLevel: automationLevel || "assisted",
        generationInterval: generationInterval || 3600000, // 1 hour default
        dailyLimit: dailyLimit || 5,
        videoQuality: "standard",
        autoPublish: false,
        feedbackThresholds: {
          positiveReactionThreshold: 0.8,
          negativeReactionThreshold: 0.2,
          engagementThreshold: 100,
        },
      });

      res.json({
        botId: bot.getBotId(),
        projectId,
        status: "started",
        message: "Bot initialized and started",
      });
    } catch (error) {
      console.error("Failed to start bot: - routes.ts:1111", error);
      res.status(500).json({ error: "Failed to start bot" });
    }
  });

  // Stop autonomous bot
  app.post("/api/bot/:projectId/stop", async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const { getBot, stopBot } = await import("./bot-manager");
      const botExists = getBot(projectId);

      if (!botExists) {
        res.status(404).json({ error: "Bot not found for this project" });
        return;
      }

      stopBot(projectId);

      res.json({
        projectId,
        status: "stopped",
        message: "Bot stopped successfully",
      });
    } catch (error) {
      console.error("Failed to stop bot: - routes.ts:1136", error);
      res.status(500).json({ error: "Failed to stop bot" });
    }
  });

  // Get bot status
  app.get("/api/bot/:projectId/status", async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const { getBot } = await import("./bot-manager");
      const bot = getBot(projectId);

      if (!bot) {
        res.status(404).json({ error: "No active bot for this project" });
        return;
      }

      const status = bot.getStatus();
      res.json(status);
    } catch (error) {
      console.error("Failed to fetch bot status: - routes.ts:1156", error);
      res.status(500).json({ error: "Failed to fetch bot status" });
    }
  });

  // Get bot decision history
  app.get("/api/bot/:projectId/decisions", async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const { getBot } = await import("./bot-manager");
      const bot = getBot(projectId);

      if (!bot) {
        res.status(404).json({ error: "No active bot for this project" });
        return;
      }

      const decisions = bot.getDecisionHistory();
      res.json(decisions);
    } catch (error) {
      console.error("Failed to fetch decision history:", error);
      res.status(500).json({ error: "Failed to fetch decision history" });
    }
  });

  // ==================== VIDEO PROCESSING ROUTES ====================

  // Queue episode for video generation
  app.post("/api/video/generate", async (req, res) => {
    try {
      const { episodeId, quality, resolution } = req.body;

      if (!episodeId) {
        res.status(400).json({ error: "episodeId is required" });
        return;
      }

      const episode = await storage.getEpisode(episodeId);
      if (!episode) {
        res.status(404).json({ error: "Episode not found" });
        return;
      }

      const { getVideoProcessor } = await import("./bot-video-processor");
      const processor = getVideoProcessor();

      const jobId = await processor.queueEpisodeForVideoGeneration(episode, {
        quality: quality || "standard",
        resolution: resolution || "1080p",
        fps: 30,
        codec: "h264",
        autoUpscale: true,
        watermark: false,
      });

      res.status(202).json({
        jobId,
        episodeId,
        status: "queued",
        message: "Video generation job queued",
      });
    } catch (error) {
      console.error("Failed to queue video generation:", error);
      res.status(500).json({ error: "Failed to queue video generation" });
    }
  });

  // Get video job status
  app.get("/api/video/:jobId/status", async (req, res) => {
    try {
      const { getVideoProcessor } = await import("./bot-video-processor");
      const processor = getVideoProcessor();
      const job = processor.getJobStatus(req.params.jobId);

      if (!job) {
        res.status(404).json({ error: "Video job not found" });
        return;
      }

      res.json(job);
    } catch (error) {
      console.error("Failed to fetch video job status:", error);
      res.status(500).json({ error: "Failed to fetch video job status" });
    }
  });

  // Get video processing stats
  app.get("/api/video/processor/stats", async (req, res) => {
    try {
      const { getVideoProcessor } = await import("./bot-video-processor");
      const processor = getVideoProcessor();
      const stats = processor.getStats();

      res.json(stats);
    } catch (error) {
      console.error("Failed to fetch video processor stats:", error);
      res.status(500).json({ error: "Failed to fetch video processor stats" });
    }
  });

  // Cancel video job
  app.delete("/api/video/:jobId", async (req, res) => {
    try {
      const { getVideoProcessor } = await import("./bot-video-processor");
      const processor = getVideoProcessor();
      const cancelled = processor.cancelJob(req.params.jobId);

      if (!cancelled) {
        res
          .status(404)
          .json({ error: "Video job not found or already completed" });
        return;
      }

      res.json({
        jobId: req.params.jobId,
        status: "cancelled",
        message: "Video job cancelled successfully",
      });
    } catch (error) {
      console.error("Failed to cancel video job: - routes.ts:1288", error);
      res.status(500).json({ error: "Failed to cancel video job" });
    }
  });

  // Copilot API Integration Routes
  // Check Copilot authentication status
  app.get("/api/copilot/status", async (_req, res) => {
    try {
      const status = copilotAuth.getStatus();
      const isValid = await copilotAuth.validateCredentials();
      res.json({
        available: copilotAuth.isAvailable(),
        isValid,
        config: status,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to check Copilot status" });
    }
  });

  // Copilot authentication verification endpoint
  app.post("/api/copilot/auth/verify", async (req, res) => {
    try {
      const { apiKey } = req.body;
      if (!apiKey) {
        return res.status(400).json({ error: "API key is required" });
      }

      const isValid = apiKey === process.env.COPILOT_API_KEY;
      res.json({
        valid: isValid,
        message: isValid ? "Authentication successful" : "Invalid API key",
      });
    } catch (error) {
      res.status(500).json({ error: "Authentication verification failed" });
    }
  });

  // Copilot-authenticated chat endpoint
  app.post("/api/copilot/chat", async (req, res) => {
    try {
      const { message, projectId, context } = req.body;

      if (!message) {
        return res.status(400).json({ error: "Message is required" });
      }

      if (!process.env.OPENAI_API_KEY) {
        return res.status(400).json({
          error: "OpenAI API key not configured",
          response: "Please set OPENAI_API_KEY environment variable",
        });
      }

      // Initialize OpenAI with Copilot context
      const client = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });

      const response = await client.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `You are Copilot, an advanced AI assistant integrated with the Infinite Creation Engine. 
            You help with video production, character development, episode planning, and creative storytelling.
            ${context ? `Current context: ${JSON.stringify(context)}` : ""}`,
          },
          {
            role: "user",
            content: message,
          },
        ],
        temperature: 0.8,
        max_tokens: 2000,
      });

      const content = response.choices[0]?.message?.content || "";

      res.json({
        response: content,
        source: "copilot",
        model: "gpt-3.5-turbo",
        projectId,
      });
    } catch (error: any) {
      console.error("Copilot chat error: - routes.ts:1368", error);
      res.status(500).json({
        error: "Failed to process Copilot request",
        message: error.message || "Unknown error",
      });
    }
  });

  // Copilot code generation endpoint
  app.post(
    "/api/copilot/generate-code",
    checkCopilotAvailability,
    async (req, res) => {
      try {
        const { prompt, language = "typescript", context } = req.body;

        if (!prompt) {
          return res.status(400).json({ error: "Prompt is required" });
        }

        const client = new OpenAI({
          apiKey: process.env.OPENAI_API_KEY,
        });

        const response = await client.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: `You are a code generation expert for the Infinite Creation Engine project.
            Generate clean, well-documented ${language} code.
            ${context ? `Context: ${JSON.stringify(context)}` : ""}`,
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.7,
          max_tokens: 3000,
        });

        const code = response.choices[0]?.message?.content || "";

        res.json({
          code,
          language,
          source: "copilot",
          prompt,
        });
      } catch (error) {
        console.error("Copilot code generation error: - routes.ts:1416", error);
        res.status(500).json({ error: "Failed to generate code" });
      }
    }
  );

  // Copilot creative writing endpoint
  app.post(
    "/api/copilot/generate-script",
    checkCopilotAvailability,
    async (req, res) => {
      try {
        const { prompt, characters, setting, style = "dramatic" } = req.body;

        if (!prompt) {
          return res.status(400).json({ error: "Prompt is required" });
        }

        const client = new OpenAI({
          apiKey: process.env.OPENAI_API_KEY,
        });

        const systemMessage = `You are a professional screenwriter for the Infinite Creation Engine.
      Write engaging, character-driven scripts in ${style} style.
      ${characters ? `Key characters: ${characters.join(", ")}` : ""}
      ${setting ? `Setting: ${setting}` : ""}`;

        const response = await client.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: systemMessage,
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.85,
          max_tokens: 4000,
        });

        const script = response.choices[0]?.message?.content || "";

        res.json({
          script,
          source: "copilot",
          style,
          model: "gpt-3.5-turbo",
        });
      } catch (error) {
        console.error("Copilot script generation error:", error);
        res.status(500).json({ error: "Failed to generate script" });
      }
    }
  );

  // Replit integration endpoint (for RepliBuildAI merge)
  app.get("/api/replit/status", async (_req, res) => {
    try {
      const replitUrl = process.env.REPLIT_URL || "http://localhost:8081";
      res.json({
        available: true,
        replitUrl,
        source: "replit",
        message: "Replit integration available",
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to check Replit status" });
    }
  });

  // Combined Copilot + Replit endpoint
  app.post(
    "/api/unified/generate",
    checkCopilotAvailability,
    async (req, res) => {
      try {
        const { prompt, type = "all", projectId } = req.body;

        if (!prompt) {
          return res.status(400).json({ error: "Prompt is required" });
        }

        const client = new OpenAI({
          apiKey: process.env.OPENAI_API_KEY,
        });

        let results: any = {};

        if (type === "all" || type === "script") {
          const scriptResponse = await client.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
              {
                role: "system",
                content:
                  "You are a professional screenwriter. Write an engaging script.",
              },
              { role: "user", content: prompt },
            ],
            temperature: 0.85,
            max_tokens: 3000,
          });

          results.script = scriptResponse.choices[0]?.message?.content;
        }

        if (type === "all" || type === "code") {
          const codeResponse = await client.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
              {
                role: "system",
                content:
                  "You are an expert TypeScript developer. Generate production-ready code.",
              },
              { role: "user", content: prompt },
            ],
            temperature: 0.7,
            max_tokens: 2000,
          });

          results.code = codeResponse.choices[0]?.message?.content;
        }

        res.json({
          results,
          source: "copilot+replit",
          model: "gpt-3.5-turbo",
          projectId,
        });
      } catch (error) {
        console.error("Unified generation error: - routes.ts:1553", error);
        res.status(500).json({ error: "Failed to generate content" });
      }
    }
  );

  // ===== VIDEO GENERATION ENDPOINTS =====

  // POST /api/video/generate - Create a new video generation job
  app.post("/api/video/generate", async (req, res) => {
    try {
      const {
        episodeId,
        quality = "standard",
        resolution = "1080p",
      } = req.body;

      if (!episodeId) {
        return res.status(400).json({ error: "episodeId is required" });
      }

      const {
        data: { user },
      } = await checkCopilotAvailability();
      if (!user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const job = videoGenerationService.createJob({
        episodeId,
        quality,
        resolution,
        userId: user.id || "unknown",
      });

      res.json({ jobId: job.jobId });
    } catch (error) {
      console.error("Video generation creation error:", error);
      res.status(500).json({ error: "Failed to create video generation job" });
    }
  });

  // GET /api/video/:jobId/status - Get video generation job status
  app.get("/api/video/:jobId/status", async (req, res) => {
    try {
      const { jobId } = req.params;
      const job = videoGenerationService.getJobStatus(jobId);

      if (!job) {
        return res.status(404).json({ error: "Job not found" });
      }

      res.json({
        jobId: job.jobId,
        episodeId: job.episodeId,
        status: job.status,
        progress: job.progress,
        quality: job.quality,
        resolution: job.resolution,
        startedAt: job.startedAt.toISOString(),
        estimatedCompletionTime: job.estimatedCompletionTime?.toISOString(),
        outputUrl: job.outputUrl,
        errorMessage: job.errorMessage,
      });
    } catch (error) {
      console.error("Video status retrieval error:", error);
      res.status(500).json({ error: "Failed to retrieve video status" });
    }
  });

  // DELETE /api/video/:jobId - Cancel a video generation job
  app.delete("/api/video/:jobId", async (req, res) => {
    try {
      const { jobId } = req.params;
      const cancelled = videoGenerationService.cancelJob(jobId);

      if (!cancelled) {
        return res.status(404).json({ error: "Job not found" });
      }

      res.json({ status: "cancelled" });
    } catch (error) {
      console.error("Video cancellation error:", error);
      res.status(500).json({ error: "Failed to cancel video job" });
    }
  });

  // GET /api/video/processor/stats - Get video processor statistics
  app.get("/api/video/processor/stats", async (req, res) => {
    try {
      const stats = videoGenerationService.getStats();
      res.json(stats);
    } catch (error) {
      console.error("Stats retrieval error:", error);
      res.status(500).json({ error: "Failed to retrieve stats" });
    }
  });

  // ===== AI ORCHESTRATOR ENDPOINTS =====

  // POST /api/orchestrate/understand - AI understands user input and creates plan
  app.post("/api/orchestrate/understand", async (req, res) => {
    try {
      const { userInput, context } = req.body;

      if (!userInput) {
        return res.status(400).json({ error: "userInput is required" });
      }

      const result = await aiOrchestrator.understandUserInput(
        userInput,
        context
      );

      res.json(result);
    } catch (error) {
      console.error("AI orchestration error:", error);
      res.status(500).json({ error: "Failed to process request" });
    }
  });

  // POST /api/orchestrate/script - AI generates a script
  app.post("/api/orchestrate/script", async (req, res) => {
    try {
      const { theme, context } = req.body;

      if (!theme) {
        return res.status(400).json({ error: "theme is required" });
      }

      const script = await aiOrchestrator.generateScript(theme, context || {});

      res.json({ script });
    } catch (error) {
      console.error("Script generation error:", error);
      res.status(500).json({ error: "Failed to generate script" });
    }
  });

  // POST /api/orchestrate/dialogue - AI generates dialogue
  app.post("/api/orchestrate/dialogue", async (req, res) => {
    try {
      const { character, situation, context } = req.body;

      if (!character || !situation) {
        return res
          .status(400)
          .json({ error: "character and situation are required" });
      }

      const dialogue = await aiOrchestrator.generateDialogue(
        character,
        situation,
        context || {}
      );

      res.json({ dialogue });
    } catch (error) {
      console.error("Dialogue generation error:", error);
      res.status(500).json({ error: "Failed to generate dialogue" });
    }
  });

  // POST /api/orchestrate/audio - AI suggests audio/music
  app.post("/api/orchestrate/audio", async (req, res) => {
    try {
      const { sceneDescription, context } = req.body;

      if (!sceneDescription) {
        return res.status(400).json({ error: "sceneDescription is required" });
      }

      const audioSuggestion = await aiOrchestrator.suggestAudio(
        sceneDescription,
        context || {}
      );

      res.json(audioSuggestion);
    } catch (error) {
      console.error("Audio suggestion error:", error);
      res.status(500).json({ error: "Failed to suggest audio" });
    }
  });
}
