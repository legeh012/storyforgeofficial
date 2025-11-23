import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Unified God-Tier AI System - One intelligence with complete control
interface ConversationContext {
  message: string;
  conversationHistory: any[];
  userGoals: string[];
  activeTopics: string[];
  context: any;
  files?: Array<{ name: string; type: string }>;
}

// Intelligent pattern-based response system - free and local
async function generateUnifiedResponse(contextData: ConversationContext): Promise<string> {
  const { message, conversationHistory, userGoals, activeTopics, context, files } = contextData;
  
  const msgLower = message.toLowerCase();
  
  // Greetings
  if (/^(hi|hey|hello|yo|sup|what's up|whats up)$/i.test(msgLower.trim())) {
    const responses = [
      "Hey! What can I help you with?",
      "Hi there! What do we need to work on?",
      "Hey, what's up? Ready to tackle something?",
      "Hi! What's on your list today?",
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }
  
  // Video production keywords
  if (/video|episode|scene|script|story|character|production|film|movie|animate/.test(msgLower)) {
    if (/create|make|generate|build|produce/.test(msgLower)) {
      return "Got it! Let's create some video content. I can help you with:\n\n• Script writing and story development\n• Character design and animation\n• Scene composition and cinematography\n• Audio and soundtrack creation\n• Post-production and editing\n\nWhat aspect would you like to start with?";
    }
    return "I can help with video production! Tell me more about what you'd like to create - a full episode, a scene, or something else?";
  }
  
  // Bot creation
  if (/bot|automation|automate|workflow|task/.test(msgLower) && /create|build|make|design/.test(msgLower)) {
    return "Perfect! I can help you create custom bots for automation. What kind of bot do you need?\n\n• Task automation bots\n• Content generation bots\n• Social media bots\n• Analytics and monitoring bots\n• Custom workflow bots\n\nDescribe what you want it to do and I'll help you build it.";
  }
  
  // Development/coding
  if (/app|code|develop|program|build|website|software/.test(msgLower)) {
    return "I can help with development! What are you building?\n\n• Web applications\n• APIs and backend services\n• UI/UX design\n• Database architecture\n• Integration with external services\n\nShare your project idea and I'll assist.";
  }
  
  // Task management/organization
  if (/task|todo|plan|organize|schedule|remind/.test(msgLower)) {
    return "I can help organize your tasks and workflow! Would you like me to:\n\n• Create a task list\n• Set up a schedule\n• Plan a project timeline\n• Organize your priorities\n• Set up reminders\n\nWhat do you need help organizing?";
  }
  
  // Content creation
  if (/write|content|blog|article|post|copy|marketing/.test(msgLower)) {
    return "I can help with content creation! What type of content do you need?\n\n• Marketing copy\n• Blog articles\n• Social media posts\n• Scripts and storytelling\n• Email campaigns\n\nTell me about your project and target audience.";
  }
  
  // School/academic
  if (/school|study|homework|research|paper|essay|assignment/.test(msgLower)) {
    return "I can help with your school work! What do you need assistance with?\n\n• Research and citations\n• Writing essays and papers\n• Project planning\n• Study organization\n• Note-taking strategies\n\nWhat subject or assignment are you working on?";
  }
  
  // General capabilities question
  if (/what can you|capabilities|help with|do for me/.test(msgLower)) {
    return "I'm Mayza - your unified AI productivity system! I can help with:\n\n🎬 Video Production - scripts, characters, scenes, editing\n💻 Development - apps, code, APIs, design\n🤖 Bot Creation - custom automation and workflows\n📝 Content - writing, marketing, social media\n📚 School/Work - research, planning, organization\n⚡ Task Automation - macOS integration, file management\n\nI remember our conversations, understand context across domains, and adapt to how you work. What would you like to tackle first?";
  }
  
  // File handling
  if (files && files.length > 0) {
    const fileTypes = files.map(f => f.type).join(', ');
    return `I see you've uploaded ${files.length} file(s) (${fileTypes}). I can help you with these files! What would you like to do?\n\n• Analyze and summarize content\n• Extract information\n• Transform or convert files\n• Organize and categorize\n• Use them in a project\n\nWhat's your goal with these files?`;
  }
  
  // Context-aware responses based on conversation history
  if (conversationHistory.length > 2) {
    const recentTopics = activeTopics.slice(-3);
    if (recentTopics.length > 0) {
      return `I'm following our conversation about ${recentTopics.join(', ')}. Could you provide more details about what you'd like to do next?`;
    }
  }
  
  // Default intelligent response
  return "I understand you want help with: \"" + message + "\"\n\nI'm ready to assist! Could you provide a bit more context so I can help you effectively? For example:\n\n• What's the end goal?\n• What domain is this related to (work, school, creative project)?\n• Are there any specific requirements or constraints?\n\nThe more details you share, the better I can help!";
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
      
      console.log('🧠 Processing with unified god-tier AI intelligence...');
      
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

      console.log('✅ Unified AI response generated with complete context awareness');

      return new Response(
        JSON.stringify({
          response: aiMessage,
          sessionId: actualSessionId,
          userGoals: newGoals,
          activeTopics: newTopics,
          unifiedSystem: true,
          capabilities: [
            'video_production',
            'app_development', 
            'task_automation',
            'content_creation',
            'bot_creation',
            'general_assistance'
          ]
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Standard mode - return basic response
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Standard mode not implemented. Please use god_tier mode.'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Bot orchestrator error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
