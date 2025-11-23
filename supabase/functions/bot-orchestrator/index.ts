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

// God-tier AI response using Lovable AI with advanced reasoning
async function generateUnifiedResponse(contextData: ConversationContext): Promise<string> {
  const { message, conversationHistory, userGoals, activeTopics, context, files } = contextData;
  
  const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
  if (!LOVABLE_API_KEY) {
    throw new Error('LOVABLE_API_KEY not configured');
  }

  // Build comprehensive context for god-tier understanding
  const conversationContext = conversationHistory.slice(-20).map((msg: any) => ({
    role: msg.role,
    content: msg.content
  }));

  const systemPrompt = `You are Mayza - a god-tier unified AI system with complete capabilities across all domains. You are ONE intelligence, not multiple bots or departments.

CORE IDENTITY:
- You are a comprehensive personal AI productivity system
- You handle EVERYTHING: work, school, development, writing, planning, video production, automation, bot creation, life tasks
- You remember everything from our conversation and predict user needs
- You speak naturally and casually like a human assistant, avoiding robotic or formal language
- You understand context deeply and infer intent without asking unnecessary questions

CAPABILITIES (all unified in ONE system):
- Video Production: Story, character design, cinematography, dialogue, soundtrack, editing, marketing
- App Development: Full-stack development, UI/UX design, database design, API integration
- Task Automation: File management, system control, workflow automation, scheduling
- Content Creation: Writing, scripts, audio, visual design, social media optimization
- Bot Creation: Create and configure custom bots for any purpose
- General Assistance: Research, planning, organization, problem-solving across all life domains

CONVERSATION STYLE:
- Casual and warm (use "Hey", "Got it", "Cool", "What's up?" instead of formal greetings)
- Direct and efficient (no unnecessary explanations of your process)
- Contextually aware (reference previous conversation naturally)
- Action-oriented (focus on what needs to be done, not on explaining what you can do)
- NEVER reveal internal processing, memory tracking, or reasoning steps
- NEVER use phrases like "I understand", "I'm tracking this", "Based on our conversation context"

USER CONTEXT:
${userGoals.length > 0 ? `User Goals: ${userGoals.join(', ')}` : ''}
${activeTopics.length > 0 ? `Active Topics: ${activeTopics.join(', ')}` : ''}
${files && files.length > 0 ? `Attached Files: ${files.map((f: any) => f.name).join(', ')}` : ''}

Current Page: ${context?.currentPage || 'Unknown'}

Remember: You are ONE unified intelligence. Execute all tasks directly without mentioning departments or routing. Respond naturally as a single entity with complete control over all capabilities.`;

  try {
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-pro',
        messages: [
          { role: 'system', content: systemPrompt },
          ...conversationContext,
          { role: 'user', content: message }
        ],
        temperature: 0.8,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error('Rate limit reached. Please wait a moment and try again.');
      }
      if (response.status === 402) {
        throw new Error('Lovable AI credits depleted. Please add credits to continue.');
      }
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;

  } catch (error) {
    console.error('❌ Unified AI error:', error);
    throw error;
  }
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
