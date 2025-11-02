import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, X, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "¡Hola! Soy tu tutor virtual de la Maestría en Circulación Pulmonar. ¿En qué puedo ayudarte hoy?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (user && isOpen) {
      loadChatHistory();
    }
  }, [user, isOpen]);

  const loadChatHistory = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })
        .limit(20);

      if (error) throw error;

      if (data && data.length > 0) {
        const chatMessages: Message[] = data.map(msg => ({
          role: msg.role as "user" | "assistant",
          content: msg.content
        }));
        setMessages([messages[0], ...chatMessages]);
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  };

  const saveChatMessage = async (role: string, content: string) => {
    if (!user) return;

    try {
      await supabase
        .from('chat_messages')
        .insert({
          user_id: user.id,
          role,
          content
        });
    } catch (error) {
      console.error('Error saving message:', error);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || loading || !user) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    // Guardar mensaje del usuario
    await saveChatMessage("user", input);

    try {
      // Preparar historial de mensajes para el AI
      const messageHistory = messages.slice(1).concat([userMessage]).map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      // Llamar a la edge function de AI
      const { data, error } = await supabase.functions.invoke('ai-tutor', {
        body: { messages: messageHistory }
      });

      if (error) {
        if (error.message?.includes('429')) {
          toast({
            title: "Límite alcanzado",
            description: "Demasiadas solicitudes. Por favor intenta más tarde.",
            variant: "destructive",
          });
          return;
        }
        throw error;
      }

      // Leer la respuesta streaming
      const reader = data.getReader();
      const decoder = new TextDecoder();
      let aiResponse = "";
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                aiResponse += content;
                // Actualizar mensaje en tiempo real
                setMessages((prev) => {
                  const newMessages = [...prev];
                  const lastMessage = newMessages[newMessages.length - 1];
                  if (lastMessage?.role === 'assistant') {
                    lastMessage.content = aiResponse;
                  } else {
                    newMessages.push({ role: 'assistant', content: aiResponse });
                  }
                  return newMessages;
                });
              }
            } catch (e) {
              // Ignorar errores de parsing
            }
          }
        }
      }

      // Guardar respuesta del asistente
      if (aiResponse) {
        await saveChatMessage("assistant", aiResponse);
      }

    } catch (error: any) {
      console.error('AI error:', error);
      const errorMessage: Message = {
        role: "assistant",
        content: "Lo siento, hubo un error al procesar tu pregunta. Por favor intenta de nuevo.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full btn-gradient-primary shadow-lg glow-primary z-50"
          size="icon"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[500px] glass-card z-50 flex flex-col animate-scale-in">
          {/* Header */}
          <div className="p-4 border-b border-border flex items-center justify-between bg-gradient-primary rounded-t-lg">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              <span className="font-semibold">Tutor Virtual MLCP</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="hover:bg-white/10"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message, idx) => (
              <div
                key={idx}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-lg p-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-border">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                placeholder="Escribe tu pregunta..."
                className="bg-background/50"
                disabled={loading}
              />
              <Button
                onClick={handleSend}
                className="btn-gradient-primary"
                size="icon"
                disabled={loading || !input.trim()}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatBot;