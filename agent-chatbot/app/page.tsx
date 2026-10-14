"use client";

import { useState, useRef, useEffect } from "react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

const INITIAL_MESSAGE: Message = {
  role: "assistant",
  content: "Hello Aniket! I'm your AI Assistant. How can I help you today?",
};

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1. Mount hone par localStorage se purani memory load karo
  useEffect(() => {
    setIsMounted(true);
    const saved = localStorage.getItem("agent_chat_history");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
        }
      } catch (err) {
        console.error("Failed to restore history:", err);
      }
    }
  }, []);

  // 2. Har naye message par localStorage me save karo
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("agent_chat_history", JSON.stringify(messages));
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isMounted]);

  // 3. "New Chat" clear function
  function handleNewChat() {
    if (typeof window !== "undefined" && window.confirm("Are you sure you want to clear this conversation?")) {
      setMessages([INITIAL_MESSAGE]);
      localStorage.removeItem("agent_chat_history");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userText = input.trim();
    setInput("");

    const newMessages: Message[] = [
      ...messages,
      { role: "user", content: userText },
    ];

    setMessages(newMessages);
    setIsLoading(true);

    try {
      const apiMessages = newMessages.map(({ role, content }) => ({
        role,
        content,
      }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages }),
      });

      if (!res.ok) {
        throw new Error(`API returned ${res.status}: ${res.statusText}`);
      }

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "" },
      ]);

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) throw new Error("No readable stream available");

      let accumulatedText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        accumulatedText += chunk;

        setMessages((prev) => {
          const updated = [...prev];
          const lastIndex = updated.length - 1;
          if (lastIndex >= 0 && updated[lastIndex].role === "assistant") {
            updated[lastIndex] = {
              ...updated[lastIndex],
              content: accumulatedText,
            };
          }
          return updated;
        });
      }
    } catch (err: unknown) {
      const error = err as { message?: string };
      console.error("Streaming error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `⚠️ Error: ${error.message || "Failed to generate response."}`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-screen bg-zinc-950 text-zinc-100 font-sans">
      {/* Sleek Minimal Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-zinc-800/80 bg-zinc-900/40 backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse" />
          <h1 className="font-medium text-base tracking-tight text-zinc-200">AI Assistant</h1>
        </div>

        {/* New Chat Button */}
        <button
          onClick={handleNewChat}
          className="text-xs px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-zinc-200 transition"
          title="Start a new clean chat"
        >
          + New Chat
        </button>
      </header>

      {/* Messages Feed */}
      <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 max-w-3xl w-full mx-auto">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex flex-col ${
              msg.role === "user" ? "items-end" : "items-start"
            }`}
          >
            {/* Clean Chat Bubble */}
            <div
              className={`max-w-[85%] md:max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                msg.role === "user"
                  ? "bg-indigo-600 text-white rounded-br-sm shadow-sm"
                  : "bg-zinc-900 border border-zinc-800/80 text-zinc-200 rounded-bl-sm shadow-sm"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-zinc-500 ml-1">
            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
            <span>Thinking...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </main>

      {/* Input Area */}
      <footer className="p-4 border-t border-zinc-800/80 bg-zinc-900/20 backdrop-blur">
        <form
          onSubmit={handleSubmit}
          className="max-w-3xl mx-auto flex items-center gap-3"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            disabled={isLoading}
            className="flex-1 bg-zinc-900/90 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/50 transition disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium text-sm px-6 py-3 rounded-xl transition duration-200 shadow-sm"
          >
            Send
          </button>
        </form>
      </footer>
    </div>
  );
}
