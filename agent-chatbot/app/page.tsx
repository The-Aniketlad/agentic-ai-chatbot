"use client";

import { useState, useRef, useEffect } from "react";
import FluidOrb from "@/components/ui/fluid-orb";

type Message = {
  role: "user" | "assistant";
  content: string;
  agentTitle?: string;
};

// Custom SVG Icons
function AtSignIcon() {
  return (
    <svg aria-hidden="true" width="15" height="15" viewBox="0 0 16 16" fill="none">
      <path
        d="M10.4 5.59963V8.59962C10.4 9.07701 10.5896 9.53485 10.9272 9.87242C11.2648 10.21 11.7226 10.3996 12.2 10.3996C12.6774 10.3996 13.1352 10.21 13.4728 9.87242C13.8104 9.53485 14 9.07701 14 8.59962V7.99962C13.9999 6.64544 13.5417 5.33111 12.7 4.27035C11.8582 3.20958 10.6823 2.46476 9.36359 2.15701C8.04484 1.84925 6.66076 1.99665 5.43641 2.57525C4.21206 3.15384 3.21944 4.1296 2.61996 5.34386C2.02048 6.55812 1.84939 7.93947 2.13451 9.26329C2.41963 10.5871 3.14419 11.7756 4.19038 12.6354C5.23657 13.4952 6.54286 13.9758 7.89684 13.9991C9.25083 14.0224 10.5729 13.587 11.648 12.7636M10.4 7.99962C10.4 9.32511 9.32549 10.3996 8 10.3996C6.67452 10.3996 5.6 9.32511 5.6 7.99962C5.6 6.67414 6.67452 5.59963 8 5.59963C9.32549 5.59963 10.4 6.67414 10.4 7.99962Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ArrowUpIcon() {
  return (
    <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M8 12.6667V3.33333M12.6667 8L8 3.33333L3.33333 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PaperclipIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
        d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
      />
    </svg>
  );
}

function AstraLogo({ className = "w-6 h-6", fill = "#ea580c" }: { className?: string; fill?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 40 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <clipPath id="astra-logo-clip">
        <path d="m0 0h40v48h-40z" />
      </clipPath>
      <g clipPath="url(#astra-logo-clip)" fill={fill}>
        <path d="m25.0887 5.05386-3.933-1.05386-3.3145 12.3696-2.9923-11.16736-3.9331 1.05386 3.233 12.0655-8.05262-8.0526-2.87919 2.8792 8.83271 8.8328-10.99975-2.9474-1.05385625 3.933 12.01860625 3.2204c-.1376-.5935-.2104-1.2119-.2104-1.8473 0-4.4976 3.646-8.1436 8.1437-8.1436 4.4976 0 8.1436 3.646 8.1436 8.1436 0 .6313-.0719 1.2459-.2078 1.8359l10.9227 2.9267 1.0538-3.933-12.0664-3.2332 11.0005-2.9476-1.0539-3.933-12.0659 3.233 8.0526-8.0526-2.8792-2.87916-8.7102 8.71026z" />
        <path d="m27.8723 26.2214c-.3372 1.4256-1.0491 2.7063-2.0259 3.7324l7.913 7.9131 2.8792-2.8792z" />
        <path d="m25.7665 30.0366c-.9886 1.0097-2.2379 1.7632-3.6389 2.1515l2.8794 10.746 3.933-1.0539z" />
        <path d="m21.9807 32.2274c-.65.1671-1.3313.2559-2.0334.2559-.7522 0-1.4806-.102-2.1721-.2929l-2.882 10.7558 3.933 1.0538z" />
        <path d="m17.6361 32.1507c-1.3796-.4076-2.6067-1.1707-3.5751-2.1833l-7.9325 7.9325 2.87919 2.8792z" />
        <path d="m13.9956 29.8973c-.9518-1.019-1.6451-2.2826-1.9751-3.6862l-10.95836 2.9363 1.05385 3.933z" />
      </g>
    </svg>
  );
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const isMountedRef = useRef(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [greeting, setGreeting] = useState("Good Evening");
  const [searchFilter, setSearchFilter] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 1. Mount: Hydrate client preferences seamlessly without SSR mismatch
  useEffect(() => {
    isMountedRef.current = true;

    // Restore saved theme
    const savedTheme = localStorage.getItem("astra_theme") as "dark" | "light" | null;
    const initialTheme = savedTheme || (window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");
    if (initialTheme !== "dark") {
      requestAnimationFrame(() => setTheme(initialTheme));
    }

    // Dynamic greeting based on user local time
    const hour = new Date().getHours();
    const localGreeting = hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening";
    if (localGreeting !== "Good Evening") {
      requestAnimationFrame(() => setGreeting(localGreeting));
    }

    // Restore chat history
    const savedHistory = localStorage.getItem("astra_chat_history");
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory);
        if (Array.isArray(parsed) && parsed.length > 0) {
          requestAnimationFrame(() => setMessages(parsed));
        }
      } catch (err) {
        console.error("Failed to restore history:", err);
      }
    }
  }, []);

  // 2. Persist chat history and auto-scroll
  useEffect(() => {
    if (isMountedRef.current && messages.length > 0) {
      localStorage.setItem("astra_chat_history", JSON.stringify(messages));
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // 3. Theme toggle
  function toggleTheme() {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("astra_theme", nextTheme);
  }

  // 4. Start fresh conversation (Local UI reset only, NEVER calls LLM)
  function handleNewChat() {
    setMessages([]);
    localStorage.removeItem("astra_chat_history");
    setInput("");
  }

  // Auto-resize textarea as user types
  function handleInput(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setInput(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = `${Math.min(e.target.scrollHeight, 180)}px`;
  }

  // Handle enter key (Enter to send, Shift+Enter for newline)
  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }

  // STRICT: Only sends what the user physically typed in `input`!
  // No overridePrompt parameter, zero automated triggers from other buttons.
  async function handleSubmit() {
    const promptToSend = input.trim();
    if (!promptToSend || isLoading) return;

    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    const newMessages: Message[] = [
      ...messages,
      { role: "user", content: promptToSend },
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

      const agentTitle = res.headers.get("X-Agent-Title") || undefined;

      // Add empty assistant response to stream into
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "", agentTitle },
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

  const isDark = theme === "dark";

  // Gradient tokens: Keep dark mode (#0b0714) 100% untouched; light mode uses gradient.css: linear-gradient(315deg, #845fe2 0%, #dec9ff 100%)
  const pageBg = isDark
    ? "bg-[#0b0714] text-[#ede8f5]"
    : "text-[#180f2d]";

  const headerBorder = isDark ? "border-purple-900/30 bg-[#0e0a18]/60" : "border-white/30 bg-white/45 backdrop-blur-xl";

  // Sidebar: Distinct frosted glass panel with structured sections
  const sidebarGlass = isDark
    ? "bg-[#0f091c]/85 border-purple-500/15 text-[#e5dff0]"
    : "bg-white/80 border-white/40 text-[#251b36] shadow-xl";

  // Search/Prompt bar: Elevated glowing glassmorphic card with BorderBeam
  const promptCardBg = isDark
    ? "bg-[#140e24]/90 text-[#f5efff]"
    : "bg-white/95 text-[#180f2d]";

  // Static chips (decorative, no pointer click triggers)
  const chipGlass = isDark
    ? "bg-white/[0.06] border-white/10 text-[#d4cbde]"
    : "bg-purple-900/[0.06] border-purple-900/15 text-[#3b2b52]";

  // 3 Feature Cards styling (purely informational showcase, no click trigger)
  const featureCardClass = `p-4 rounded-2xl border transition-all duration-300 text-left select-none cursor-default backdrop-blur-xl ${
    isDark
      ? "bg-[#130c22]/75 border-purple-500/15 shadow-lg shadow-purple-950/20"
      : "bg-white/85 border-white/60 shadow-lg shadow-purple-900/10 text-[#1f1530]"
  }`;

  return (
    <div
      suppressHydrationWarning
      className={`flex h-screen w-full overflow-hidden font-sans transition-colors duration-300 relative ${pageBg}`}
      style={
        !isDark
          ? {
              backgroundColor: "#845fe2",
              backgroundImage: "linear-gradient(315deg, #845fe2 0%, #dec9ff 100%)",
            }
          : undefined
      }
    >
      {/* 🔮 Ambient Purple Aura Background Layer (from purple.css) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div
          className={`absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full blur-[140px] opacity-40 transition-all duration-700 ${
            isDark ? "bg-[#9f4ac9]/30" : "bg-white/20"
          }`}
        />
        <div
          className={`absolute -bottom-40 -left-40 w-[650px] h-[650px] rounded-full blur-[160px] opacity-35 transition-all duration-700 ${
            isDark ? "bg-[#7e4cc9]/30" : "bg-purple-300/25"
          }`}
        />
        <div
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full blur-[180px] ${
            isDark
              ? "bg-gradient-to-r from-purple-600/10 via-fuchsia-600/10 to-indigo-600/10 opacity-30"
              : "bg-white/15 opacity-20"
          }`}
        />
      </div>

      {/* 1. Left Glassmorphic Sidebar */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 flex flex-col justify-between w-64 border-r backdrop-blur-2xl transition-all duration-300 ease-in-out z-20 ${sidebarGlass} ${
          isSidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full md:-ml-64 shadow-none"
        }`}
      >
        <div className="flex flex-col p-3 space-y-3">
          {/* Brand & Collapse Button */}
          <div className="flex items-center justify-between px-2 py-1">
            <div className="flex items-center gap-2.5">
              <AstraLogo className="w-6 h-6 select-none flex-shrink-0" fill="#ea580c" />
              <span className="font-semibold text-base tracking-tight select-none">Astra AI</span>
            </div>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="p-1.5 rounded-lg opacity-70 hover:opacity-100 transition hover:bg-white/10"
              title="Close sidebar"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            </button>
          </div>

          {/* Search Chats Input */}
          <div className="relative">
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Search chats"
              className={`w-full px-3 py-1.5 pl-8 rounded-xl text-xs border outline-none transition placeholder:opacity-50 ${
                isDark
                  ? "bg-white/[0.04] border-white/10 focus:border-purple-500/50 text-white"
                  : "bg-purple-50/60 border-purple-200 focus:border-purple-400 text-purple-950"
              }`}
            />
            <svg
              className="w-3.5 h-3.5 absolute left-2.5 top-2.5 opacity-50"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <circle cx="11" cy="11" r="7" strokeWidth="2" />
              <path strokeLinecap="round" strokeWidth="2" d="M21 21l-4.35-4.35" />
            </svg>
            <span className="absolute right-2.5 top-2 text-[10px] opacity-40 font-mono">⌘</span>
          </div>

          {/* Quick Action: New Chat (Future expandable section) */}
          <div className="pt-1">
            <button
              onClick={handleNewChat}
              className={`flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl text-xs font-medium transition shadow-sm ${
                isDark
                  ? "bg-purple-500/15 border border-purple-500/30 text-white hover:bg-purple-500/25"
                  : "bg-purple-100 border border-purple-200 text-purple-950 hover:bg-purple-200/70"
              }`}
            >
              <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              <span>New Chat</span>
            </button>
          </div>

          {/* Recent Sessions List */}
          <div className="flex flex-col space-y-1.5 pt-3">
            <div className="flex items-center justify-between px-2 select-none">
              <span className="text-[10px] font-bold tracking-wider uppercase opacity-50">
                Recent Sessions
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>

            <div
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium select-none cursor-default border ${
                messages.length > 0
                  ? isDark
                    ? "bg-purple-500/10 border-purple-500/30 text-white"
                    : "bg-purple-100/70 border-purple-300 text-purple-950"
                  : "border-transparent opacity-60"
              }`}
            >
              <svg className="w-3.5 h-3.5 flex-shrink-0 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span className="truncate">
                {messages.length > 0
                  ? messages.find((m) => m.role === "user")?.content || "Active Session"
                  : "No conversation yet"}
              </span>
            </div>
          </div>
        </div>

        {/* Sidebar Footer: Settings & Preferences Area */}
        <div className={`p-3 border-t ${isDark ? "border-purple-900/30" : "border-purple-200/50"}`}>
          <div
            className={`flex items-center justify-between px-3 py-2 rounded-xl border text-xs font-medium select-none cursor-default ${
              isDark
                ? "bg-white/[0.03] border-white/5"
                : "bg-purple-50/50 border-purple-100"
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-sm">⚙️</span>
              <span>Settings & Tools</span>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono">v1.0</span>
          </div>
        </div>
      </aside>

      {/* 2. Main Content Area */}
      <div className="flex-1 flex flex-col h-full relative overflow-hidden z-10">
        {/* Top Header */}
        <header className={`flex items-center justify-between px-4 py-3 border-b backdrop-blur-xl transition-colors ${headerBorder}`}>
          <div className="flex items-center gap-3">
            {!isSidebarOpen && (
              <button
                onClick={() => setIsSidebarOpen(true)}
                className={`p-1.5 rounded-xl border backdrop-blur-md transition ${
                  isDark
                    ? "border-purple-500/20 bg-white/5 hover:bg-white/10"
                    : "border-purple-200 bg-white hover:bg-purple-50"
                }`}
                title="Open sidebar"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            )}

            {/* Model / Assistant Indicator (Static visual badge) */}
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border backdrop-blur-md text-xs font-semibold select-none cursor-default ${chipGlass}`}>
              <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
              <span>Astra AI Assistant</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Theme Toggle in Header (Allowed functional button) */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-full border backdrop-blur-md transition ${
                isDark
                  ? "border-purple-500/20 bg-white/5 hover:bg-white/10 text-amber-300"
                  : "border-white/30 bg-white/80 hover:bg-white text-purple-700 shadow-sm"
              }`}
              title="Toggle theme"
            >
              {isDark ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
          </div>
        </header>

        {/* 3. Messages Feed OR Axora-Style Centered Hero Screen */}
        <div className="flex-1 overflow-y-auto px-4 md:px-6">
          {messages.length === 0 ? (
            /* STATE A: Axora-Style Layout (Orb + Dynamic Greeting at top, Floating Search Bar & 3 Feature Cards at Bottom) */
            <div className="flex flex-col justify-between min-h-[calc(100vh-80px)] max-w-4xl w-full mx-auto px-2 py-6">
              {/* Upper Section: Luminous 3D Orb + Dynamic Greeting */}
              <div className="flex flex-col items-center justify-center pt-8 md:pt-12 pb-4 text-center my-auto select-none">
                {/* Fluid Dynamic WebGL Orb */}
                <div className="relative mb-3 flex items-center justify-center select-none">
                  {/* Subtle soft cosmic ambient glow behind fluid orb */}
                  <div
                    className="absolute w-52 h-52 rounded-full blur-3xl pointer-events-none opacity-35 transition-all duration-700"
                    style={{
                      background: isDark
                        ? "radial-gradient(circle, #9f4ac9 0%, #7e4cc9 65%, transparent 100%)"
                        : "radial-gradient(circle, #845fe2 0%, #dec9ff 65%, transparent 100%)",
                    }}
                  />

                  <FluidOrb
                    size={200}
                    color={isDark ? "#9f4ac9" : "#845fe2"}
                    className="shadow-2xl shadow-purple-950/30"
                  />
                </div>

                <h1 className="text-3xl md:text-5xl font-medium tracking-tight mb-2">
                  {greeting}, Aniket.
                </h1>
                <p className="text-xl md:text-2xl font-light opacity-80">
                  Can I help you with anything ?
                </p>
              </div>

              {/* Lower Section: Pure Floating Search Bar + 3 Feature Cards Directly Beneath It */}
              <div className="w-full mt-auto pt-4 pb-2">
                {/* 1. Pure Floating Glassmorphic Search Bar (No background rectangle) */}
                <div
                  className={`w-full rounded-[24px] p-3.5 md:p-4 backdrop-blur-2xl border transition-all shadow-xl hover:shadow-2xl mb-4 ${promptCardBg} ${
                    isDark
                      ? "border-purple-500/20 shadow-purple-950/20"
                      : "border-white/70 shadow-purple-950/15"
                  }`}
                >
                  {/* Top Action Row (Static visual badges, NO click triggers) */}
                  <div className="flex items-center gap-2 mb-2 select-none">
                    <div
                      className={`inline-flex items-center gap-1.5 h-6 px-2.5 rounded-full text-xs font-medium border cursor-default ${chipGlass}`}
                    >
                      <AtSignIcon />
                      <span className="text-[11px]">Focus Agent</span>
                    </div>

                    <span
                      className={`text-[11px] font-mono cursor-default transition-colors ${
                        isDark ? "text-purple-300/60" : "text-purple-950/70 font-medium"
                      }`}
                    >
                      Astra Multi-Agent Supervisor
                    </span>
                  </div>

                  {/* Textarea (FUNCTIONAL: User types here - high contrast & immediately visible on theme switch) */}
                  <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={handleInput}
                    onKeyDown={handleKeyDown}
                    rows={2}
                    placeholder="Message Astra AI or ask anything..."
                    className={`w-full bg-transparent resize-none outline-none text-sm md:text-base leading-relaxed py-1 px-1 transition-colors duration-200 ${
                      isDark
                        ? "text-zinc-100 placeholder:text-zinc-400 placeholder:opacity-90"
                        : "text-[#180f2d] placeholder:text-[#523d70] placeholder:opacity-90 font-medium"
                    }`}
                  />

                  {/* Bottom Controls Row: Visual Chips & ONLY Send Arrow is Functional */}
                  <div className="flex items-center justify-between pt-3 border-t border-white/5">
                    {/* Static visual chips (NO click events, NO token consumption) */}
                    <div className="flex items-center gap-2 flex-wrap select-none cursor-default">
                      <div
                        className={`p-1.5 rounded-full border ${chipGlass}`}
                        title="File Analysis Ready"
                      >
                        <PaperclipIcon />
                      </div>

                      <div
                        className={`inline-flex items-center gap-1.5 h-7 px-3 rounded-full text-xs font-medium border ${chipGlass}`}
                      >
                        <svg className="w-3.5 h-3.5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <circle cx="10.5" cy="10.5" r="6.5" strokeWidth="2" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 16l4 4" />
                        </svg>
                        <span>Search the web</span>
                      </div>

                      <div
                        className={`inline-flex items-center gap-1.5 h-7 px-3 rounded-full text-xs font-medium border ${chipGlass}`}
                      >
                        <span className="text-purple-400">💻</span>
                        <span>Write code</span>
                      </div>

                      <div
                        className={`inline-flex items-center gap-1.5 h-7 px-3 rounded-full text-xs font-medium border ${chipGlass}`}
                      >
                        <span className="text-orange-400">📄</span>
                        <span>Summarize</span>
                      </div>
                    </div>

                    {/* Submit Pill Button (FUNCTIONAL: Only clicking this sends the typed prompt) */}
                    <button
                      onClick={() => handleSubmit()}
                      disabled={!input.trim() || isLoading}
                      style={
                        input.trim() && !isLoading
                          ? { background: "linear-gradient(315deg, #9f4ac9 0%, #7e4cc9 100%)" }
                          : undefined
                      }
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-all flex-shrink-0 ${
                        input.trim() && !isLoading
                          ? "text-white shadow-lg shadow-purple-900/50 hover:scale-105 cursor-pointer"
                          : isDark
                          ? "bg-white/10 text-white/30 cursor-not-allowed"
                          : "bg-purple-100 text-purple-300 cursor-not-allowed"
                      }`}
                      title="Send prompt"
                    >
                      <ArrowUpIcon />
                    </button>
                  </div>
                </div>

                {/* 2. Three Feature Cards (PURELY INFORMATIONAL, NO click triggers, ZERO token consumption) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 w-full">
                  {/* Card 1: Multi-Agent Squad */}
                  <div className={featureCardClass}>
                    <div className="flex items-center justify-between mb-1.5">
                      <h3 className="font-semibold text-sm">
                        Multi-Agent Squad
                      </h3>
                      <span className="text-sm">🤖</span>
                    </div>
                    <p className="text-xs opacity-60 leading-relaxed">
                      5 specialized autonomous agents for coding, web research, document analysis, summarization, and natural conversation.
                    </p>
                  </div>

                  {/* Card 2: 3-Tier LLM Cascade */}
                  <div className={featureCardClass}>
                    <div className="flex items-center justify-between mb-1.5">
                      <h3 className="font-semibold text-sm">
                        Fail-Safe Cascade
                      </h3>
                      <span className="text-sm">⚡</span>
                    </div>
                    <p className="text-xs opacity-60 leading-relaxed">
                      Uninterrupted intelligence with automated failover transitioning seamlessly across Groq ➔ OpenRouter ➔ Local Offline Ollama.
                    </p>
                  </div>

                  {/* Card 3: Autonomous Live Tools */}
                  <div className={featureCardClass}>
                    <div className="flex items-center justify-between mb-1.5">
                      <h3 className="font-semibold text-sm">
                        Autonomous Tools
                      </h3>
                      <span className="text-sm">🔧</span>
                    </div>
                    <p className="text-xs opacity-60 leading-relaxed">
                      Autonomous tool-calling loop executing live web search with Tavily, real-time timezone clock, calculator, and dataset analysis.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* STATE B: Active Conversation Stream */
            <div className="max-w-3xl mx-auto py-6 space-y-6">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
                >
                  {/* Active Agent Badge */}
                  {msg.role === "assistant" && msg.agentTitle && (
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold text-purple-400 mb-1.5 ml-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
                      <span>{msg.agentTitle}</span>
                    </div>
                  )}

                  {/* Message Bubble */}
                  <div
                    style={
                      msg.role === "user"
                        ? { background: "linear-gradient(315deg, #9f4ac9 0%, #7e4cc9 100%)" }
                        : undefined
                    }
                    className={`max-w-[88%] md:max-w-[82%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                      msg.role === "user"
                        ? "text-white rounded-br-sm shadow-lg shadow-purple-950/30"
                        : `${
                            isDark
                              ? "bg-[#140e24]/80 border-purple-500/20 text-[#ede8f5]"
                              : "bg-white/80 border-purple-200/80 text-[#251b36]"
                          } border backdrop-blur-md rounded-bl-sm shadow-md`
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex items-center gap-2 text-xs text-purple-400 ml-1">
                  <div className="w-2 h-2 rounded-full bg-purple-500 animate-ping" />
                  <span>Astra AI is thinking & streaming...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* 4. Bottom Sticky Composer with Glassmorphism & BorderBeam (Active Conversation) */}
        {messages.length > 0 && (
          <footer className={`p-4 border-t backdrop-blur-xl transition-colors ${headerBorder}`}>
            <div className="max-w-3xl mx-auto shadow-xl">
              <div
                className={`w-full rounded-[22px] p-3 backdrop-blur-2xl border transition-all flex items-end gap-2 ${promptCardBg} ${
                  isDark ? "border-purple-500/20 shadow-purple-950/20" : "border-white/70 shadow-purple-950/10"
                }`}
              >
                {/* Decorative At icon (static) */}
                <div
                  className={`h-7 w-7 rounded-full flex items-center justify-center border flex-shrink-0 select-none cursor-default ${chipGlass}`}
                >
                  <AtSignIcon />
                </div>

                {/* Textarea (FUNCTIONAL - high contrast & immediately visible on theme switch) */}
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={handleInput}
                  onKeyDown={handleKeyDown}
                  rows={1}
                  placeholder="Ask Astra AI anything..."
                  disabled={isLoading}
                  className={`flex-1 bg-transparent resize-none outline-none text-sm leading-relaxed max-h-36 px-2 py-1 transition-colors duration-200 ${
                    isDark
                      ? "text-zinc-100 placeholder:text-zinc-400 placeholder:opacity-90"
                      : "text-[#180f2d] placeholder:text-[#523d70] placeholder:opacity-90 font-medium"
                  }`}
                />

                {/* Submit Button (FUNCTIONAL) */}
                <button
                  onClick={() => handleSubmit()}
                  disabled={!input.trim() || isLoading}
                  style={
                    input.trim() && !isLoading
                      ? { background: "linear-gradient(315deg, #9f4ac9 0%, #7e4cc9 100%)" }
                      : undefined
                  }
                  className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center transition-all ${
                    input.trim() && !isLoading
                      ? "text-white shadow-lg shadow-purple-900/50 hover:scale-105 cursor-pointer"
                      : isDark
                      ? "bg-white/10 text-white/30 cursor-not-allowed"
                      : "bg-purple-100 text-purple-300 cursor-not-allowed"
                  }`}
                  title="Send prompt"
                >
                  <ArrowUpIcon />
                </button>
              </div>
            </div>
          </footer>
        )}
      </div>
    </div>
  );
}
