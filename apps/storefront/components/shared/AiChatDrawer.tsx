'use client';

import React, { useState } from 'react';
import { Bot, X, Send, Sparkles } from 'lucide-react';
import { Button } from '@showroom/ui';

export function AiChatDrawer({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string }>>([
    {
      sender: 'ai',
      text: "Greetings. I am Apex Concierge AI. How may I assist your luxury vehicle search, test drive arrangement, or trade-in valuation today?",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userText = input;
    setInput('');
    setMessages((prev) => [...prev, { sender: 'user', text: userText }]);
    setLoading(true);

    try {
      const res = await fetch('http://localhost:3333/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: userText }),
      });
      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [...prev, { sender: 'ai', text: data.reply }]);
      } else {
        throw new Error();
      }
    } catch {
      // Fallback AI simulation if API is offline
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            sender: 'ai',
            text: "Based on our latest inventory specs, the Apex CyberSUV Ultra (850 HP V8 Hybrid) and Veloce Phantom Roadster GT (1020 HP Electric) are our top featured vehicles. Would you like to schedule a home test drive?",
          },
        ]);
      }, 500);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-[#0D0D0D] border-l border-[#3A3D42] h-full flex flex-col justify-between shadow-2xl">
        {/* Header */}
        <div className="p-4 bg-[#3A3D42]/60 border-b border-[#52565E]/40 flex items-center justify-between">
          <div className="flex items-center gap-2 text-[#F5A623]">
            <Bot className="w-5 h-5" />
            <span className="font-bold uppercase tracking-wider text-sm text-[#E8ECF1]">
              Apex AI Concierge
            </span>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chat Messages */}
        <div className="p-4 flex-1 overflow-y-auto space-y-4 text-xs">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-[12px] p-3 ${
                  m.sender === 'user'
                    ? 'bg-[#F5A623] text-[#0D0D0D] font-medium'
                    : 'bg-[#3A3D42] text-[#E8ECF1] border border-[#52565E]/40'
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-[#3A3D42] text-[#F5A623] p-3 rounded-[12px] flex items-center gap-2">
                <Sparkles className="w-4 h-4 animate-spin" /> Thinking...
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="p-4 border-t border-[#3A3D42] bg-[#0D0D0D] flex gap-2">
          <input
            type="text"
            placeholder="Ask about inventory, test drives, specs..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 bg-[#3A3D42] text-[#E8ECF1] placeholder-gray-400 text-xs rounded-[12px] px-3.5 py-2.5 outline-none border border-[#52565E]/40 focus:border-[#F5A623]"
          />
          <Button type="submit" variant="primary" size="sm">
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
