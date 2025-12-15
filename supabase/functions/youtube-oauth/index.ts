import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const YOUTUBE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const YOUTUBE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const YOUTUBE_API_URL = 'https://www.googleapis.com/youtube/v3';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, code, redirectUri } = await req.json();

    const clientId = Deno.env.get('YOUTUBE_CLIENT_ID');
    const clientSecret = Deno.env.get('YOUTUBE_CLIENT_SECRET');

    if (!clientId) {
      return new Response(
        JSON.stringify({ 
          error: 'YouTube OAuth not configured',
          message: 'Please add YOUTUBE_CLIENT_ID and YOUTUBE_CLIENT_SECRET to your secrets',
          setupInstructions: [
            '1. Go to console.cloud.google.com',
            '2. Create OAuth 2.0 credentials (Web application)',
            '3. Add your app URL to Authorized JavaScript origins',
            '4. Add your app URL to Authorized redirect URIs',
            '5. Copy Client ID and Client Secret to Lovable secrets'
          ]
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (action === 'authorize') {
      // Generate authorization URL
      const scopes = [
        'https://www.googleapis.com/auth/youtube.upload',
        'https://www.googleapis.com/auth/youtube.readonly',
        'https://www.googleapis.com/auth/youtube'
      ].join(' ');

      const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        response_type: 'code',
        scope: scopes,
        access_type: 'offline',
        state: 'youtube_oauth',
        prompt: 'consent'
      });

      const authUrl = `${YOUTUBE_AUTH_URL}?${params.toString()}`;

      console.log('Generated YouTube auth URL for redirect:', redirectUri);

      return new Response(
        JSON.stringify({ authUrl }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'exchange') {
      if (!code) {
        return new Response(
          JSON.stringify({ error: 'Authorization code required' }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      if (!clientSecret) {
        return new Response(
          JSON.stringify({ error: 'YOUTUBE_CLIENT_SECRET not configured' }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      // Exchange code for tokens
      const tokenResponse = await fetch(YOUTUBE_TOKEN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          code,
          grant_type: 'authorization_code',
          redirect_uri: redirectUri
        })
      });

      const tokenData = await tokenResponse.json();

      if (tokenData.error) {
        console.error('Token exchange error:', tokenData);
        return new Response(
          JSON.stringify({ error: tokenData.error_description || 'Token exchange failed' }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      // Get channel info
      const channelResponse = await fetch(
        `${YOUTUBE_API_URL}/channels?part=snippet&mine=true`,
        {
          headers: { 'Authorization': `Bearer ${tokenData.access_token}` }
        }
      );

      const channelData = await channelResponse.json();

      if (!channelData.items || channelData.items.length === 0) {
        return new Response(
          JSON.stringify({ error: 'No YouTube channel found for this account' }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      const channel = channelData.items[0];

      console.log('YouTube OAuth success for channel:', channel.snippet.title);

      return new Response(
        JSON.stringify({
          success: true,
          channelId: channel.id,
          channelName: channel.snippet.title,
          accessToken: tokenData.access_token,
          refreshToken: tokenData.refresh_token,
          expiresIn: tokenData.expires_in
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action. Use: authorize or exchange' }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('YouTube OAuth error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
