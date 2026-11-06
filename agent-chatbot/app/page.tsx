"use client";

import { useState, useRef, useEffect } from "react";
import FluidOrb from "@/components/ui/fluid-orb";
import {
  BotIcon,
  UsersIcon,
  type UsersIconHandle,
  ZapIcon,
  type ZapIconHandle,
  WrenchIcon,
  type WrenchIconHandle,
  ArrowUpIcon,
  type ArrowUpIconHandle,
} from "@animateicons/react/lucide";
import { ModelPicker } from "@/components/ui/model-picker";
import { FileUploadCard, UploadedFile } from "@/components/ui/file-upload-card";
import { AccountSettingsDropdown } from "@/components/ui/account-settings-dropdown";
import { ClearHistoryDropdown } from "@/components/ui/clear-history-dropdown";
import { ApiKeysModal } from "@/components/ui/api-keys-modal";
import { AiResponseSettingsModal } from "@/components/ui/ai-response-settings-modal";
import {
  PersonalizationModal,
  type FontDensity,
} from "@/components/ui/personalization-modal";
import { KeyboardShortcutsModal } from "@/components/ui/keyboard-shortcuts-modal";
import { TokenUsageBadge } from "@/components/ui/token-usage-badge";
import {
  AgentUsageModal,
  DEFAULT_TELEMETRY,
  createDefaultTelemetry,
  checkAndResetDailyTelemetry,
  type AgentTelemetryData,
} from "@/components/ui/agent-usage-modal";
import { PromptAttachments } from "@/components/ui/prompt-attachments";
import {
  MessageAttachments,
  type MessageAttachmentMeta,
} from "@/components/ui/message-attachments";
import { AgentThinking } from "@/components/application/agent-thinking/agent-thinking";
import {
  ChatHistorySkeleton,
  SidebarSessionSkeleton,
} from "@/components/ui/skeleton";
import { ChatContextMenu } from "@/components/ui/chat-context-menu";

export type Message = {
  role: "user" | "assistant";
  content: string;
  agentTitle?: string;
  attachments?: MessageAttachmentMeta[];
};

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
  isPinned?: boolean;
}

function hexToRgb(hex: string): string {
  const cleanHex = hex.replace("#", "");
  if (cleanHex.length === 3) {
    const r = parseInt(cleanHex[0] + cleanHex[0], 16);
    const g = parseInt(cleanHex[1] + cleanHex[1], 16);
    const b = parseInt(cleanHex[2] + cleanHex[2], 16);
    return `${r}, ${g}, ${b}`;
  }
  const r = parseInt(cleanHex.substring(0, 2), 16) || 168;
  const g = parseInt(cleanHex.substring(2, 4), 16) || 85;
  const b = parseInt(cleanHex.substring(4, 6), 16) || 247;
  return `${r}, ${g}, ${b}`;
}

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

