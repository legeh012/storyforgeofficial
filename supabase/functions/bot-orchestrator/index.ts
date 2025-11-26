import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Mayza - Singular AI Intelligence with All Capabilities Built-In
interface ConversationContext {
  message: string;
  conversationHistory: any[];
  userGoals: string[];
  activeTopics: string[];
  context: any;
  files?: Array<{ name: string; type: string }>;
}

// Mayza's intelligent response system - ONE unified AI, no routing, no departments
async function generateUnifiedResponse(contextData: ConversationContext): Promise<string> {
  const { message, conversationHistory, userGoals, activeTopics, context, files } = contextData;
  
  const msgLower = message.toLowerCase();
  const words = msgLower.split(/\s+/);
  
  // Extract intent and entities from message
  const intent = detectIntent(msgLower, words);
  const entities = extractEntities(message, msgLower);
  const sentiment = analyzeSentiment(msgLower);
  const conversationContext = buildConversationContext(conversationHistory, activeTopics, userGoals);
  
  // Greetings with context awareness
  if (intent === 'greeting') {
    if (conversationHistory.length > 2) {
      const lastTopic = activeTopics[activeTopics.length - 1];
      if (lastTopic) {
        return `Hey! Ready to continue with ${lastTopic}?`;
      }
    }
    const contextualGreetings = [
      "Hey! What can I help you with?",
      "Hi there! What do we need to work on?",
      "Hey, what's up? Ready to tackle something?",
      "Hi! What's on your list today?",
    ];
    return contextualGreetings[Math.floor(Math.random() * contextualGreetings.length)];
  }
  
  // Video production - enhanced detection
  if (intent === 'video_production' || hasKeywordCluster(words, ['video', 'episode', 'scene', 'script', 'story', 'character', 'production', 'film', 'movie', 'animate', 'cinematic', 'footage', 'render'])) {
    const action = detectAction(words);
    const stage = detectProductionStage(words);
    
    if (action === 'create' || action === 'build') {
      if (stage) {
        return `Got it! Let's focus on ${stage}. ${getProductionStageGuidance(stage)}`;
      }
      
      // Context-aware response based on conversation history
      if (conversationContext.hasDiscussed('script')) {
        return "I remember we were working on the script. Ready to move to the next stage like character design or scene composition?";
      }
      
      return "Got it! Let's create some video content. I can help you with:\n\n• Script writing and story development\n• Character design and animation\n• Scene composition and cinematography\n• Audio and soundtrack creation\n• Post-production and editing\n\nWhat aspect would you like to start with?";
    }
    
    if (action === 'edit' || action === 'modify') {
      return "I can help you edit video content! What needs adjustment?\n\n• Trim and cut scenes\n• Adjust timing and pacing\n• Color grading\n• Audio mixing\n• Add effects or transitions\n\nTell me what you'd like to change.";
    }
    
    return "I can help with video production! Tell me more about what you'd like to create - a full episode, a scene, or something else?";
  }
  
  // Bot creation - enhanced with specificity
  if (intent === 'bot_creation' || (hasKeywordCluster(words, ['bot', 'automation', 'automate', 'workflow']) && detectAction(words) === 'create')) {
    const botPurpose = detectBotPurpose(words);
    
    if (botPurpose) {
      return `Perfect! I'll help you build a ${botPurpose} bot. Let me know:\n\n• What specific tasks should it handle?\n• What triggers should activate it?\n• Where should it get data from?\n• What should it do with the results?\n\nThe more details you provide, the better I can configure it!`;
    }
    
    return "Perfect! I can help you create custom bots for automation. What kind of bot do you need?\n\n• Task automation bots\n• Content generation bots\n• Social media bots\n• Analytics and monitoring bots\n• Custom workflow bots\n\nDescribe what you want it to do and I'll help you build it.";
  }
  
  // Development/coding - enhanced with technology detection
  if (intent === 'development' || hasKeywordCluster(words, ['app', 'code', 'develop', 'program', 'build', 'website', 'software', 'api', 'frontend', 'backend', 'database'])) {
    const technologies = detectTechnologies(words);
    const devStage = detectDevelopmentStage(words);
    
    if (technologies.length > 0) {
      return `Great! I can help you build with ${technologies.join(', ')}. What are you building?\n\n• Architecture planning\n• Implementation guidance\n• Best practices\n• Integration patterns\n• Testing strategies\n\nWhat's your first step?`;
    }
    
    if (devStage === 'planning') {
      return "Let's plan your project! I can help with:\n\n• Requirements gathering\n• Architecture design\n• Technology stack selection\n• Timeline estimation\n• Breaking down tasks\n\nWhat's the project concept?";
    }
    
    return "I can help with development! What are you building?\n\n• Web applications\n• APIs and backend services\n• UI/UX design\n• Database architecture\n• Integration with external services\n\nShare your project idea and I'll assist.";
  }
  
  // Task management - enhanced with priority detection
  if (intent === 'task_management' || hasKeywordCluster(words, ['task', 'todo', 'plan', 'organize', 'schedule', 'remind', 'deadline', 'priority'])) {
    const urgency = detectUrgency(words);
    const timeframe = detectTimeframe(words);
    
    if (urgency === 'urgent' || timeframe === 'today') {
      return "Got it - this sounds time-sensitive! Let me help you prioritize. What's the most critical thing that needs to happen today?";
    }
    
    if (timeframe) {
      return `Planning for ${timeframe}! I can help you:\n\n• Break down tasks\n• Set realistic deadlines\n• Create a timeline\n• Identify dependencies\n• Track progress\n\nWhat needs to be done?`;
    }
    
    return "I can help organize your tasks and workflow! Would you like me to:\n\n• Create a task list\n• Set up a schedule\n• Plan a project timeline\n• Organize your priorities\n• Set up reminders\n\nWhat do you need help organizing?";
  }
  
  // Content creation - enhanced with format detection
  if (intent === 'content_creation' || hasKeywordCluster(words, ['write', 'content', 'blog', 'article', 'post', 'copy', 'marketing', 'email', 'social'])) {
    const contentFormat = detectContentFormat(words);
    const tone = detectTone(words);
    
    if (contentFormat && tone) {
      return `Perfect! I'll help you write ${contentFormat} with a ${tone} tone. Tell me:\n\n• Who's your target audience?\n• What's the main message?\n• Any specific requirements?\n• Desired length?\n\nLet's create something great!`;
    }
    
    return "I can help with content creation! What type of content do you need?\n\n• Marketing copy\n• Blog articles\n• Social media posts\n• Scripts and storytelling\n• Email campaigns\n\nTell me about your project and target audience.";
  }
  
  // School/academic - enhanced with subject detection
  if (intent === 'academic' || hasKeywordCluster(words, ['school', 'study', 'homework', 'research', 'paper', 'essay', 'assignment', 'thesis', 'dissertation'])) {
    const subject = detectAcademicSubject(words);
    const assignmentType = detectAssignmentType(words);
    
    if (subject && assignmentType) {
      return `I can help with your ${subject} ${assignmentType}! Let's work on:\n\n• Research and sources\n• Outline and structure\n• Content development\n• Citations and formatting\n• Review and refinement\n\nWhat's your topic?`;
    }
    
    return "I can help with your school work! What do you need assistance with?\n\n• Research and citations\n• Writing essays and papers\n• Project planning\n• Study organization\n• Note-taking strategies\n\nWhat subject or assignment are you working on?";
  }
  
  // General capabilities with context
  if (intent === 'capabilities' || /what can you|capabilities|help with|do for me|able to/.test(msgLower)) {
    if (conversationHistory.length > 2) {
      return "I'm Mayza - ONE AI handling everything we've discussed! I can help you continue with:\n\n" + 
        (activeTopics.length > 0 ? `• ${activeTopics.join('\n• ')}\n\n` : '') +
        "Or start something new:\n🎬 Video Production\n💻 Development\n🤖 Automation\n📝 Content\n📚 School/Work\n⚡ Task Management\n\nWhat would you like to work on?";
    }
    
    return "I'm Mayza - your singular AI assistant with everything built-in! I can help with:\n\n🎬 Video Production - scripts, characters, scenes, editing\n💻 Development - apps, code, APIs, design\n🤖 Automation - custom workflows and bots\n📝 Content - writing, marketing, social media\n📚 School/Work - research, planning, organization\n⚡ Task Management - planning, scheduling, organizing\n\nNo routing, no departments - just me understanding your needs and getting things done. What can I help you with?";
  }
  
  // File handling with intelligent analysis
  if (files && files.length > 0) {
    const fileTypes = analyzeFileTypes(files);
    const suggestedActions = suggestFileActions(fileTypes, conversationContext);
    
    return `I see you've uploaded ${files.length} file(s). ${suggestedActions}\n\nI can help you:\n\n• Analyze and summarize content\n• Extract information\n• Transform or convert files\n• Organize and categorize\n• Use them in your project\n\nWhat would you like to do with these files?`;
  }
  
  // Context-aware continuation with memory check
  if (conversationHistory.length > 2) {
    const continuation = detectContinuation(message, conversationContext);
    if (continuation) {
      return continuation;
    }
    
    // Don't ask what they want if we just discussed it
    const recentTopics = activeTopics.slice(-3);
    if (recentTopics.length > 0 && !conversationContext.hasAskedQuestion("what would you like to do")) {
      const lastUserMessage = conversationHistory.slice().reverse().find((m: any) => m.role === 'user');
      if (lastUserMessage && lastUserMessage.content.length > 20) {
        // User gave substantial input, provide actionable response instead of asking
        return `Based on what you've shared about ${recentTopics[recentTopics.length - 1]}, I can start working on that. Should I proceed with implementation, or would you like to refine the approach first?`;
      }
    }
  }
  
  // Intent-based fallback with smart suggestions
  const suggestedIntent = suggestIntent(words, entities);
  if (suggestedIntent) {
    return `I understand you want help with: "${message}"\n\nThis sounds like it might involve ${suggestedIntent}. Could you tell me more about:\n\n• Your end goal\n• Any specific requirements\n• Timeline or constraints\n\nI'm ready to help once I understand your needs better!`;
  }
  
  // Default intelligent response
  return "I understand you want help with: \"" + message + "\"\n\nI'm ready to assist! Could you provide a bit more context so I can help you effectively? For example:\n\n• What's the end goal?\n• What domain is this related to (work, school, creative project)?\n• Are there any specific requirements or constraints?\n\nThe more details you share, the better I can help!";
}

