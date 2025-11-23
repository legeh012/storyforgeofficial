import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { projectData, characters, episodes } = await req.json();

    // Create project
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .insert({
        title: projectData.title,
        description: projectData.description,
        genre: projectData.genre,
        theme: projectData.theme,
        mood: projectData.mood,
        status: 'active',
        user_id: user.id,
      })
      .select()
      .single();

    if (projectError) throw projectError;

    // Create characters
    const characterInserts = characters.map((char: any) => ({
      name: char.name,
      role: char.role,
      personality: char.traits.join(', '),
      background: char.drama_hooks,
      metadata: {
        appearance: char.appearance,
        relationships: char.relationships,
        status: char.status,
      },
      project_id: project.id,
      user_id: user.id,
    }));

    const { error: charactersError } = await supabase
      .from('characters')
      .insert(characterInserts);

    if (charactersError) throw charactersError;

    // Create episodes
    const episodeInserts = episodes.map((ep: any, index: number) => ({
      title: ep.title,
      episode_number: ep.episode_number,
      script: ep.script,
      synopsis: ep.synopsis,
      status: 'draft',
      project_id: project.id,
      user_id: user.id,
    }));

    const { error: episodesError } = await supabase
      .from('episodes')
      .insert(episodeInserts);

    if (episodesError) throw episodesError;

    return new Response(
      JSON.stringify({ success: true, project }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Setup production error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});