const FOCUS_AGENTS_CONFIG = {
  researcher: {
    label: "Search the web",
    title: "Research Analyst Agent",
    icon: (
      <svg className="w-3.5 h-3.5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <circle cx="10.5" cy="10.5" r="6.5" strokeWidth="2" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 16l4 4" />
      </svg>
    ),
    badgeDark: "bg-blue-500/25 text-blue-200 border-blue-400/40 shadow-[0_0_12px_rgba(59,130,246,0.3)]",
    badgeLight: "bg-blue-100 text-blue-900 border-blue-300 shadow-sm",
    textColorDark: "text-blue-400",
    textColorLight: "text-blue-700",
  },
  coder: {
    label: "Write code",
    title: "Software Engineer Agent",
    icon: <span className="text-purple-400 text-xs">💻</span>,
    badgeDark: "bg-purple-500/25 text-purple-200 border-purple-400/40 shadow-[0_0_12px_rgba(168,85,247,0.3)]",
    badgeLight: "bg-purple-100 text-purple-900 border-purple-300 shadow-sm",
    textColorDark: "text-purple-400",
    textColorLight: "text-purple-700",
  },
  summarizer: {
    label: "Summarize",
    title: "Executive Summarizer Agent",
    icon: <span className="text-orange-400 text-xs">📄</span>,
    badgeDark: "bg-amber-500/25 text-amber-200 border-amber-400/40 shadow-[0_0_12px_rgba(245,158,11,0.3)]",
    badgeLight: "bg-amber-100 text-amber-900 border-amber-300 shadow-sm",
    textColorDark: "text-amber-400",
    textColorLight: "text-amber-700",
  },
} as const;

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const activeSessionIdRef = useRef<string | null>(null);
  activeSessionIdRef.current = activeSessionId;
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSessionLoading, setIsSessionLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const isMountedRef = useRef(false);
  const isHydratingRef = useRef(true);
  const [contextMenu, setContextMenu] = useState<{
    sessionId: string;
    x: number;
    y: number;
    isPinned: boolean;
  } | null>(null);
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [greeting, setGreeting] = useState("Good Afternoon");
  const [searchFilter, setSearchFilter] = useState("");
  const [selectedProvider, setSelectedProvider] = useState<"groq" | "openrouter" | "auto" | "custom">("groq");
  const [selectedModel, setSelectedModel] = useState<string>("openai/gpt-oss-20b");
  const [activeFocusAgent, setActiveFocusAgent] = useState<"researcher" | "coder" | "summarizer" | null>(null);
  const [hasCustomAgentKey, setHasCustomAgentKey] = useState(false);
  const [isFileUploadOpen, setIsFileUploadOpen] = useState(false);
  const [isApiKeysModalOpen, setIsApiKeysModalOpen] = useState(false);
  const [isResponseSettingsOpen, setIsResponseSettingsOpen] = useState(false);
  const [isPersonalizationModalOpen, setIsPersonalizationModalOpen] = useState(false);
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState(false);
  const [isAgentUsageModalOpen, setIsAgentUsageModalOpen] = useState(false);
  const [telemetryData, setTelemetryData] = useState<AgentTelemetryData>(DEFAULT_TELEMETRY);
  const [accentColor, setAccentColor] = useState<string>("#a855f7");
  const [fontDensity, setFontDensity] = useState<FontDensity>("default");
  const [userName, setUserName] = useState<string>("Aniket Lad");
  const [userDomain, setUserDomain] = useState<string>("developer");
  const [attachedFiles, setAttachedFiles] = useState<UploadedFile[]>([]);
  const [activeTrigger, setActiveTrigger] = useState<"hero" | "footer">("hero");
  const paperclipBtnRef = useRef<HTMLButtonElement>(null);
  const footerPaperclipBtnRef = useRef<HTMLButtonElement>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const botIconRef = useRef<{ startAnimation: () => void; stopAnimation: () => void } | null>(null);
  const squadIconRef = useRef<UsersIconHandle>(null);
  const cascadeIconRef = useRef<ZapIconHandle>(null);
  const toolsIconRef = useRef<WrenchIconHandle>(null);
  const heroSendIconRef = useRef<ArrowUpIconHandle>(null);
  const footerSendIconRef = useRef<ArrowUpIconHandle>(null);
  const typingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Handle adding new files and auto-extracting text & previews (PDFs, docs, images, code)
  async function handleFilesChange(newFiles: File[]) {
    const formattedFiles: UploadedFile[] = newFiles.map((file) => {
      const isImg = file.type.startsWith("image/");
      const isPdf = file.type === "application/pdf" || file.name.endsWith(".pdf");
      const kind = isImg ? "image" : isPdf ? "pdf" : "document";
      return {
        id: `${file.name}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        file,
        progress: 30,
        status: "uploading",
        kind,
      };
    });

    setAttachedFiles((prev) => [...prev, ...formattedFiles]);

    // Process each file asynchronously so text and thumbnails are ready
    for (const item of formattedFiles) {
      const file = item.file;
      try {
        if (file.type.startsWith("image/")) {
          const reader = new FileReader();
          reader.onload = (e) => {
            const dataUrl = e.target?.result as string;
            setAttachedFiles((prev) =>
              prev.map((f) =>
                f.id === item.id
                  ? {
                      ...f,
                      progress: 100,
                      status: "completed",
                      dataUrl,
                      extractedText: `[Image File: "${file.name}" (${(file.size / 1024).toFixed(1)} KB)]`,
                    }
                  : f
              )
            );
          };
          reader.readAsDataURL(file);
        } else if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
          const formData = new FormData();
          formData.append("file", file);
          const res = await fetch("/api/parse-document", {
            method: "POST",
            body: formData,
          });
          if (res.ok) {
            const data = await res.json();
            setAttachedFiles((prev) =>
              prev.map((f) =>
                f.id === item.id
                  ? {
                      ...f,
                      progress: 100,
                      status: "completed",
                      extractedText: data.text,
                      kind: "pdf",
                    }
                  : f
              )
            );
          } else {
            throw new Error("Failed to parse PDF document");
          }
        } else {
          // Plain text / code / csv / markdown
          const text = await file.text();
          setAttachedFiles((prev) =>
            prev.map((f) =>
              f.id === item.id
                ? {
                    ...f,
                    progress: 100,
                    status: "completed",
                    extractedText: text,
                    kind: "document",
                  }
                : f
            )
          );
        }
      } catch (err) {
        console.warn("File processing error:", err);
        setAttachedFiles((prev) =>
          prev.map((f) =>
            f.id === item.id
              ? {
                  ...f,
                  progress: 100,
                  status: "completed",
                  extractedText: `[Attached Document: "${file.name}"]`,
                }
              : f
          )
        );
      }
    }
  }

  // Typewriter effect for prompt bar suggestion chips (Only inputs to prompt bar, does not send)
  function handleChipClick(promptText: string, focusAgent?: "researcher" | "coder" | "summarizer") {
    if (focusAgent) {
      setActiveFocusAgent(focusAgent);
    }
    if (typingTimerRef.current) {
      clearInterval(typingTimerRef.current);
    }

    let i = 0;
    setInput("");
    typingTimerRef.current = setInterval(() => {
      i++;
      setInput(promptText.slice(0, i));
      if (i >= promptText.length) {
        if (typingTimerRef.current) clearInterval(typingTimerRef.current);
        textareaRef.current?.focus();
      }
    }, 15);
  }

  function handleSelectSession(session: ChatSession) {
    if (activeSessionId === session.id) return;
    setIsSessionLoading(true);
    activeSessionIdRef.current = session.id;
    setActiveSessionId(session.id);
    setMessages(session.messages);
    setInput("");
    setAttachedFiles([]);
    setIsFileUploadOpen(false);
    if (typeof window !== "undefined") {
      localStorage.setItem("astra_active_session_id", session.id);
      localStorage.setItem("astra_chat_history", JSON.stringify(session.messages));
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      }
    }
    setTimeout(() => {
      setIsSessionLoading(false);
    }, 220);
  }

  function handleDeleteSession(e: React.MouseEvent, id: string) {
    e.stopPropagation();
    setSessions((prev) => {
      const remaining = prev.filter((s) => s.id !== id);
      if (typeof window !== "undefined") {
        localStorage.setItem("astra_chat_sessions", JSON.stringify(remaining));
      }
      return remaining;
    });
    if (activeSessionId === id || activeSessionIdRef.current === id) {
      activeSessionIdRef.current = null;
      setActiveSessionId(null);
      setMessages([]);
      if (typeof window !== "undefined") {
        localStorage.setItem("astra_active_session_id", "new");
        localStorage.removeItem("astra_chat_history");
      }
    }
  }

  function handleTogglePin(id: string) {
    setSessions((prev) => {
      const updated = prev.map((s) => (s.id === id ? { ...s, isPinned: !s.isPinned } : s));
      if (typeof window !== "undefined") {
        localStorage.setItem("astra_chat_sessions", JSON.stringify(updated));
      }
      return updated;
    });
  }

  function handleStartRename(session: ChatSession) {
    setEditingSessionId(session.id);
    setEditingTitle(session.title);
  }

  function handleSaveRename(id: string) {
    if (!editingTitle.trim()) {
      setEditingSessionId(null);
      return;
    }
    setSessions((prev) => {
      const updated = prev.map((s) => (s.id === id ? { ...s, title: editingTitle.trim() } : s));
      if (typeof window !== "undefined") {
        localStorage.setItem("astra_chat_sessions", JSON.stringify(updated));
      }
      return updated;
    });
    setEditingSessionId(null);
  }

  function handleClearAllSessions() {
    setSessions([]);
    setActiveSessionId(null);
    activeSessionIdRef.current = null;
    setMessages([]);
    if (typeof window !== "undefined") {
      localStorage.removeItem("astra_chat_sessions");
      localStorage.removeItem("astra_chat_history");
      localStorage.setItem("astra_active_session_id", "new");
    }
  }

  // Smooth progress animation simulation (0% -> 100%)
  useEffect(() => {
    const uploadingFiles = attachedFiles.filter((f) => f.status === "uploading");
    if (uploadingFiles.length === 0) return;

    const interval = setInterval(() => {
      setAttachedFiles((prev) =>
        prev.map((f) => {
          if (f.status === "uploading") {
            const nextProgress = Math.min(f.progress + 30, 100);
            return {
              ...f,
              progress: nextProgress,
              status: nextProgress >= 100 ? "completed" : "uploading",
            };
          }
          return f;
        })
      );
    }, 200);

    return () => clearInterval(interval);
  }, [attachedFiles]);

  function handleFileRemove(id: string) {
    setAttachedFiles((prev) => prev.filter((f) => f.id !== id));
  }

  function handleResetTelemetry() {
    const resetData = createDefaultTelemetry();
    setTelemetryData(resetData);
    if (typeof window !== "undefined") {
      localStorage.setItem("astra_agent_telemetry", JSON.stringify(resetData));
    }
  }

  async function handleRefreshTelemetry() {
    try {
      const res = await fetch("/api/telemetry", { cache: "no-store" });
      const data = await res.json();

      setTelemetryData((prev) => {
        const { data: verified } = checkAndResetDailyTelemetry(prev);
        if (data && data.success && data.openrouter && data.openrouter.used === 0) {
          verified.providers.openrouter = 0;
        }
        if (typeof window !== "undefined") {
          localStorage.setItem("astra_agent_telemetry", JSON.stringify(verified));
        }
        return { ...verified };
      });
    } catch (err) {
      console.warn("Failed to refresh telemetry from API:", err);
    }
  }

  // 1. Mount: Hydrate client preferences cleanly without hydration mismatch
  useEffect(() => {
    isMountedRef.current = true;
    setIsMounted(true);

    // Trigger welcoming bot animation shortly after mount
    const botTimer = setTimeout(() => {
      botIconRef.current?.startAnimation();
    }, 600);

    // Calculate client local greeting safely inside useEffect (satisfies Next.js 16 prerender rule)
    const hour = new Date().getHours();
    setGreeting(hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening");

    // Restore saved theme and personalization
    const savedTheme = localStorage.getItem("astra_theme");
    if (savedTheme === "system") {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      applyTheme(prefersDark ? "dark" : "light");
    } else if (savedTheme === "light" || savedTheme === "dark") {
      applyTheme(savedTheme);
    }

    const savedDensity = (localStorage.getItem("astra_font_density") as FontDensity) || "default";
    setFontDensity(savedDensity);

    const savedAccent = localStorage.getItem("astra_accent_color") || "#a855f7";
    setAccentColor(savedAccent);
    document.documentElement.style.setProperty("--astra-accent", savedAccent);
    document.documentElement.style.setProperty("--astra-accent-rgb", hexToRgb(savedAccent));

    const savedBattery = localStorage.getItem("astra_battery_saver") === "true";
    if (savedBattery) {
      document.documentElement.classList.add("battery-saver");
    }

    const savedName = localStorage.getItem("astra_user_name");
    if (savedName && savedName.trim()) {
      setUserName(savedName.trim());
    }

    const savedDomain = localStorage.getItem("astra_user_domain");
    if (savedDomain && savedDomain.trim()) {
      setUserDomain(savedDomain.trim());
    }

    // Hydrate custom agent key status
    const storedCustomAgentKey = localStorage.getItem("astra_custom_agent_key");
    setHasCustomAgentKey(Boolean(storedCustomAgentKey && storedCustomAgentKey.trim()));

    // Restore Chat Sessions (with automatic deduplication of duplicate sessions)
    const savedSessions = localStorage.getItem("astra_chat_sessions");
    const savedActiveId = localStorage.getItem("astra_active_session_id");

    if (savedSessions) {
      try {
        const parsed = JSON.parse(savedSessions);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // De-duplicate duplicate sessions that have identical content
          const uniqueSessions: ChatSession[] = [];
          const seenFingerprints = new Set<string>();

          for (const s of parsed) {
            if (!s || !s.id) continue;
            const firstMsg = s.messages?.find((m: Message) => m.role === "user")?.content || "";
            const fingerprint = `${s.title}__${s.messages?.length || 0}__${firstMsg.slice(0, 80)}`;
            if (!seenFingerprints.has(fingerprint)) {
              seenFingerprints.add(fingerprint);
              uniqueSessions.push(s);
            }
          }

          const cleanedList = uniqueSessions.length > 0 ? uniqueSessions : parsed;
          setSessions(cleanedList);

          // Respect user state on refresh: if user was in New Chat, DO NOT force-load old chats!
          if (savedActiveId === "new" || savedActiveId === null || savedActiveId === "") {
            activeSessionIdRef.current = null;
            setActiveSessionId(null);
            setMessages([]);
          } else {
            const activeSession = cleanedList.find((s) => s.id === savedActiveId);
            if (activeSession) {
              activeSessionIdRef.current = activeSession.id;
              setActiveSessionId(activeSession.id);
              setMessages(activeSession.messages || []);
            } else {
              // Target session was not found, stay on fresh New Chat
              activeSessionIdRef.current = null;
              setActiveSessionId(null);
              setMessages([]);
            }
          }

          if (cleanedList.length !== parsed.length) {
            localStorage.setItem("astra_chat_sessions", JSON.stringify(cleanedList));
          }
        }
      } catch (err) {
        console.error("Failed to restore sessions:", err);
      }
    } else {
      // Migrate legacy astra_chat_history if available and user didn't request New Chat
      if (savedActiveId !== "new") {
        const savedHistory = localStorage.getItem("astra_chat_history");
        if (savedHistory) {
          try {
            const parsed = JSON.parse(savedHistory);
            if (Array.isArray(parsed) && parsed.length > 0) {
              const initialSession: ChatSession = {
                id: `session_${Date.now()}`,
                title: parsed.find((m: Message) => m.role === "user")?.content.slice(0, 32) || "Active Conversation",
                messages: parsed,
                createdAt: Date.now(),
                updatedAt: Date.now(),
              };
              setSessions([initialSession]);
              activeSessionIdRef.current = initialSession.id;
              setActiveSessionId(initialSession.id);
              setMessages(parsed);
              localStorage.setItem("astra_chat_sessions", JSON.stringify([initialSession]));
              localStorage.setItem("astra_active_session_id", initialSession.id);
            }
          } catch (err) {
            console.error("Failed to restore history:", err);
          }
        }
      }
    }

    // Release hydration lock after initial state stabilizes
    const hydrationTimer = setTimeout(() => {
      isHydratingRef.current = false;
    }, 200);

    // Restore Agent Telemetry with daily auto-refresh (resets to 100% on new day or after break)
    const savedTelemetry = localStorage.getItem("astra_agent_telemetry");
    let currentTelemetryData: AgentTelemetryData | null = null;
    if (savedTelemetry) {
      try {
        const parsed = JSON.parse(savedTelemetry);
        if (parsed && typeof parsed.totalTokensUsed === "number") {
          // If browser has old hardcoded 57240 mock data, purge it so user sees real 100% available
          if (parsed.totalTokensUsed === 57240) {
            currentTelemetryData = null;
          } else {
            currentTelemetryData = parsed;
          }
        }
      } catch (err) {
        console.error("Failed to restore telemetry:", err);
      }
    }

    // Auto-check 00:00 UTC rollover:
    // If user returns after days/weeks or on a new calendar day, this automatically resets to 100% full quota!
    const { data: verifiedTelemetry, wasReset } = checkAndResetDailyTelemetry(currentTelemetryData);
    setTelemetryData(verifiedTelemetry);
    localStorage.setItem("astra_agent_telemetry", JSON.stringify(verifiedTelemetry));
    if (wasReset) {
      console.log("✦ Daily Token Quota automatically refreshed to 100% for UTC date:", verifiedTelemetry.lastResetDate);
    }

    // Periodic UTC rollover check (every 30 seconds) + on window focus (e.g. user resumes tab next morning)
    function verifyUtcMidnightRollover() {
      setTelemetryData((prev) => {
        const { data: checked, wasReset: didReset } = checkAndResetDailyTelemetry(prev);
        if (didReset) {
          localStorage.setItem("astra_agent_telemetry", JSON.stringify(checked));
          console.log("✦ Daily Token Quota automatically refreshed to 100% for new UTC date:", checked.lastResetDate);
        }
        return didReset ? checked : prev;
      });
    }

    const rolloverInterval = setInterval(verifyUtcMidnightRollover, 30000);
    window.addEventListener("focus", verifyUtcMidnightRollover);

    // Verify live provider telemetry
    fetch("/api/telemetry")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.success && data.openrouter) {
          console.log("✦ Real-time provider telemetry verified:", data.openrouter);
        }
      })
      .catch(() => {});

    return () => {
      clearTimeout(botTimer);
      clearTimeout(hydrationTimer);
      clearInterval(rolloverInterval);
      window.removeEventListener("focus", verifyUtcMidnightRollover);
    };
  }, []);

  // 2. Persist chat history, active session, and auto-scroll
  useEffect(() => {
    if (isHydratingRef.current || !isMountedRef.current || messages.length === 0) return;

    localStorage.setItem("astra_chat_history", JSON.stringify(messages));
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

    // Auto-sync current conversation thread into sessions list and localStorage
    setSessions((prev) => {
      const currentId = activeSessionIdRef.current;
      if (!currentId) return prev; // Do NOT generate unlinked sessions on arbitrary message updates

      const firstUserMsg = messages.find((m) => m.role === "user")?.content || "Conversation";
      const title = firstUserMsg.slice(0, 36) || "New Conversation";

      const exists = prev.some((s) => s.id === currentId);
      let updatedList: ChatSession[];
      if (exists) {
        updatedList = prev.map((s) =>
          s.id === currentId
            ? {
                ...s,
                messages,
                updatedAt: Date.now(),
                title: s.title === "New Conversation" ? title : s.title,
              }
            : s
        );
      } else {
        updatedList = [
          {
            id: currentId,
            title,
            messages,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          },
          ...prev,
        ];
      }

      if (typeof window !== "undefined") {
        localStorage.setItem("astra_chat_sessions", JSON.stringify(updatedList));
      }
      return updatedList;
    });
  }, [messages]);

  // 3. Theme application helper
  function applyTheme(nextTheme: "dark" | "light") {
    setTheme(nextTheme);
    if (nextTheme === "light") {
      document.documentElement.classList.add("light");
      document.documentElement.classList.remove("dark");
      document.documentElement.style.backgroundColor = "#845fe2";
      document.documentElement.style.backgroundImage = "linear-gradient(315deg, #845fe2 0%, #dec9ff 100%)";
    } else {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
      document.documentElement.style.backgroundColor = "#0b0714";
      document.documentElement.style.backgroundImage = "none";
    }
  }

  // Manual theme toggle
  function toggleTheme() {
    const nextTheme = theme === "dark" ? "light" : "dark";
    localStorage.setItem("astra_theme", nextTheme);
    applyTheme(nextTheme);
  }

  // 4. Start fresh conversation (Safely keeps previous sessions intact in sidebar!)
  function handleNewChat() {
    activeSessionIdRef.current = null;
    setActiveSessionId(null);
    setMessages([]);
    setInput("");
    setAttachedFiles([]);
    setIsFileUploadOpen(false);
    if (typeof window !== "undefined") {
      localStorage.setItem("astra_active_session_id", "new");
      localStorage.removeItem("astra_chat_history");
    }
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

  // Global Keyboard Shortcuts Listener (Industry Standard: Mac Cmd / Windows Ctrl)
  useEffect(() => {
    function handleGlobalKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      const isInput =
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable);

      const isMac =
        typeof window !== "undefined" &&
        /Mac|iPhone|iPad|iPod/.test(navigator.platform || navigator.userAgent);
      const modifier = isMac ? e.metaKey : e.ctrlKey;

      // 1. Esc: Close active modals
      if (e.key === "Escape") {
        setIsShortcutsModalOpen(false);
        setIsPersonalizationModalOpen(false);
        setIsApiKeysModalOpen(false);
        setIsResponseSettingsOpen(false);
        setIsFileUploadOpen(false);
        setIsAgentUsageModalOpen(false);
        return;
      }

      // 2. Cmd/Ctrl + K: Toggle Keyboard Shortcuts Modal
      if (modifier && (e.key.toLowerCase() === "k" || e.code === "KeyK") && !e.shiftKey) {
        e.preventDefault();
        setIsShortcutsModalOpen((prev) => !prev);
        return;
      }

      // 3. Cmd/Ctrl + Shift + O: New Chat
      if (modifier && e.shiftKey && (e.key.toLowerCase() === "o" || e.code === "KeyO")) {
        e.preventDefault();
        handleNewChat();
        return;
      }

      // 4. Cmd/Ctrl + B: Toggle History Sidebar
      if (modifier && !e.shiftKey && (e.key.toLowerCase() === "b" || e.code === "KeyB")) {
        e.preventDefault();
        setIsSidebarOpen((prev) => !prev);
        return;
      }

      // 5. Cmd/Ctrl + Shift + D: Toggle Theme
      if (modifier && e.shiftKey && (e.key.toLowerCase() === "d" || e.code === "KeyD")) {
        e.preventDefault();
        toggleTheme();
        return;
      }

      // 6. Cmd/Ctrl + ,: Open Settings / Personalization
      if (modifier && (e.key === "," || e.code === "Comma")) {
        e.preventDefault();
        setIsPersonalizationModalOpen(true);
        return;
      }

      // 7. Cmd/Ctrl + U: Toggle File Attach & Upload
      if (modifier && !e.shiftKey && (e.key.toLowerCase() === "u" || e.code === "KeyU")) {
        e.preventDefault();
        setIsFileUploadOpen((prev) => !prev);
        return;
      }

      // 8. Cmd/Ctrl + Shift + K: Open Custom API Keys (BYOK)
      if (modifier && e.shiftKey && (e.key.toLowerCase() === "k" || e.code === "KeyK")) {
        e.preventDefault();
        setIsApiKeysModalOpen(true);
        return;
      }

      // 9. Cmd/Ctrl + Shift + T: Open AI Response Settings
      if (modifier && e.shiftKey && (e.key.toLowerCase() === "t" || e.code === "KeyT")) {
        e.preventDefault();
        setIsResponseSettingsOpen(true);
        return;
      }

      // 10. Cmd/Ctrl + Shift + A: Open Agent Token Usage & Telemetry
      if (modifier && e.shiftKey && (e.key.toLowerCase() === "a" || e.code === "KeyA")) {
        e.preventDefault();
        setIsAgentUsageModalOpen((prev) => !prev);
        return;
      }

      // 10. Standalone '/' (outside inputs) or Cmd/Ctrl + '/': Focus prompt bar
      if (!isInput && e.key === "/" && !modifier && !e.shiftKey) {
        e.preventDefault();
        textareaRef.current?.focus();
        return;
      }
      if (modifier && (e.key === "/" || e.code === "Slash")) {
        e.preventDefault();
        textareaRef.current?.focus();
        return;
      }
    }

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => {
      window.removeEventListener("keydown", handleGlobalKeyDown);
    };
  }, [theme]);

  // STRICT: Sends user's typed prompt + extracted document contents to LLM
  async function handleSubmit() {
    let promptToSend = input.trim();
    if (!promptToSend && attachedFiles.length === 0) return;
    if (isLoading) return;

    // Convert attached files into structured MessageAttachmentMeta
    const currentAttachments: MessageAttachmentMeta[] = attachedFiles.map((f) => ({
      id: f.id,
      name: f.file.name,
      size: f.file.size,
      type: f.file.type,
      kind: (f.kind as any) || "document",
      dataUrl: f.dataUrl,
      extractedText: f.extractedText,
    }));

    // If attachments have extracted text, build comprehensive LLM document context
    let llmPrompt = promptToSend;
    if (currentAttachments.length > 0) {
      const docTexts = currentAttachments
        .filter((a) => a.extractedText && a.extractedText.trim())
        .map(
          (a) =>
            `[DOCUMENT ATTACHMENT: "${a.name}" (${(a.size / 1024).toFixed(1)} KB)]\n${a.extractedText}\n[END OF DOCUMENT]`
        )
        .join("\n\n");

      if (docTexts) {
        llmPrompt = promptToSend
          ? `${promptToSend}\n\n--- ATTACHED DOCUMENTS ---\n${docTexts}\n--- END OF ATTACHMENTS ---`
          : `Please analyze the attached document:\n\n${docTexts}`;
      }
    }

    setAttachedFiles([]);
    setIsFileUploadOpen(false);

    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    // Ensure an active session ID exists for this conversation
    let currentSessionId = activeSessionIdRef.current;
    if (!currentSessionId) {
      currentSessionId = `session_${Date.now()}`;
      activeSessionIdRef.current = currentSessionId;
      setActiveSessionId(currentSessionId);
      if (typeof window !== "undefined") {
        localStorage.setItem("astra_active_session_id", currentSessionId);
      }
    }

    const newMessages: Message[] = [
      ...messages,
      {
        role: "user",
        content: promptToSend || (currentAttachments.length > 0 ? "Attached document for analysis" : ""),
        attachments: currentAttachments.length > 0 ? currentAttachments : undefined,
      },
    ];

    setMessages(newMessages);
    setIsLoading(true);

    try {
      const apiMessages = newMessages.map((m, idx) => {
        // Active turn sends expanded prompt with full document text
        if (idx === newMessages.length - 1 && m.role === "user") {
          return { role: m.role, content: llmPrompt };
        }
        return { role: m.role, content: m.content };
      });

      const customGroqKey = typeof window !== "undefined" ? localStorage.getItem("astra_custom_groq_key") || undefined : undefined;
      const customOpenRouterKey = typeof window !== "undefined" ? localStorage.getItem("astra_custom_openrouter_key") || undefined : undefined;
      const customAgentKey = typeof window !== "undefined" ? localStorage.getItem("astra_custom_agent_key") || undefined : undefined;
      const temperature = typeof window !== "undefined" && localStorage.getItem("astra_ai_temperature") ? parseFloat(localStorage.getItem("astra_ai_temperature")!) : 0.7;
      const tone = typeof window !== "undefined" ? localStorage.getItem("astra_ai_tone") || "friendly" : "friendly";
      const customInstructions = typeof window !== "undefined" ? localStorage.getItem("astra_ai_custom_instructions") || undefined : undefined;
      const showReasoning = typeof window !== "undefined" ? localStorage.getItem("astra_ai_show_reasoning") !== "false" : true;

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: apiMessages,
          preferredProvider: selectedProvider,
          preferredModel: selectedModel,
          focusAgent: activeFocusAgent || undefined,
          customGroqKey,
          customOpenRouterKey,
          customAgentKey,
          temperature,
          tone,
          customInstructions,
          showReasoning,
        }),
      });

      if (!res.ok) {
        throw new Error(`API returned ${res.status}: ${res.statusText}`);
      }

      const agentTitle = res.headers.get("X-Agent-Title") || undefined;
      const rawTotalTokens = parseInt(res.headers.get("X-Total-Tokens") || "0", 10);
      const respProvider = res.headers.get("X-Provider") || selectedProvider;
      const respAgent = res.headers.get("X-Agent") || "";

      // Fallback estimate if API response didn't supply usage (e.g. mock or fast route)
      const estimatedPromptTokens = Math.max(1, Math.ceil(promptToSend.length / 4));
      const effectiveTotalTokens = rawTotalTokens > 0 ? rawTotalTokens : (estimatedPromptTokens + 120);

      setTelemetryData((prev) => {
        // Guarantee daily quota is refreshed if UTC day crossed before adding new tokens
        const { data: baseTelemetry } = checkAndResetDailyTelemetry(prev);

        let agentKey: "coder" | "researcher" | "summarizer" | "supervisor" = "supervisor";
        if (activeFocusAgent) {
          agentKey = activeFocusAgent;
        } else if (respAgent.toLowerCase().includes("engineer") || respAgent.toLowerCase().includes("coder")) {
          agentKey = "coder";
        } else if (respAgent.toLowerCase().includes("research")) {
          agentKey = "researcher";
        } else if (respAgent.toLowerCase().includes("summar")) {
          agentKey = "summarizer";
        }

        let providerKey: "groq" | "openrouter" | "custom" = "groq";
        if (respProvider === "openrouter") providerKey = "openrouter";
        else if (respProvider === "custom") providerKey = "custom";

        const currentAgent = baseTelemetry.agents[agentKey] || { tokens: 0, prompts: 0, name: agentKey };
        const updated: AgentTelemetryData = {
          ...baseTelemetry,
          totalTokensUsed: baseTelemetry.totalTokensUsed + effectiveTotalTokens,
          promptsCount: baseTelemetry.promptsCount + 1,
          agents: {
            ...baseTelemetry.agents,
            [agentKey]: {
              ...currentAgent,
              tokens: currentAgent.tokens + effectiveTotalTokens,
              prompts: currentAgent.prompts + 1,
            },
          },
          providers: {
            ...baseTelemetry.providers,
            [providerKey]: (baseTelemetry.providers[providerKey] || 0) + effectiveTotalTokens,
          },
        };

        if (typeof window !== "undefined") {
          localStorage.setItem("astra_agent_telemetry", JSON.stringify(updated));
        }

        return updated;
      });

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


  // Sidebar: Distinct frosted glass panel from sidebarglass.css (blur 32px + specular lines)
  const sidebarGlass = "sidebar-glass-theme";

  // Search/Prompt bar: Elevated glowing glassmorphic card (from glass.css)
  const promptCardBg = "glass-card-theme";

  // Static chips (decorative, frosted glass pills)
  const chipGlass = "chip-glass-theme";

  // 3 Feature Cards styling (glassmorphism from glass.css)
  const featureCardClass =
    "p-3 md:p-3.5 rounded-2xl transition-all duration-300 text-left select-none cursor-default glass-card-theme";

  return (
    <div
      id="app-root"
      suppressHydrationWarning
      className="flex h-screen w-full overflow-hidden font-sans relative"
    >
      {/* 🔮 Ambient Purple Aura Background Layer (from purple.css) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div
          className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full blur-[140px] opacity-40 transition-all duration-700 aura-blob-1"
        />
        <div
          className="absolute -bottom-40 -left-40 w-[650px] h-[650px] rounded-full blur-[160px] opacity-35 transition-all duration-700 aura-blob-2"
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full blur-[180px] aura-blob-3"
        />
      </div>

      {/* 1. Left Glassmorphic Sidebar */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 flex flex-col justify-between w-64 transition-all duration-300 ease-in-out z-20 ${sidebarGlass} ${
          isSidebarOpen
            ? "translate-x-0 shadow-2xl opacity-100 visible"
            : "-translate-x-full md:-ml-64 shadow-none opacity-0 invisible pointer-events-none"
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
              className="w-full px-3 py-1.5 pl-8 rounded-xl text-xs border outline-none transition sidebar-search-input"
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
              className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl text-xs font-medium transition shadow-sm sidebar-newchat-btn"
            >
              <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              <span>New Chat</span>
            </button>
          </div>

          {/* Recent Sessions List */}
          <div className="flex flex-col space-y-1 pt-3 flex-1 overflow-y-auto max-h-[calc(100vh-320px)] no-scrollbar">
            <div className="flex items-center justify-between px-2 select-none min-h-[22px] mb-1">
              <span className="text-[10px] font-bold tracking-wider uppercase opacity-50">
                Recent Sessions {sessions.length > 0 && `(${sessions.length})`}
              </span>
              {sessions.length > 0 && (
                <ClearHistoryDropdown onClearAll={handleClearAllSessions} isDark={isDark} />
              )}
            </div>

            {!isMounted ? (
              <SidebarSessionSkeleton />
            ) : sessions.filter((s) => !searchFilter || s.title.toLowerCase().includes(searchFilter.toLowerCase())).length === 0 ? (
              <div className="px-3 py-2 text-xs opacity-50 select-none flex items-center gap-2">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <span>No conversation yet</span>
              </div>
            ) : (
              sessions
                .filter((s) => !searchFilter || s.title.toLowerCase().includes(searchFilter.toLowerCase()))
                .sort((a, b) => {
                  if (a.isPinned && !b.isPinned) return -1;
                  if (!a.isPinned && b.isPinned) return 1;
                  return (b.updatedAt || 0) - (a.updatedAt || 0);
                })
                .map((session) => {
                  const isActive = activeSessionId === session.id;
                  return (
                    <div
                      key={session.id}
                      onClick={() => handleSelectSession(session)}
                      onContextMenu={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setContextMenu({
                          sessionId: session.id,
                          x: e.clientX,
                          y: e.clientY,
                          isPinned: Boolean(session.isPinned),
                        });
                      }}
                      className={`group flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium cursor-pointer transition-all duration-150 border ${
                        isActive
                          ? isDark
                            ? "bg-purple-500/20 border-purple-500/40 text-white shadow-xs"
                            : "bg-white border-purple-300 text-purple-950 shadow-xs font-semibold"
                          : isDark
                          ? "border-transparent hover:bg-white/5 text-purple-200/70 hover:text-white"
                          : "border-transparent hover:bg-purple-100/60 text-purple-900/70 hover:text-purple-950"
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1 mr-1.5">
                        {session.isPinned ? (
                          <svg
                            className="w-3.5 h-3.5 shrink-0 animate-in fade-in-0 duration-200"
                            style={{ color: accentColor }}
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <title>Pinned chat</title>
                            <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v2a2 2 0 01-.586 1.414L16 11v6l2 2v1H6v-1l2-2v-6L5.586 8.414A2 2 0 015 7V5z" />
                          </svg>
                        ) : (
                          <svg
                            className={`w-3.5 h-3.5 shrink-0 ${isActive ? "text-purple-400" : "opacity-50"}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                        )}

                        {editingSessionId === session.id ? (
                          <input
                            type="text"
                            value={editingTitle}
                            onChange={(e) => setEditingTitle(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleSaveRename(session.id);
                              if (e.key === "Escape") setEditingSessionId(null);
                            }}
                            onBlur={() => handleSaveRename(session.id)}
                            onClick={(e) => e.stopPropagation()}
                            autoFocus
                            className="w-full bg-white/10 dark:bg-black/40 px-1.5 py-0.5 rounded text-xs outline-none border border-purple-400/50 text-white"
                          />
                        ) : (
                          <span className="truncate">{session.title}</span>
                        )}
                      </div>

                      {/* Right-hand Action Buttons: 3-dots Menu + Quick Trash */}
                      <div className="flex items-center gap-0.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            const rect = e.currentTarget.getBoundingClientRect();
                            setContextMenu({
                              sessionId: session.id,
                              x: rect.right + 4,
                              y: rect.top,
                              isPinned: Boolean(session.isPinned),
                            });
                          }}
                          className="opacity-0 group-hover:opacity-70 hover:!opacity-100 p-1 rounded-md transition-opacity cursor-pointer hover:bg-white/10"
                          title="More options (Pin, Rename, Delete)"
                        >
                          <svg className="w-3.5 h-3.5 opacity-80" fill="currentColor" viewBox="0 0 24 24">
                            <circle cx="12" cy="5" r="1.5" />
                            <circle cx="12" cy="12" r="1.5" />
                            <circle cx="12" cy="19" r="1.5" />
                          </svg>
                        </button>

                        <button
                          type="button"
                          onClick={(e) => handleDeleteSession(e, session.id)}
                          className="opacity-0 group-hover:opacity-60 hover:!opacity-100 p-1 rounded-md transition-opacity cursor-pointer shrink-0 hover:bg-red-500/10"
                          title="Delete chat"
                        >
                          <svg className="w-3.5 h-3.5 text-red-400 hover:text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  );
                })
            )}
          </div>
        </div>

        {/* Sidebar Footer: Account & Settings */}
        <div className="p-3 border-t border-purple-500/15">
          <AccountSettingsDropdown
            isDark={isDark}
            accentColor={accentColor}
            userName={userName}
            userDomain={userDomain}
            onOpenApiKeys={() => setIsApiKeysModalOpen(true)}
            onOpenResponseSettings={() => setIsResponseSettingsOpen(true)}
            onOpenPersonalization={() => setIsPersonalizationModalOpen(true)}
            onOpenShortcuts={() => setIsShortcutsModalOpen(true)}
            onOpenUsage={() => setIsAgentUsageModalOpen(true)}
          />
        </div>
      </aside>

      {/* 2. Main Content Area */}
      <div className="flex-1 flex flex-col h-full relative overflow-hidden z-10">
        {/* Top Header (Floating, no background rectangle bar) */}
        <header className="flex items-center justify-between px-4 py-3 bg-transparent z-20">
          <div className="flex items-center gap-3">
            {!isSidebarOpen && (
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="p-1.5 rounded-xl backdrop-blur-md transition header-open-btn"
                title="Open sidebar"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            )}

            {/* Model / Assistant Indicator (Interactive animated Bot badge) */}
            <div
              onMouseEnter={() => botIconRef.current?.startAnimation()}
              onMouseLeave={() => botIconRef.current?.stopAnimation()}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl backdrop-blur-md text-xs font-semibold select-none cursor-default group transition-all duration-200 ${chipGlass}`}
            >
              <BotIcon
                ref={botIconRef}
                size={16}
                duration={1}
                color={isDark ? "#a78bfa" : "#7c3aed"}
                className="flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
              />
              <span>Astra AI Assistant</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Morphing Glass Theme Toggle (Raycast / Vercel Style) */}
            <button
              onClick={toggleTheme}
              className="theme-toggle-btn"
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
              aria-label="Toggle theme"
            >
              {/* Sun Icon (Visible in Dark Mode -> click switches to light) */}
              <span className="theme-toggle-icon dark-only">
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="4" fill="currentColor" fillOpacity="0.25" />
                  <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
                </svg>
              </span>
              {/* Moon Icon (Visible in Light Mode -> click switches to dark) */}
              <span className="theme-toggle-icon light-only">
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path
                    d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
                    fill="currentColor"
                    fillOpacity="0.2"
                  />
                </svg>
              </span>
            </button>
          </div>
        </header>

        {/* 3. Messages Feed OR Axora-Style Centered Hero Screen */}
        <div
          className={`flex-1 px-4 md:px-6 flex flex-col ${
            messages.length === 0
              ? "overflow-hidden no-scrollbar"
              : "overflow-y-auto chat-scrollbar"
          }`}
        >
          {messages.length === 0 ? (
            /* STATE A: Centered Hero Screen (Orb + Dynamic Greeting + Floating Search Bar + 3 Feature Cards) */
            <div className="flex flex-col items-center justify-center my-auto w-full max-w-3xl mx-auto px-2 py-4 md:py-6">
              {/* Upper Section: Luminous 3D Orb + Dynamic Greeting */}
              <div className="flex flex-col items-center justify-center text-center select-none mb-5">
                {/* Fluid Dynamic WebGL Orb (Compact, sleek & proportionate) */}
                <div className="relative mb-2.5 flex items-center justify-center select-none">
                  {/* Subtle soft cosmic ambient glow behind fluid orb */}
                  <div
                    className="absolute w-36 h-36 rounded-full blur-2xl pointer-events-none opacity-40 transition-all duration-700 orb-ambient-glow"
                    style={{
                      background: `radial-gradient(circle, ${accentColor} 0%, ${accentColor}60 45%, transparent 75%)`,
                    }}
                  />

                  <FluidOrb
                    size={140}
                    color={accentColor}
                    className="shadow-xl shadow-purple-950/25"
                  />
                </div>

                <h1 suppressHydrationWarning className="text-2xl md:text-3xl font-semibold tracking-tight mb-1">
                  {greeting}, {userName}.
                </h1>
                <p className="text-sm md:text-base font-normal opacity-70">
                  How can I help you today?
                </p>
              </div>

              {/* Lower Section: Pure Floating Search Bar + 3 Feature Cards Directly Beneath It */}
              <div className="w-full pb-4 md:pb-8">
                {/* Small Header Container ABOVE Prompt Bar (Focus Agent on left, Token Usage Badge on right) */}
                <div className="flex items-center justify-between px-2 mb-2 select-none w-full">
                  <div className="flex items-center gap-2">
                    {activeFocusAgent ? (
                      <>
                        <div
                          className={`inline-flex items-center gap-1.5 h-6 px-2.5 rounded-full text-xs font-semibold cursor-pointer transition-all border ${
                            isDark
                              ? FOCUS_AGENTS_CONFIG[activeFocusAgent].badgeDark
                              : FOCUS_AGENTS_CONFIG[activeFocusAgent].badgeLight
                          }`}
                          onClick={() => setActiveFocusAgent(null)}
                          title="Click to remove preset agent"
                        >
                          {FOCUS_AGENTS_CONFIG[activeFocusAgent].icon}
                          <span className="text-[11px] font-semibold">{FOCUS_AGENTS_CONFIG[activeFocusAgent].label}</span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveFocusAgent(null);
                            }}
                            className="ml-1 opacity-60 hover:opacity-100 hover:scale-125 transition-all text-[11px] leading-none"
                            title="Remove focus agent"
                          >
                            ✕
                          </button>
                        </div>

                        <span
                          className={`text-[11px] font-medium transition-colors ${
                            isDark
                              ? FOCUS_AGENTS_CONFIG[activeFocusAgent].textColorDark
                              : FOCUS_AGENTS_CONFIG[activeFocusAgent].textColorLight
                          }`}
                        >
                          {FOCUS_AGENTS_CONFIG[activeFocusAgent].title}
                        </span>
                      </>
                    ) : (
                      <>
                        <div
                          className={`inline-flex items-center gap-1.5 h-6 px-2.5 rounded-full text-xs font-medium cursor-default ${chipGlass}`}
                        >
                          <AtSignIcon />
                          <span className="text-[10px]">Focus Agent</span>
                        </div>

                        <span className="text-[11px] font-medium cursor-default transition-colors supervisor-text">
                          Astra Multi-Agent Supervisor
                        </span>
                      </>
                    )}
                  </div>

                  {/* Token Usage Badge placed in Right Corner of Small Container */}
                  <TokenUsageBadge
                    percentage={Math.max(
                      0,
                      Math.min(
                        100,
                        Math.round(
                          ((telemetryData.dailyQuota - telemetryData.totalTokensUsed) /
                            telemetryData.dailyQuota) *
                            100
                        )
                      )
                    )}
                    totalTokensUsed={telemetryData.totalTokensUsed}
                    dailyQuota={telemetryData.dailyQuota}
                    isDark={isDark}
                    accentColor={accentColor}
                    onClick={() => setIsAgentUsageModalOpen(true)}
                  />
                </div>

                {/* 1. Main Prompt Bar Container */}
                <div
                  className={`w-full rounded-[22px] p-3 md:p-3.5 transition-all mb-3 ${promptCardBg}`}
                >
                  {/* Uploaded File Attachments Preview (Composer Attachments) */}
                  <PromptAttachments
                    files={attachedFiles}
                    onRemove={handleFileRemove}
                    isDark={isDark}
                    accentColor={accentColor}
                  />

                  {/* Textarea (FUNCTIONAL: User types here - high contrast & immediately visible on theme switch) */}
                  <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={handleInput}
                    onKeyDown={handleKeyDown}
                    rows={2}
                    placeholder="Message Astra AI or ask anything..."
                    className="w-full bg-transparent resize-none outline-none text-xs md:text-sm leading-relaxed py-1 px-1 transition-colors duration-200 prompt-textarea"
                  />

                  {/* Bottom Controls Row: Paperclip on Left, ModelPicker + Send on Right */}
                  <div className="flex items-center justify-between pt-3 border-t prompt-bottom-border">
                    {/* Left: Interactive Paperclip Attach Button */}
                    <div className="flex items-center gap-2">
                      <button
                        ref={paperclipBtnRef}
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setActiveTrigger("hero");
                          setIsFileUploadOpen((prev) => !prev);
                        }}
                        className={`relative p-1.5 rounded-full transition-all duration-200 cursor-pointer ${chipGlass} ${
                          attachedFiles.length > 0 ? "ring-2 ring-purple-400 bg-purple-500/20" : ""
                        }`}
                        title={
                          attachedFiles.length > 0
                            ? `${attachedFiles.length} file(s) attached - click to view`
                            : "Attach documents or files"
                        }
                      >
                        <PaperclipIcon />
                        {attachedFiles.length > 0 && (
                          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-purple-600 text-white text-[9px] font-bold flex items-center justify-center shadow-sm">
                            {attachedFiles.length}
                          </span>
                        )}
                      </button>
                    </div>

                    {/* Right: ModelPicker takes the token usage spot + Send Pill Button */}
                    <div className="flex items-center gap-2 shrink-0">
                      <ModelPicker
                        selectedProvider={selectedProvider}
                        selectedModel={selectedModel}
                        onSelect={(provider, modelId) => {
                          setSelectedProvider(provider);
                          setSelectedModel(modelId);
                        }}
                        isDark={isDark}
                        hasCustomAgentKey={hasCustomAgentKey}
                        accentColor={accentColor}
                      />

                      {/* Submit Pill Button (FUNCTIONAL: Only clicking this sends the typed prompt) */}
                      <button
                        onClick={() => handleSubmit()}
                        onMouseEnter={() => {
                          if ((input.trim() || attachedFiles.length > 0) && !isLoading) {
                            heroSendIconRef.current?.startAnimation();
                          }
                        }}
                        onMouseLeave={() => {
                          heroSendIconRef.current?.stopAnimation();
                        }}
                        disabled={(!input.trim() && attachedFiles.length === 0) || isLoading}
                        style={
                          (input.trim() || attachedFiles.length > 0) && !isLoading
                            ? {
                                background: `linear-gradient(135deg, ${accentColor} 0%, ${accentColor}dd 100%)`,
                                boxShadow: `0 4px 18px ${accentColor}55`,
                              }
                            : undefined
                        }
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all flex-shrink-0 ${
                          (input.trim() || attachedFiles.length > 0) && !isLoading
                            ? "text-white hover:scale-105 cursor-pointer"
                            : isDark
                            ? "bg-white/10 text-white/30 cursor-not-allowed"
                            : "bg-white/40 text-purple-900/40 border border-white/50 cursor-not-allowed"
                        }`}
                        title="Send prompt"
                      >
                        <ArrowUpIcon
                          ref={heroSendIconRef}
                          size={16}
                          duration={0.8}
                          color={
                            (input.trim() || attachedFiles.length > 0) && !isLoading
                              ? "#ffffff"
                              : isDark
                              ? "rgba(255, 255, 255, 0.3)"
                              : "rgba(88, 28, 135, 0.4)"
                          }
                        />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Suggestion Chips Below Prompt Bar (Screenshot 4 - Framer Style) */}
                <div className="flex items-center justify-center gap-2 flex-wrap mb-4 select-none">
                  <button
                    type="button"
                    onClick={() =>
                      handleChipClick(
                        "Search the web for recent advancements in AI agent architecture and summarize",
                        "researcher"
                      )
                    }
                    className={`inline-flex items-center gap-1.5 h-7 px-3.5 rounded-full text-xs font-medium cursor-pointer transition-all duration-200 shadow-xs hover:scale-105 active:scale-95 ${chipGlass} hover:border-blue-400/50 hover:bg-blue-500/10`}
                  >
                    <svg className="w-3.5 h-3.5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <circle cx="10.5" cy="10.5" r="6.5" strokeWidth="2" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 16l4 4" />
                    </svg>
                    <span>Search the web</span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleChipClick(
                        "Write a clean, production-ready TypeScript API handler with validation and types",
                        "coder"
                      )
                    }
                    className={`inline-flex items-center gap-1.5 h-7 px-3.5 rounded-full text-xs font-medium cursor-pointer transition-all duration-200 shadow-xs hover:scale-105 active:scale-95 ${chipGlass} hover:border-purple-400/50 hover:bg-purple-500/10`}
                  >
                    <span className="text-purple-400">💻</span>
                    <span>Write code</span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleChipClick(
                        "Please synthesize and summarize this information into key executive bullet points",
                        "summarizer"
                      )
                    }
                    className={`inline-flex items-center gap-1.5 h-7 px-3.5 rounded-full text-xs font-medium cursor-pointer transition-all duration-200 shadow-xs hover:scale-105 active:scale-95 ${chipGlass} hover:border-amber-400/50 hover:bg-amber-500/10`}
                  >
                    <span className="text-orange-400">📄</span>
                    <span>Summarize</span>
                  </button>
                </div>

                {/* 2. Three Feature Cards (PURELY INFORMATIONAL, NO click triggers, ZERO token consumption) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full">
                  {/* Card 1: Multi-Agent Squad */}
                  <div
                    onMouseEnter={() => squadIconRef.current?.startAnimation()}
                    onMouseLeave={() => squadIconRef.current?.stopAnimation()}
                    className={featureCardClass}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <h3 className="font-semibold text-xs md:text-sm">
                        Multi-Agent Squad
                      </h3>
                      <div className="feature-icon-box feature-icon-purple" aria-hidden="true">
                        <UsersIcon
                          ref={squadIconRef}
                          size={15}
                          duration={1}
                          color={isDark ? "#d8b4fe" : "#7c3aed"}
                        />
                      </div>
                    </div>
                    <p className="text-[11px] leading-relaxed card-description">
                      5 specialized autonomous agents for coding, web research, document analysis, summarization, and natural conversation.
                    </p>
                  </div>

                  {/* Card 2: 3-Tier LLM Cascade */}
                  <div
                    onMouseEnter={() => cascadeIconRef.current?.startAnimation()}
                    onMouseLeave={() => cascadeIconRef.current?.stopAnimation()}
                    className={featureCardClass}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <h3 className="font-semibold text-xs md:text-sm">
                        Fail-Safe Cascade
                      </h3>
                      <div className="feature-icon-box feature-icon-amber" aria-hidden="true">
                        <ZapIcon
                          ref={cascadeIconRef}
                          size={15}
                          duration={1}
                          color={isDark ? "#fde047" : "#d97706"}
                        />
                      </div>
                    </div>
                    <p className="text-[11px] leading-relaxed card-description">
                      Uninterrupted intelligence with automated failover transitioning seamlessly across Groq ➔ OpenRouter ➔ Local Offline Ollama.
                    </p>
                  </div>

                  {/* Card 3: Autonomous Live Tools */}
                  <div
                    onMouseEnter={() => toolsIconRef.current?.startAnimation()}
                    onMouseLeave={() => toolsIconRef.current?.stopAnimation()}
                    className={featureCardClass}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <h3 className="font-semibold text-xs md:text-sm">
                        Autonomous Tools
                      </h3>
                      <div className="feature-icon-box feature-icon-cyan" aria-hidden="true">
                        <WrenchIcon
                          ref={toolsIconRef}
                          size={15}
                          duration={1}
                          color={isDark ? "#67e8f9" : "#0891b2"}
                        />
                      </div>
                    </div>
                    <p className="text-[11px] leading-relaxed card-description">
                      Autonomous tool-calling loop executing live web search with Tavily, real-time timezone clock, calculator, and dataset analysis.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* STATE B: Active Conversation Stream */
            <div
              className={`w-full max-w-3xl mx-auto pt-6 pb-14 ${
                fontDensity === "compact"
                  ? "space-y-3.5"
                  : fontDensity === "spacious"
                  ? "space-y-8"
                  : "space-y-6"
              }`}
            >
              {isSessionLoading ? (
                <ChatHistorySkeleton isDark={isDark} />
              ) : (
                messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
                  >
                    {/* Active Agent Badge */}
                    {msg.role === "assistant" && msg.agentTitle && (
                      <div className="flex items-center gap-1.5 text-[11px] font-semibold mb-1.5 ml-1" style={{ color: accentColor }}>
                        <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: accentColor }} />
                        <span>{msg.agentTitle}</span>
                      </div>
                    )}

                    {/* Attached Files Visual Cards (PDF, Image, Doc) */}
                    {msg.attachments && msg.attachments.length > 0 && (
                      <div className="mb-2 max-w-[88%] md:max-w-[82%]">
                        <MessageAttachments
                          attachments={msg.attachments}
                          isDark={isDark}
                          accentColor={accentColor}
                        />
                      </div>
                    )}

                    {/* Message Bubble */}
                    {msg.content && (
                      <div
                        style={
                          msg.role === "user"
                            ? {
                                background: `linear-gradient(135deg, ${accentColor} 0%, ${accentColor}dd 100%)`,
                                boxShadow: `0 6px 20px ${accentColor}35`,
                              }
                            : undefined
                        }
                        className={`max-w-[88%] md:max-w-[82%] rounded-2xl whitespace-pre-wrap ${
                          fontDensity === "compact"
                            ? "px-3.5 py-2 text-[13px] leading-snug"
                            : fontDensity === "spacious"
                            ? "px-5 py-4 text-[15px] leading-loose"
                            : "px-4 py-3 text-sm leading-relaxed"
                        } ${
                          msg.role === "user"
                            ? "text-white rounded-br-sm"
                            : `${
                                isDark
                                  ? "bg-[#140e24]/80 border-purple-500/20 text-[#ede8f5]"
                                  : "bg-white/80 border-purple-200/80 text-[#251b36]"
                              } border backdrop-blur-md rounded-bl-sm shadow-md`
                        }`}
                      >
                        {msg.content}
                      </div>
                    )}
                  </div>
                ))
              )}

              {isLoading && (
                <div className="flex flex-col items-start gap-2 pt-2 ml-1 animate-in fade-in-0 duration-200">
                  <AgentThinking variant="stars" label="Thinking" tone="accent" />
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* 4. Bottom Sticky Composer with Glassmorphism (Active Conversation) */}
        {messages.length > 0 && (
          <footer className="p-4 bg-transparent transition-colors">
            <div className="max-w-3xl mx-auto shadow-xl">
              {/* Header Above Footer Prompt Bar (Focus Agent on Left, Token Usage Badge on Right) */}
              <div className="flex items-center justify-between mb-1.5 px-1 animate-in fade-in-0 duration-150">
                <div className="flex items-center gap-2">
                  {activeFocusAgent ? (
                    <>
                      <div
                        className={`inline-flex items-center gap-1.5 h-5 px-2 rounded-full text-xs font-semibold cursor-pointer border ${
                          isDark
                            ? FOCUS_AGENTS_CONFIG[activeFocusAgent].badgeDark
                            : FOCUS_AGENTS_CONFIG[activeFocusAgent].badgeLight
                        }`}
                        onClick={() => setActiveFocusAgent(null)}
                        title="Click to remove focus agent"
                      >
                        {FOCUS_AGENTS_CONFIG[activeFocusAgent].icon}
                        <span className="text-[10px]">{FOCUS_AGENTS_CONFIG[activeFocusAgent].label}</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveFocusAgent(null);
                          }}
                          className="ml-0.5 opacity-60 hover:opacity-100 text-[10px]"
                        >
                          ✕
                        </button>
                      </div>
                      <span
                        className={`text-[10px] font-medium ${
                          isDark
                            ? FOCUS_AGENTS_CONFIG[activeFocusAgent].textColorDark
                            : FOCUS_AGENTS_CONFIG[activeFocusAgent].textColorLight
                        }`}
                      >
                        {FOCUS_AGENTS_CONFIG[activeFocusAgent].title}
                      </span>
                    </>
                  ) : (
                    <div className="flex items-center gap-1.5 text-[10px] opacity-70">
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: accentColor }} />
                      <span>Astra Multi-Agent Supervisor</span>
                    </div>
                  )}
                </div>

                {/* Agent Token Usage Badge placed in Right Corner of Header */}
                <TokenUsageBadge
                  percentage={Math.max(
                    0,
                    Math.min(
                      100,
                      Math.round(
                        ((telemetryData.dailyQuota - telemetryData.totalTokensUsed) /
                          telemetryData.dailyQuota) *
                          100
                      )
                    )
                  )}
                  totalTokensUsed={telemetryData.totalTokensUsed}
                  dailyQuota={telemetryData.dailyQuota}
                  isDark={isDark}
                  accentColor={accentColor}
                  onClick={() => setIsAgentUsageModalOpen(true)}
                />
              </div>

              {/* Main Footer Prompt Bar Box */}
              <div
                className={`w-full rounded-[22px] p-3 transition-all flex flex-col gap-2 ${promptCardBg}`}
              >
                {/* Uploaded File Attachments Preview (Composer Attachments) */}
                <PromptAttachments
                  files={attachedFiles}
                  onRemove={handleFileRemove}
                  isDark={isDark}
                  accentColor={accentColor}
                />

                <div className="flex items-end gap-2 w-full">
                  {/* Left: Interactive Paperclip button in footer */}
                  <button
                    ref={footerPaperclipBtnRef}
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setActiveTrigger("footer");
                      setIsFileUploadOpen((prev) => !prev);
                    }}
                    className={`h-7 w-7 relative rounded-full flex items-center justify-center border flex-shrink-0 transition-all duration-200 cursor-pointer ${chipGlass} ${
                      attachedFiles.length > 0 ? "ring-2 ring-purple-400 bg-purple-500/20" : ""
                    }`}
                    title={
                      attachedFiles.length > 0
                        ? `${attachedFiles.length} file(s) attached`
                        : "Attach documents or files"
                    }
                  >
                    <PaperclipIcon />
                    {attachedFiles.length > 0 && (
                      <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-purple-600 text-white text-[8px] font-bold flex items-center justify-center shadow-sm">
                        {attachedFiles.length}
                      </span>
                    )}
                  </button>

                  {/* Left: Textarea shifted left immediately next to paperclip */}
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

                  {/* Right: ModelPicker takes the token usage spot + Send Button */}
                  <div className="flex items-center gap-2 shrink-0">
                    <ModelPicker
                      selectedProvider={selectedProvider}
                      selectedModel={selectedModel}
                      onSelect={(provider, modelId) => {
                        setSelectedProvider(provider);
                        setSelectedModel(modelId);
                      }}
                      isDark={isDark}
                      hasCustomAgentKey={hasCustomAgentKey}
                      accentColor={accentColor}
                    />

                    {/* Submit Button (FUNCTIONAL) */}
                    <button
                      onClick={() => handleSubmit()}
                      onMouseEnter={() => {
                        if ((input.trim() || attachedFiles.length > 0) && !isLoading) {
                          footerSendIconRef.current?.startAnimation();
                        }
                      }}
                      onMouseLeave={() => {
                        footerSendIconRef.current?.stopAnimation();
                      }}
                      disabled={(!input.trim() && attachedFiles.length === 0) || isLoading}
                      style={
                        (input.trim() || attachedFiles.length > 0) && !isLoading
                          ? {
                              background: `linear-gradient(135deg, ${accentColor} 0%, ${accentColor}dd 100%)`,
                              boxShadow: `0 4px 18px ${accentColor}55`,
                            }
                          : undefined
                      }
                      className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center transition-all ${
                        (input.trim() || attachedFiles.length > 0) && !isLoading
                          ? "text-white hover:scale-105 cursor-pointer"
                          : isDark
                          ? "bg-white/10 text-white/30 cursor-not-allowed"
                          : "bg-white/40 text-purple-900/40 border border-white/50 cursor-not-allowed"
                      }`}
                      title="Send prompt"
                    >
                      <ArrowUpIcon
                        ref={footerSendIconRef}
                        size={16}
                        duration={0.8}
                        color={
                          (input.trim() || attachedFiles.length > 0) && !isLoading
                            ? "#ffffff"
                            : isDark
                            ? "rgba(255, 255, 255, 0.3)"
                            : "rgba(88, 28, 135, 0.4)"
                        }
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </footer>
        )}

        {/* File Upload Card Modal (Portaled outside, opens upwards) */}
        <FileUploadCard
          isOpen={isFileUploadOpen}
          onClose={() => setIsFileUploadOpen(false)}
          files={attachedFiles}
          onFilesChange={handleFilesChange}
          onFileRemove={handleFileRemove}
          triggerRef={activeTrigger === "hero" ? paperclipBtnRef : footerPaperclipBtnRef}
          isDark={isDark}
          accentColor={accentColor}
        />

        {/* Custom API Keys (BYOK) Modal */}
        <ApiKeysModal
          isOpen={isApiKeysModalOpen}
          onClose={() => setIsApiKeysModalOpen(false)}
          isDark={isDark}
          accentColor={accentColor}
          onKeysSaved={(keys) => {
            const hasKey = Boolean(keys.customAgentKey && keys.customAgentKey.trim());
            setHasCustomAgentKey(hasKey);
            if (!hasKey && selectedProvider === "custom") {
              setSelectedProvider("groq");
              setSelectedModel("openai/gpt-oss-20b");
            }
          }}
        />

        {/* AI Response Settings Modal */}
        <AiResponseSettingsModal
          isOpen={isResponseSettingsOpen}
          onClose={() => setIsResponseSettingsOpen(false)}
          isDark={isDark}
          accentColor={accentColor}
        />

        {/* Personalization / Appearance & Performance Modal */}
        <PersonalizationModal
          isOpen={isPersonalizationModalOpen}
          onClose={() => setIsPersonalizationModalOpen(false)}
          isDark={isDark}
          onSettingsSaved={(settings) => {
            // Apply Theme
            if (settings.theme === "system") {
              const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
              applyTheme(prefersDark ? "dark" : "light");
            } else {
              applyTheme(settings.theme);
            }
            // Apply Font Density
            setFontDensity(settings.fontDensity);
            // Apply Accent Color
            setAccentColor(settings.accentColor);
            document.documentElement.style.setProperty("--astra-accent", settings.accentColor);
            document.documentElement.style.setProperty("--astra-accent-rgb", hexToRgb(settings.accentColor));
            // Apply Battery Saver
            if (settings.batterySaver) {
              document.documentElement.classList.add("battery-saver");
            } else {
              document.documentElement.classList.remove("battery-saver");
            }
            // Apply User Persona
            setUserName(settings.userName);
            setUserDomain(settings.userDomain);
          }}
        />

        {/* Keyboard Shortcuts (⌘K / Ctrl+K Cheat Sheet) Modal */}
        <KeyboardShortcutsModal
          isOpen={isShortcutsModalOpen}
          onClose={() => setIsShortcutsModalOpen(false)}
          isDark={isDark}
          accentColor={accentColor}
        />

        {/* AI Agent Usage & Token Telemetry Modal */}
        <AgentUsageModal
          isOpen={isAgentUsageModalOpen}
          onClose={() => setIsAgentUsageModalOpen(false)}
          isDark={isDark}
          accentColor={accentColor}
          telemetryData={telemetryData}
          onResetTelemetry={handleResetTelemetry}
          onRefreshTelemetry={handleRefreshTelemetry}
          onOpenApiKeys={() => {
            setIsAgentUsageModalOpen(false);
            setIsApiKeysModalOpen(true);
          }}
        />

        {/* Right-Click & 3-Dots Context Menu for Session Items */}
        <ChatContextMenu
          isOpen={Boolean(contextMenu)}
          position={contextMenu ? { x: contextMenu.x, y: contextMenu.y } : null}
          isPinned={Boolean(contextMenu?.isPinned)}
          onPin={() => {
            if (contextMenu) handleTogglePin(contextMenu.sessionId);
          }}
          onRename={() => {
            if (contextMenu) {
              const sess = sessions.find((s) => s.id === contextMenu.sessionId);
              if (sess) handleStartRename(sess);
            }
          }}
          onDelete={() => {
            if (contextMenu) {
              const fakeEvent = { stopPropagation: () => {} } as React.MouseEvent;
              handleDeleteSession(fakeEvent, contextMenu.sessionId);
            }
          }}
          onClose={() => setContextMenu(null)}
          isDark={isDark}
          accentColor={accentColor}
        />
      </div>
    </div>
  );
}