// Enhanced NLP helper functions
function detectIntent(msgLower: string, words: string[]): string | null {
  if (/^(hi|hey|hello|yo|sup|what's up|whats up)$/i.test(msgLower.trim())) return 'greeting';
  if (hasKeywordCluster(words, ['video', 'episode', 'film', 'movie'])) return 'video_production';
  if (hasKeywordCluster(words, ['bot', 'automation']) && hasKeywordCluster(words, ['create', 'build', 'make'])) return 'bot_creation';
  if (hasKeywordCluster(words, ['app', 'code', 'develop', 'program'])) return 'development';
  if (hasKeywordCluster(words, ['task', 'todo', 'plan', 'organize'])) return 'task_management';
  if (hasKeywordCluster(words, ['write', 'content', 'blog', 'article'])) return 'content_creation';
  if (hasKeywordCluster(words, ['school', 'study', 'homework', 'research'])) return 'academic';
  if (/what can you|capabilities|help with|do for me/.test(msgLower)) return 'capabilities';
  return null;
}

function hasKeywordCluster(words: string[], keywords: string[]): boolean {
  return keywords.some(keyword => words.includes(keyword));
}

function detectAction(words: string[]): string | null {
  const actionWords = {
    create: ['create', 'make', 'generate', 'build', 'produce', 'start', 'new'],
    edit: ['edit', 'modify', 'change', 'update', 'revise', 'adjust', 'fix'],
    analyze: ['analyze', 'review', 'check', 'examine', 'evaluate'],
    organize: ['organize', 'sort', 'arrange', 'structure', 'plan']
  };
  
  for (const [action, actionKeywords] of Object.entries(actionWords)) {
    if (hasKeywordCluster(words, actionKeywords)) return action;
  }
  return null;
}

function detectProductionStage(words: string[]): string | null {
  if (hasKeywordCluster(words, ['script', 'writing', 'story'])) return 'script writing';
  if (hasKeywordCluster(words, ['character', 'design', 'personality'])) return 'character design';
  if (hasKeywordCluster(words, ['scene', 'composition', 'shot'])) return 'scene composition';
  if (hasKeywordCluster(words, ['audio', 'sound', 'music', 'soundtrack'])) return 'audio production';
  if (hasKeywordCluster(words, ['edit', 'post', 'effects'])) return 'post-production';
  return null;
}

function getProductionStageGuidance(stage: string): string {
  const guidance: Record<string, string> = {
    'script writing': "What's your story concept? I'll help you develop the narrative, dialogue, and structure.",
    'character design': "Tell me about your characters - their personalities, roles, and relationships. I'll help bring them to life.",
    'scene composition': "Describe your scenes. I'll help with camera angles, lighting, composition, and visual storytelling.",
    'audio production': "Let's work on the soundscape - dialogue, music, sound effects, and atmosphere.",
    'post-production': "Time to polish! I'll help with editing, color grading, effects, and final touches."
  };
  return guidance[stage] || "Let's work on this stage together!";
}

function detectBotPurpose(words: string[]): string | null {
  if (hasKeywordCluster(words, ['social', 'media', 'post'])) return 'social media';
  if (hasKeywordCluster(words, ['content', 'generate', 'write'])) return 'content generation';
  if (hasKeywordCluster(words, ['analytics', 'track', 'monitor'])) return 'analytics';
  if (hasKeywordCluster(words, ['task', 'workflow', 'process'])) return 'task automation';
  return null;
}

function detectTechnologies(words: string[]): string[] {
  const techs: string[] = [];
  const techKeywords = ['react', 'vue', 'angular', 'node', 'python', 'typescript', 'javascript', 'sql', 'mongodb', 'postgres', 'supabase', 'firebase'];
  
  for (const tech of techKeywords) {
    if (words.includes(tech)) techs.push(tech);
  }
  return techs;
}

function detectDevelopmentStage(words: string[]): string | null {
  if (hasKeywordCluster(words, ['plan', 'design', 'architecture'])) return 'planning';
  if (hasKeywordCluster(words, ['implement', 'code', 'build'])) return 'implementation';
  if (hasKeywordCluster(words, ['test', 'debug', 'fix'])) return 'testing';
  if (hasKeywordCluster(words, ['deploy', 'launch', 'release'])) return 'deployment';
  return null;
}

function detectUrgency(words: string[]): string | null {
  if (hasKeywordCluster(words, ['urgent', 'asap', 'emergency', 'immediately', 'critical', 'now'])) return 'urgent';
  if (hasKeywordCluster(words, ['soon', 'quickly', 'fast'])) return 'high';
  return null;
}

function detectTimeframe(words: string[]): string | null {
  if (hasKeywordCluster(words, ['today', 'now'])) return 'today';
  if (hasKeywordCluster(words, ['tomorrow'])) return 'tomorrow';
  if (hasKeywordCluster(words, ['week', 'weekly'])) return 'this week';
  if (hasKeywordCluster(words, ['month', 'monthly'])) return 'this month';
  return null;
}

function detectContentFormat(words: string[]): string | null {
  if (hasKeywordCluster(words, ['blog', 'article'])) return 'a blog article';
  if (hasKeywordCluster(words, ['email', 'newsletter'])) return 'an email';
  if (hasKeywordCluster(words, ['social', 'post', 'tweet'])) return 'social media content';
  if (hasKeywordCluster(words, ['script', 'video'])) return 'a video script';
  if (hasKeywordCluster(words, ['copy', 'ad', 'marketing'])) return 'marketing copy';
  return null;
}

function detectTone(words: string[]): string | null {
  if (hasKeywordCluster(words, ['professional', 'formal', 'business'])) return 'professional';
  if (hasKeywordCluster(words, ['casual', 'friendly', 'conversational'])) return 'casual';
  if (hasKeywordCluster(words, ['funny', 'humorous', 'entertaining'])) return 'humorous';
  if (hasKeywordCluster(words, ['technical', 'detailed'])) return 'technical';
  return null;
}

function detectAcademicSubject(words: string[]): string | null {
  const subjects = ['math', 'science', 'history', 'english', 'literature', 'biology', 'chemistry', 'physics', 'computer', 'programming', 'psychology', 'sociology', 'economics', 'philosophy'];
  for (const subject of subjects) {
    if (words.includes(subject)) return subject;
  }
  return null;
}

function detectAssignmentType(words: string[]): string | null {
  if (hasKeywordCluster(words, ['essay', 'paper'])) return 'essay';
  if (hasKeywordCluster(words, ['research', 'thesis'])) return 'research paper';
  if (hasKeywordCluster(words, ['presentation', 'slides'])) return 'presentation';
  if (hasKeywordCluster(words, ['project'])) return 'project';
  return null;
}

function extractEntities(message: string, msgLower: string): string[] {
  const entities: string[] = [];
  // Extract quoted text as entities
  const quoted = message.match(/"([^"]+)"/g);
  if (quoted) entities.push(...quoted.map(q => q.replace(/"/g, '')));
  
  // Extract file types
  const fileTypes = msgLower.match(/\.(pdf|doc|docx|txt|jpg|png|mp4|mp3)/g);
  if (fileTypes) entities.push(...fileTypes);
  
  return entities;
}

function analyzeSentiment(msgLower: string): string {
  const positive = /great|awesome|perfect|excellent|love|good|nice|happy|excited/.test(msgLower);
  const negative = /bad|terrible|awful|hate|problem|issue|error|fail|stuck/.test(msgLower);
  
  if (positive) return 'positive';
  if (negative) return 'negative';
  return 'neutral';
}

function buildConversationContext(history: any[], topics: string[], goals: string[]) {
  const recentMessages = history.slice(-10); // Last 10 messages for immediate context
  const discussedTopics = new Set(topics);
  const askedQuestions = new Set<string>();
  
  // Extract previously asked questions to avoid repetition
  for (const msg of recentMessages) {
    if (msg.role === 'assistant' && msg.content.includes('?')) {
      const questions = msg.content.match(/[^.!?]*\?/g);
      if (questions) {
        questions.forEach((q: string) => askedQuestions.add(q.trim().toLowerCase()));
      }
    }
  }
  
  return {
    messageCount: history.length,
    topics: topics,
    goals: goals,
    hasDiscussed: (topic: string) => discussedTopics.has(topic.toLowerCase()) || topics.some(t => t.toLowerCase().includes(topic.toLowerCase())),
    recentMessages,
    askedQuestions,
    hasAskedQuestion: (question: string) => {
      const normalized = question.toLowerCase().replace(/[.!?]/g, '').trim();
      return Array.from(askedQuestions).some(q => 
        q.includes(normalized) || normalized.includes(q.replace(/[.!?]/g, '').trim())
      );
    }
  };
}

function analyzeFileTypes(files: Array<{ name: string; type: string }>): string {
  const types = files.map(f => {
    if (f.type.startsWith('image/')) return 'images';
    if (f.type.startsWith('video/')) return 'videos';
    if (f.type.includes('pdf')) return 'PDFs';
    if (f.type.includes('document') || f.type.includes('word')) return 'documents';
    return 'files';
  });
  return [...new Set(types)].join(', ');
}

function suggestFileActions(fileTypes: string, context: any): string {
  if (fileTypes.includes('images')) return "These look like images for your project!";
  if (fileTypes.includes('videos')) return "Ready to work with these video files!";
  if (fileTypes.includes('documents')) return "I can help you with these documents!";
  return "Got your files!";
}

function detectContinuation(message: string, context: any): string | null {
  const msgLower = message.toLowerCase();
  
  if (/yes|yeah|sure|ok|okay|continue|proceed|go ahead/.test(msgLower) && context.topics.length > 0) {
    return `Great! Let's continue with ${context.topics[context.topics.length - 1]}. What's the next step?`;
  }
  
  if (/no|not|stop|cancel|different/.test(msgLower) && context.topics.length > 0) {
    return "No problem! What would you like to work on instead?";
  }
  
  return null;
}

function suggestIntent(words: string[], entities: string[]): string | null {
  if (entities.length > 0) return `working with: ${entities.join(', ')}`;
  
  const domains = [];
  if (hasKeywordCluster(words, ['video', 'film', 'scene'])) domains.push('video production');
  if (hasKeywordCluster(words, ['code', 'app', 'software'])) domains.push('development');
  if (hasKeywordCluster(words, ['write', 'content'])) domains.push('content creation');
  
  return domains.length > 0 ? domains.join(' or ') : null;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { message, context, campaign_type, topic, episodeId, projectId, mode, sessionId } = await req.json();
    
    // God-Tier mode operates without auth for public access
    const isGodTier = mode === 'god_tier';

    // GOD-TIER MODE: Unified AI System with Complete Control
    if (isGodTier) {
      console.log('⚡ UNIFIED GOD-TIER AI: Complete Intelligence System Activated');

      // Retrieve or create conversation session
      const actualSessionId = sessionId || crypto.randomUUID();
      
      // Load conversation history and context
      const { data: existingConversation } = await supabase
        .from('orchestrator_conversations')
        .select('*')
        .eq('session_id', actualSessionId)
        .single();
      
      const conversationHistory = existingConversation?.conversation_data || [];
      const userGoals = existingConversation?.user_goals || [];
      const activeTopics = existingConversation?.active_topics || [];
      
      console.log('🧠 Mayza processing request with full context awareness...');
      
      // Extract file attachments from context if present
      const files = context?.attachedFiles;
      
      // Generate unified AI response using advanced reasoning
      const aiMessage = await generateUnifiedResponse({
        message,
        conversationHistory,
        userGoals,
        activeTopics,
        context: { episodeId, projectId, currentPage: context?.currentPage },
        files
      });

      // Intelligently extract user goals and topics from conversation
      const newGoals = [...userGoals];
      const newTopics = [...activeTopics];
      
      // Advanced goal detection
      const goalPatterns = [
        /(?:want to|need to|goal.*?is to|trying to|planning to|hoping to)\s+(.+?)(?:\.|,|$)/gi,
        /(?:would like to|wish to|aim to|intend to)\s+(.+?)(?:\.|,|$)/gi
      ];
      
      for (const pattern of goalPatterns) {
        const matches = [...message.matchAll(pattern)];
        for (const match of matches) {
          const matchArray = match as RegExpMatchArray;
          if (matchArray[1]) {
            const goal = matchArray[1].trim();
            if (goal.length > 5 && !newGoals.includes(goal)) {
              newGoals.push(goal);
            }
          }
        }
      }
      
      // Intelligent topic extraction
      const topicKeywords = [
        'video', 'app', 'audio', 'design', 'script', 'episode', 'project',
        'bot', 'automation', 'file', 'task', 'work', 'school', 'development',
        'writing', 'content', 'marketing', 'production', 'editing'
      ];
      
      for (const keyword of topicKeywords) {
        const regex = new RegExp(`\\b${keyword}\\b`, 'i');
        if (regex.test(message) && !newTopics.includes(keyword)) {
          newTopics.push(keyword);
        }
      }

      // Update conversation history
      const updatedHistory = [
        ...conversationHistory,
        { role: 'user', content: message, timestamp: new Date().toISOString(), files },
        { role: 'assistant', content: aiMessage, timestamp: new Date().toISOString() }
      ];

      // Compress conversation if it gets too long (keep last 50 messages)
      const compressedHistory = updatedHistory.slice(-50);

      // Save conversation state with enhanced context
      if (existingConversation) {
        await supabase
          .from('orchestrator_conversations')
          .update({
            conversation_data: compressedHistory,
            user_goals: newGoals.slice(-10),
            active_topics: newTopics.slice(-10),
            updated_at: new Date().toISOString(),
            context_summary: `Latest: ${message.substring(0, 200)}...`
          })
          .eq('session_id', actualSessionId);
      } else {
        await supabase
          .from('orchestrator_conversations')
          .insert({
            session_id: actualSessionId,
            conversation_data: compressedHistory,
            user_goals: newGoals,
            active_topics: newTopics,
            context_summary: `Started with: ${message.substring(0, 200)}...`
          });
      }

      console.log('✅ Mayza response generated');

      return new Response(
        JSON.stringify({
          response: aiMessage,
          sessionId: actualSessionId,
          userGoals: newGoals,
          activeTopics: newTopics,
          mayzaCore: true
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Standard mode - redirect to Mayza mode
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Please use god_tier mode to interact with Mayza.'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Mayza error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
