import React, { useState, useRef, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import ResponsiveNavbar from '@/components/ResponsiveNavbar';
import BottomNavbar from '@/components/BottomNavbar';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Loader2, Sparkles, RotateCcw, Copy, Check, Trash2, Plus, MessageSquare, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import ReactMarkdown from 'react-markdown';
import {
  useConversations,
  useCreateConversation,
  useSaveMessage,
  useConversationMessages,
  useDeleteConversation,
} from '@/hooks/useConversations';

type Msg = { role: 'user' | 'assistant'; content: string };

const QUICK_PROMPTS = [
  "How do I stop procrastinating?",
  "Help me build discipline.",
  "How can I improve my confidence?",
  "Create a daily routine for me.",
];

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-chat`;

async function streamChat({
  messages,
  onDelta,
  onDone,
  onError,
  token,
}: {
  messages: Msg[];
  onDelta: (t: string) => void;
  onDone: () => void;
  onError: (e: string) => void;
  token: string;
}) {
  const resp = await fetch(CHAT_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ messages }),
  });

  if (!resp.ok) {
    const body = await resp.json().catch(() => ({ error: 'Request failed' }));
    onError(body.error || `Error ${resp.status}`);
    return;
  }

  if (!resp.body) { onError('No response body'); return; }

  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let buf = '';
  let done = false;

  while (!done) {
    const { done: d, value } = await reader.read();
    if (d) break;
    buf += decoder.decode(value, { stream: true });

    let idx: number;
    while ((idx = buf.indexOf('\n')) !== -1) {
      let line = buf.slice(0, idx);
      buf = buf.slice(idx + 1);
      if (line.endsWith('\r')) line = line.slice(0, -1);
      if (line.startsWith(':') || line.trim() === '') continue;
      if (!line.startsWith('data: ')) continue;
      const json = line.slice(6).trim();
      if (json === '[DONE]') { done = true; break; }
      try {
        const parsed = JSON.parse(json);
        const content = parsed.choices?.[0]?.delta?.content;
        if (content) onDelta(content);
      } catch {
        buf = line + '\n' + buf;
        break;
      }
    }
  }
  onDone();
}

const AskAI: React.FC = () => {
  const { user, session, loading: authLoading } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { toast } = useToast();

  const [activeConvoId, setActiveConvoId] = useState<string | null>(null);
  const [localMessages, setLocalMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const { data: conversations } = useConversations();
  const { data: dbMessages } = useConversationMessages(activeConvoId);
  const createConvo = useCreateConversation();
  const saveMsg = useSaveMessage();
  const deleteConvo = useDeleteConversation();

  // Sync DB messages to local state when loading a conversation
  useEffect(() => {
    if (dbMessages && activeConvoId) {
      setLocalMessages(dbMessages.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })));
    }
  }, [dbMessages, activeConvoId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [localMessages]);

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }
  if (!user) return <Navigate to="/auth" replace />;
  if (profile && !profile.onboarding_completed) return <Navigate to="/onboarding" replace />;

  const handleSend = async (text?: string) => {
    const msg = (text || input).trim();
    if (!msg || isStreaming || !session) return;
    if (msg.length > 4000) {
      toast({ title: 'Message too long', description: 'Max 4000 characters.', variant: 'destructive' });
      return;
    }

    setInput('');
    const userMsg: Msg = { role: 'user', content: msg };
    const allMessages = [...localMessages, userMsg];
    setLocalMessages(allMessages);
    setIsStreaming(true);

    // Create conversation if needed
    let convoId = activeConvoId;
    if (!convoId) {
      try {
        const convo = await createConvo.mutateAsync(msg.slice(0, 60));
        convoId = convo.id;
        setActiveConvoId(convoId);
      } catch {
        toast({ title: 'Error', description: 'Could not create conversation.', variant: 'destructive' });
        setIsStreaming(false);
        return;
      }
    }

    // Save user message
    saveMsg.mutate({ conversationId: convoId, role: 'user', content: msg });

    let assistantSoFar = '';
    const upsert = (chunk: string) => {
      assistantSoFar += chunk;
      setLocalMessages(prev => {
        const last = prev[prev.length - 1];
        if (last?.role === 'assistant') {
          return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantSoFar } : m));
        }
        return [...prev, { role: 'assistant', content: assistantSoFar }];
      });
    };

    await streamChat({
      messages: allMessages,
      onDelta: upsert,
      onDone: () => {
        setIsStreaming(false);
        if (assistantSoFar && convoId) {
          saveMsg.mutate({ conversationId: convoId, role: 'assistant', content: assistantSoFar });
        }
      },
      onError: (err) => {
        setIsStreaming(false);
        toast({ title: 'AI Error', description: err, variant: 'destructive' });
      },
      token: session.access_token,
    });
  };

  const handleCopy = (content: string, idx: number) => {
    navigator.clipboard.writeText(content);
    setCopiedId(String(idx));
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleNewChat = () => {
    setActiveConvoId(null);
    setLocalMessages([]);
    setInput('');
    setSidebarOpen(false);
  };

  const handleSelectConvo = (id: string) => {
    setActiveConvoId(id);
    setSidebarOpen(false);
  };

  const handleDeleteConvo = async (id: string) => {
    await deleteConvo.mutateAsync(id);
    if (activeConvoId === id) handleNewChat();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const hasMessages = localMessages.length > 0;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <ResponsiveNavbar />

      <div className="flex flex-1 pt-16 md:pt-20 pb-20 md:pb-0">
        {/* Sidebar - Conversations */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ x: -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              transition={{ type: 'spring', damping: 25 }}
              className="fixed inset-0 z-40 md:relative md:z-auto"
            >
              <div className="absolute inset-0 bg-background/80 backdrop-blur-sm md:hidden" onClick={() => setSidebarOpen(false)} />
              <div className="relative w-72 h-full bg-card border-r border-border flex flex-col z-10">
                <div className="p-4 border-b border-border flex items-center justify-between">
                  <span className="text-sm font-semibold">Conversations</span>
                  <Button variant="ghost" size="icon" onClick={handleNewChat}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                  {conversations?.map(c => (
                    <div
                      key={c.id}
                      className={`group flex items-center gap-2 px-3 py-2 rounded-xl cursor-pointer transition-colors ${
                        activeConvoId === c.id ? 'bg-accent text-accent-foreground' : 'hover:bg-muted'
                      }`}
                      onClick={() => handleSelectConvo(c.id)}
                    >
                      <MessageSquare className="w-4 h-4 shrink-0 text-muted-foreground" />
                      <span className="text-sm truncate flex-1">{c.title}</span>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteConvo(c.id); }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive" />
                      </button>
                    </div>
                  ))}
                  {(!conversations || conversations.length === 0) && (
                    <p className="text-xs text-muted-foreground text-center py-8">No conversations yet</p>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top bar */}
          <div className="flex items-center gap-2 px-4 py-3 border-b border-border/50">
            <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)} className="shrink-0">
              {sidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <MessageSquare className="w-4 h-4" />}
            </Button>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold">Future You AI</span>
            </div>
            {hasMessages && (
              <Button variant="ghost" size="sm" className="ml-auto text-xs" onClick={handleNewChat}>
                <Plus className="w-3.5 h-3.5 mr-1" /> New Chat
              </Button>
            )}
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 md:px-8 py-6">
            {!hasMessages ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center h-full max-w-lg mx-auto text-center gap-6"
              >
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold mb-2">Future You AI</h1>
                  <p className="text-sm text-muted-foreground">
                    Your personal life strategist. Ask about discipline, productivity, goals, mindset, or any area of self-improvement.
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full">
                  {QUICK_PROMPTS.map((p) => (
                    <motion.button
                      key={p}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleSend(p)}
                      className="text-left text-sm px-4 py-3 rounded-xl border border-border hover:border-primary/50 hover:bg-accent/50 transition-all text-muted-foreground"
                    >
                      {p}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            ) : (
              <div className="max-w-3xl mx-auto space-y-6">
                <AnimatePresence initial={false}>
                  {localMessages.map((msg, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      {msg.role === 'assistant' && (
                        <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                          <Sparkles className="w-4 h-4 text-primary" />
                        </div>
                      )}
                      <div
                        className={`max-w-[85%] md:max-w-[75%] rounded-2xl px-4 py-3 ${
                          msg.role === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-card border border-border'
                        }`}
                      >
                        {msg.role === 'assistant' ? (
                          <div className="prose prose-sm prose-invert max-w-none text-sm [&_p]:mb-2 [&_ul]:mb-2 [&_ol]:mb-2 [&_li]:mb-0.5">
                            <ReactMarkdown>{msg.content}</ReactMarkdown>
                          </div>
                        ) : (
                          <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-[10px] opacity-50">
                            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {msg.role === 'assistant' && (
                            <button onClick={() => handleCopy(msg.content, i)} className="opacity-50 hover:opacity-100 transition-opacity">
                              {copiedId === String(i) ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {isStreaming && localMessages[localMessages.length - 1]?.role !== 'assistant' && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
                    <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                    </div>
                    <div className="bg-card border border-border rounded-2xl px-4 py-3">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            )}
          </div>

          {/* Input Bar */}
          <div className="border-t border-border/50 px-4 md:px-8 py-4">
            <div className="max-w-3xl mx-auto">
              <div className="flex items-end gap-2 bg-card border border-border rounded-2xl px-4 py-2 focus-within:border-primary/50 transition-colors">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask me anything about your life, goals, discipline, focus..."
                  rows={1}
                  maxLength={4000}
                  className="flex-1 bg-transparent border-0 outline-none resize-none text-sm placeholder:text-muted-foreground py-2 max-h-32"
                  style={{ minHeight: '2.5rem' }}
                  disabled={isStreaming}
                />
                <Button
                  size="icon"
                  onClick={() => handleSend()}
                  disabled={!input.trim() || isStreaming}
                  className="shrink-0 rounded-xl h-9 w-9"
                >
                  {isStreaming ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </Button>
              </div>
              <p className="text-[10px] text-muted-foreground text-center mt-2">
                Future You AI can make mistakes. Consider verifying important information.
              </p>
            </div>
          </div>
        </div>
      </div>

      <BottomNavbar />
    </div>
  );
};

export default AskAI;
