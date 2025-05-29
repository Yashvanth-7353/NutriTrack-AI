
"use client";

import { useState, useRef, useEffect, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Bot, Loader2, Send, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { fssaiQuery } from '@/ai/flows/fssai-chat-flow';
import type { FssaiChatInput } from '@/ai/flows/fssai-chat-flow';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Scroll to bottom when messages change
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);
  
  useEffect(() => {
    // Add initial greeting message from AI
    setMessages([
      {
        id: Date.now().toString(),
        sender: 'ai',
        text: "Hello! I'm an AI assistant specialized in FSSAI guidelines. How can I help you today regarding food safety rules and regulations in India?",
        timestamp: new Date(),
      }
    ]);
  }, []);


  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const trimmedInput = inputValue.trim();
    if (!trimmedInput || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: trimmedInput,
      timestamp: new Date(),
    };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const input: FssaiChatInput = { query: trimmedInput };
      const result = await fssaiQuery(input);
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(), // Ensure unique ID
        sender: 'ai',
        text: result.response,
        timestamp: new Date(),
      };
      setMessages((prevMessages) => [...prevMessages, aiMessage]);

    } catch (error) {
      console.error("Error querying FSSAI chat flow:", error);
      toast({
        title: "Error",
        description: "Sorry, I couldn't process your request. Please try again.",
        variant: "destructive",
      });
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: "I'm having trouble connecting right now. Please try again in a moment.",
        timestamp: new Date(),
      };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  return (
    <div className="flex flex-col h-[60vh] max-h-[700px] border rounded-lg shadow-sm">
      <ScrollArea className="flex-grow p-4 space-y-4" ref={scrollAreaRef}>
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex items-end gap-2 ${
              message.sender === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {message.sender === 'ai' && (
              <Avatar className="h-8 w-8 self-start">
                <AvatarFallback className="bg-primary text-primary-foreground"><Bot size={18}/></AvatarFallback>
              </Avatar>
            )}
            <div
              className={`max-w-[75%] rounded-lg px-3 py-2 text-sm break-words ${
                message.sender === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              }`}
              style={{ whiteSpace: 'pre-line' }} // To respect newlines from AI
            >
              {message.text}
               <div className={`text-xs mt-1 ${message.sender === 'user' ? 'text-primary-foreground/70 text-right' : 'text-muted-foreground/70 text-left'}`}>
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
            {message.sender === 'user' && (
              <Avatar className="h-8 w-8 self-start">
                 <AvatarFallback className="bg-accent text-accent-foreground"><User size={18} /></AvatarFallback>
              </Avatar>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="flex items-center justify-start gap-2">
             <Avatar className="h-8 w-8 self-start">
                <AvatarFallback className="bg-primary text-primary-foreground"><Bot size={18}/></AvatarFallback>
              </Avatar>
            <div className="bg-muted text-muted-foreground rounded-lg px-3 py-2 text-sm flex items-center">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Thinking...
            </div>
          </div>
        )}
      </ScrollArea>
      <form onSubmit={handleSubmit} className="flex items-center p-3 border-t bg-background">
        <Input
          ref={inputRef}
          type="text"
          placeholder="Ask about FSSAI rules..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="flex-grow mr-2 text-base"
          disabled={isLoading}
          autoFocus
        />
        <Button type="submit" disabled={isLoading || !inputValue.trim()} size="icon">
          {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
          <span className="sr-only">Send</span>
        </Button>
      </form>
    </div>
  );
}
