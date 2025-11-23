import { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Loader2, Sparkles, Zap, Code, Film, Palette, Music, TrendingUp, Power, Paperclip, Image as ImageIcon, File, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';
import { messageSchema } from '@/lib/validations';
import { z } from 'zod';
import { logger } from '@/lib/logger';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  capabilities?: string[];
  files?: Array<{ name: string; type: string; url: string }>;
}

const GOD_TIER_CAPABILITIES = [
  { icon: Code, label: 'App Builder', color: 'text-blue-500' },
  { icon: Film, label: 'Video Director', color: 'text-purple-500' },
  { icon: Palette, label: 'Creative Studio', color: 'text-pink-500' },
  { icon: Music, label: 'Audio Master', color: 'text-green-500' },
  { icon: TrendingUp, label: 'Viral Optimizer', color: 'text-orange-500' },
  { icon: Sparkles, label: 'AI Engineer', color: 'text-yellow-500' },
  { icon: Zap, label: 'Task Automator', color: 'text-cyan-500' },
  { icon: MessageSquare, label: 'Digital Assistant', color: 'text-indigo-500' },
  { icon: Bot, label: 'Bot Creator', color: 'text-violet-500' },
];

export const GodTierOrchestrator = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isActive, setIsActive] = useState(() => {
    const saved = localStorage.getItem('mayza-active-state');
    return saved !== null ? saved === 'true' : true;
  });
  const [sessionId] = useState(() => crypto.randomUUID());
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hey! I'm Mayza - ONE unified AI system with complete control over everything. I handle all your tasks: work, school, development, video production, automation, bot creation, content, planning - literally anything. I remember our entire conversation, predict what you need, and speak like a real assistant. No departments, no routing, just me helping you get things done. What's up?",
      capabilities: GOD_TIER_CAPABILITIES.map(c => c.label)
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<Array<{ name: string; type: string; url: string }>>([]);
  const [isDragging, setIsDragging] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const toggleActive = () => {
    setIsActive(prev => {
      const newState = !prev;
      localStorage.setItem('mayza-active-state', String(newState));
      return newState;
    });
    toast({
      title: isActive ? "Orchestrator Deactivated" : "Orchestrator Activated",
      description: isActive 
        ? "Chat is now inactive. Toggle to reactivate." 
        : "All Mayza capabilities are now online.",
    });
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files) return;

    const uploadPromises = Array.from(files).map(async (file) => {
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: `${file.name} exceeds 10MB limit`,
          variant: "destructive",
        });
        return null;
      }

      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          toast({
            title: "Authentication required",
            description: "Please sign in to upload files",
            variant: "destructive",
          });
          return null;
        }

        // Create unique file path
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
          .from('orchestrator-files')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (error) {
          logger.error('File upload failed', error, { fileName: file.name });
          toast({
            title: "Upload failed",
            description: `Failed to upload ${file.name}`,
            variant: "destructive",
          });
          return null;
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('orchestrator-files')
          .getPublicUrl(data.path);

        return {
          name: file.name,
          type: file.type,
          url: publicUrl,
        };
      } catch (error) {
        logger.error('File upload exception', error, { fileName: file.name });
        toast({
          title: "Upload failed",
          description: `Failed to upload ${file.name}`,
          variant: "destructive",
        });
        return null;
      }
    });

    const results = await Promise.all(uploadPromises);
    const successfulUploads = results.filter((r): r is { name: string; type: string; url: string } => r !== null);

    if (successfulUploads.length > 0) {
      setUploadedFiles((prev) => [...prev, ...successfulUploads]);
      toast({
        title: "Files uploaded",
        description: `${successfulUploads.length} file(s) uploaded to storage`,
      });
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleFileUpload(e.dataTransfer.files);
  };

  const removeFile = async (index: number) => {
    const file = uploadedFiles[index];
    
    try {
      // Extract file path from public URL
      const url = new URL(file.url);
      const pathMatch = url.pathname.match(/\/storage\/v1\/object\/public\/orchestrator-files\/(.+)$/);
      
      if (pathMatch && pathMatch[1]) {
        const filePath = pathMatch[1];
        
        // Delete from Supabase Storage
        const { error } = await supabase.storage
          .from('orchestrator-files')
          .remove([filePath]);

        if (error) {
          logger.error('File deletion failed', error);
        }
      }
    } catch (error) {
      logger.error('Error removing file from storage', error);
    }

    // Remove from local state
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const sendMessage = async (e?: React.MouseEvent | React.KeyboardEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    
    if (!input.trim() || isLoading || !isActive) {
      if (!isActive) {
        toast({
          title: "Orchestrator Inactive",
          description: "Please activate the orchestrator to send messages.",
          variant: "destructive",
        });
      }
      return;
    }

    try {
      // Validate message
      const validated = messageSchema.parse({ message: input.trim() });
      const userMessage = validated.message;
      
      setInput('');
      setIsLoading(true);

      const userMsg: Message = { 
        role: 'user', 
        content: userMessage,
        files: uploadedFiles.length > 0 ? [...uploadedFiles] : undefined
      };
      
      setMessages(prev => [...prev, userMsg]);
      
      // Clear uploaded files from state after sending (files remain in storage)
      setUploadedFiles([]);

      // Prepare deep context for GPT-5.1-like processing
      const context = {
        currentPage: window.location.pathname,
        conversationHistory: messages.map(m => ({
          role: m.role,
          content: m.content,
          files: m.files
        })),
        godTierMode: true,
        attachedFiles: uploadedFiles.length > 0 ? uploadedFiles.map(f => ({
          name: f.name,
          type: f.type
        })) : undefined
      };

      const { data, error } = await supabase.functions.invoke('bot-orchestrator', {
        body: { 
          message: userMessage,
          context,
          campaign_type: 'full_viral_campaign',
          mode: 'god_tier',
          sessionId
        }
      });

      if (error) {
        logger.error('Bot orchestrator invocation failed', error, {
          sessionId,
          mode: 'god_tier',
        });
        
        // Check for specific error codes in the response
        if (error.message?.includes('402') || error.context?.body?.error?.includes('credits')) {
          throw new Error('💳 Lovable AI credits depleted. Please add credits in Settings → Workspace → Usage to continue.');
        }
        if (error.message?.includes('429')) {
          throw new Error('⏳ Rate limit reached. Please wait a moment and try again.');
        }
        
        // Parse error message from response body if available
        const errorMsg = error.context?.body?.error || error.message || 'An unexpected error occurred';
        throw new Error(errorMsg);
      }

      logger.debug('Unified AI response received', { 
        unifiedSystem: data.unifiedSystem,
        capabilities: data.capabilities
      });

      const assistantMessage = data?.response || data?.message || 'Got it, on it now.';
      
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: assistantMessage,
        capabilities: data?.unifiedSystem ? ['Unified AI System'] : undefined
      }]);

    } catch (error) {
      logger.error('Mayza orchestrator error', error, { sessionId });
      
      let errorMessage = 'An unexpected error occurred. Please try again.';
      
      if (error instanceof z.ZodError) {
        errorMessage = error.errors[0].message;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Orchestrator Error",
        description: errorMessage,
        variant: "destructive",
      });

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `⚠️ Error: ${errorMessage}`
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      e.stopPropagation();
      sendMessage(e);
    }
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50 transition-all ${
          isActive 
            ? 'bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 hover:from-purple-700 hover:via-pink-700 hover:to-orange-700' 
            : 'bg-muted hover:bg-muted/80'
        }`}
        size="icon"
        aria-label="Open Mayza AI Assistant"
      >
        <div className="relative">
          <Zap className={`h-6 w-6 ${isActive ? 'text-white' : 'text-muted-foreground'}`} />
          {isActive && (
            <Sparkles className="h-3 w-3 text-yellow-300 absolute -top-1 -right-1 animate-pulse" />
          )}
        </div>
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-6 right-6 w-[450px] h-[600px] shadow-2xl z-50 flex flex-col border-2 border-gradient-to-r from-purple-500 via-pink-500 to-orange-500">
      {/* Header */}
      <div className={`p-4 rounded-t-lg flex items-center justify-between transition-colors ${
        isActive 
          ? 'bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 text-white' 
          : 'bg-muted text-muted-foreground'
      }`}>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Zap className="h-6 w-6" />
            {isActive && (
              <Sparkles className="h-3 w-3 absolute -top-1 -right-1 animate-pulse" />
            )}
          </div>
          <div>
            <h3 className="font-bold text-lg">Mayza</h3>
            <p className={`text-xs ${isActive ? 'text-white/80' : 'text-muted-foreground'}`}>
              {isActive ? 'AI Productivity System • Work • School • Life' : 'Inactive'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 mr-2">
            <Switch
              checked={isActive}
              onCheckedChange={toggleActive}
              className="data-[state=checked]:bg-white"
            />
            <Badge variant={isActive ? "secondary" : "outline"} className="text-xs">
              {isActive ? 'Active' : 'Inactive'}
            </Badge>
          </div>
          <Button
            onClick={() => setIsOpen(false)}
            variant="ghost"
            size="icon"
            className={isActive ? 'text-white hover:bg-white/20' : 'hover:bg-muted/80'}
            aria-label="Close Mayza Assistant"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Unified Capabilities Bar */}
      <div className="p-3 bg-muted/30 border-b">
        <div className="flex items-center justify-between">
          <div className="flex flex-wrap gap-1">
            {GOD_TIER_CAPABILITIES.slice(0, 5).map((cap, idx) => (
              <Badge key={idx} variant="secondary" className="text-xs gap-1">
                <cap.icon className={`h-3 w-3 ${cap.color}`} />
                {cap.label}
              </Badge>
            ))}
          </div>
          <Badge variant="outline" className="text-xs">
            <Sparkles className="h-3 w-3 mr-1 text-yellow-500" />
            Unified System
          </Badge>
        </div>
      </div>

      {/* Messages */}
      <div 
        className="flex-1 overflow-y-auto p-4 space-y-4"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {isDragging && (
          <div className="absolute inset-4 border-2 border-dashed border-primary rounded-lg bg-primary/10 flex items-center justify-center z-10 pointer-events-none">
            <div className="text-center">
              <File className="h-12 w-12 mx-auto mb-2 text-primary" />
              <p className="text-sm font-medium text-primary">Drop files here</p>
            </div>
          </div>
        )}
        
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                msg.role === 'user'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                  : 'bg-muted'
              }`}
            >
              {msg.role === 'assistant' && msg.capabilities && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {msg.capabilities.map((cap, i) => (
                    <Badge key={i} variant="outline" className="text-xs">
                      {cap}
                    </Badge>
                  ))}
                </div>
              )}
              
              {msg.files && msg.files.length > 0 && (
                <div className="mb-2 space-y-2">
                  {msg.files.map((file, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs bg-black/20 rounded p-2">
                      {file.type.startsWith('image/') ? (
                        <>
                          <img src={file.url} alt={file.name} className="h-12 w-12 object-cover rounded" />
                          <span className="truncate">{file.name}</span>
                        </>
                      ) : (
                        <>
                          <File className="h-4 w-4" />
                          <span className="truncate">{file.name}</span>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
              
              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-muted rounded-lg p-3 flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm text-muted-foreground">
                Orchestrating Mayza capabilities...
              </span>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t bg-background space-y-2">
        {/* File Preview */}
        {uploadedFiles.length > 0 && (
          <div className="flex flex-wrap gap-2 p-2 bg-muted/50 rounded-lg">
            {uploadedFiles.map((file, i) => (
              <div key={i} className="relative group">
                {file.type.startsWith('image/') ? (
                  <div className="relative">
                    <img 
                      src={file.url} 
                      alt={file.name} 
                      className="h-16 w-16 object-cover rounded border border-border"
                    />
                    <Button
                      size="icon"
                      variant="destructive"
                      className="absolute -top-2 -right-2 h-5 w-5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeFile(i)}
                      aria-label={`Remove ${file.name}`}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <div className="relative flex items-center gap-2 bg-background border border-border rounded px-3 py-2 pr-8">
                    <File className="h-4 w-4" />
                    <span className="text-xs truncate max-w-[100px]">{file.name}</span>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="absolute right-1 top-1 h-5 w-5"
                      onClick={() => removeFile(i)}
                      aria-label={`Remove ${file.name}`}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          <div className="flex gap-1">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,video/*,.pdf,.doc,.docx,.txt"
              className="hidden"
              onChange={(e) => handleFileUpload(e.target.files)}
              disabled={!isActive}
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
              disabled={!isActive}
              className="h-[60px] w-[60px]"
              aria-label="Attach files"
            >
              <Paperclip className="h-5 w-5" />
            </Button>
          </div>
          
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isActive ? "Tell me what you want to build or create..." : "Activate orchestrator to send messages..."}
            className="min-h-[60px] resize-none"
            disabled={isLoading || !isActive}
          />
          <Button
            type="button"
            onClick={(e) => sendMessage(e)}
            disabled={isLoading || !input.trim() || !isActive}
            size="icon"
            className={`h-[60px] w-[60px] ${
              isActive 
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700' 
                : 'bg-muted'
            }`}
            aria-label="Send message"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Press Enter to send • Shift+Enter for new line • Drag & drop files
        </p>
      </div>
    </Card>
  );
};
