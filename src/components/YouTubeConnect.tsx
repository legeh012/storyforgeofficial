import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Youtube, Link2, Unlink, CheckCircle2, AlertCircle, ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface YouTubeConnection {
  channelId: string;
  channelName?: string;
  connected: boolean;
  accessToken?: string;
}

export const YouTubeConnect = () => {
  const [connection, setConnection] = useState<YouTubeConnection | null>(null);
  const [loading, setLoading] = useState(false);
  const [channelId, setChannelId] = useState('');

  useEffect(() => {
    loadConnection();
    
    // Check for OAuth callback
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    
    if (code && state === 'youtube_oauth') {
      handleOAuthCallback(code);
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const loadConnection = async () => {
    const stored = localStorage.getItem('youtube_connection');
    if (stored) {
      setConnection(JSON.parse(stored));
    }
  };

  const handleOAuthCallback = async (code: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('youtube-oauth', {
        body: { 
          action: 'exchange',
          code,
          redirectUri: window.location.origin + window.location.pathname
        }
      });

      if (error) throw error;

      if (data.success) {
        const newConnection: YouTubeConnection = {
          channelId: data.channelId,
          channelName: data.channelName,
          connected: true,
          accessToken: data.accessToken
        };
        setConnection(newConnection);
        localStorage.setItem('youtube_connection', JSON.stringify(newConnection));
        toast.success(`Connected to YouTube: ${data.channelName}`);
      }
    } catch (error: any) {
      console.error('OAuth callback error:', error);
      toast.error('Failed to connect YouTube account');
    } finally {
      setLoading(false);
    }
  };

  const startOAuth = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('youtube-oauth', {
        body: { 
          action: 'authorize',
          redirectUri: window.location.origin + window.location.pathname
        }
      });

      if (error) throw error;

      if (data.authUrl) {
        window.location.href = data.authUrl;
      } else {
        toast.error('Failed to get authorization URL');
      }
    } catch (error: any) {
      console.error('OAuth start error:', error);
      toast.error(error.message || 'Failed to start YouTube login');
    } finally {
      setLoading(false);
    }
  };

  const connectManually = () => {
    if (!channelId.trim()) {
      toast.error('Please enter a channel ID');
      return;
    }

    const newConnection: YouTubeConnection = {
      channelId: channelId.trim(),
      channelName: 'Manual Connection',
      connected: true
    };
    setConnection(newConnection);
    localStorage.setItem('youtube_connection', JSON.stringify(newConnection));
    toast.success('YouTube channel saved (manual mode)');
    setChannelId('');
  };

  const disconnect = () => {
    setConnection(null);
    localStorage.removeItem('youtube_connection');
    toast.success('YouTube account disconnected');
  };

  return (
    <Card className="border-red-500/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500/10 rounded-lg">
              <Youtube className="h-6 w-6 text-red-500" />
            </div>
            <div>
              <CardTitle className="text-lg">YouTube</CardTitle>
              <CardDescription>Connect your YouTube channel for video uploads</CardDescription>
            </div>
          </div>
          {connection?.connected ? (
            <Badge variant="outline" className="text-green-500 border-green-500/30 bg-green-500/10">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Connected
            </Badge>
          ) : (
            <Badge variant="outline" className="text-muted-foreground">
              <AlertCircle className="h-3 w-3 mr-1" />
              Not Connected
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {connection?.connected ? (
          <div className="space-y-4">
            <div className="p-4 bg-muted/50 rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Channel ID</span>
                <code className="text-xs bg-background px-2 py-1 rounded">{connection.channelId}</code>
              </div>
              {connection.channelName && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Channel Name</span>
                  <span className="text-sm font-medium">{connection.channelName}</span>
                </div>
              )}
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.open(`https://youtube.com/channel/${connection.channelId}`, '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                View Channel
              </Button>
              <Button 
                variant="destructive" 
                size="sm"
                onClick={disconnect}
              >
                <Unlink className="h-4 w-4 mr-2" />
                Disconnect
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* OAuth Login */}
            <div className="space-y-2">
              <Button 
                onClick={startOAuth}
                disabled={loading}
                className="w-full bg-red-500 hover:bg-red-600"
              >
                <Youtube className="h-4 w-4 mr-2" />
                {loading ? 'Connecting...' : 'Sign in with YouTube'}
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                This will open Google sign-in to authorize video uploads
              </p>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or connect manually</span>
              </div>
            </div>

            {/* Manual Connection */}
            <div className="space-y-2">
              <Label htmlFor="channelId">Channel ID</Label>
              <div className="flex gap-2">
                <Input
                  id="channelId"
                  placeholder="UC4jPydTrKUYgdBL9zvreWeg"
                  value={channelId}
                  onChange={(e) => setChannelId(e.target.value)}
                />
                <Button 
                  variant="outline"
                  onClick={connectManually}
                  disabled={!channelId.trim()}
                >
                  <Link2 className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Manual mode saves channel ID locally (no upload permissions)
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default YouTubeConnect;
