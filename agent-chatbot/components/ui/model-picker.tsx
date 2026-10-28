"use client";

import { useState, useRef, useEffect, ReactNode } from "react";
import { createPortal } from "react-dom";

export type ModelOption = {
  id: string;
  name: string;
  description: string;
  badge: string;
  speed: "Fast" | "Balanced" | "Deep";
};

export type ProviderOption = {
  id: "groq" | "openrouter" | "auto" | "custom";
  name: string;
  tagline: string;
  badge: string;
  icon: (props: { className?: string }) => ReactNode;
  models: ModelOption[];
};

// 1. Official Groq Icon (Orange-red flame mark)
export function GroqIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" rx="8" fill="#F55036" fillOpacity="0.18" />
      <path
        d="M21 16.5C21 19.5 18.5 22 15.5 22C12.5 22 10 19.5 10 16.5C10 13.5 12.5 11 15.5 11C17.2 11 18.8 11.8 19.8 13L17.5 14.8C17 14 16.3 13.5 15.5 13.5C13.8 13.5 12.5 14.8 12.5 16.5C12.5 18.2 13.8 19.5 15.5 19.5C17 19.5 18.2 18.5 18.5 17.2H15.5V15H21V16.5Z"
        fill="#F55036"
      />
    </svg>
  );
}

// 2. Official OpenRouter Icon (Hexagonal network mark)
export function OpenRouterIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" rx="8" fill="#6366F1" fillOpacity="0.18" />
      <path
        d="M16 6L24.5 11V21L16 26L7.5 21V11L16 6Z"
        stroke="#818CF8"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <circle cx="16" cy="16" r="3.5" fill="#818CF8" />
      <path d="M16 9.5V12.5M16 19.5V22.5M21.5 13L19 14.5M13 17.5L10.5 19" stroke="#818CF8" strokeWidth="1.5" />
    </svg>
  );
}

// 3. Fail-Safe Cascade Icon (Purple neon bolt)
export function CascadeIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" rx="8" fill="#A855F7" fillOpacity="0.18" />
      <path
        d="M17 7L9 17H16L15 25L23 15H16L17 7Z"
        fill="#C084FC"
        stroke="#C084FC"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// 4. Custom Autonomous Agent Icon (Emerald glow emblem)
export function CustomAgentIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" rx="8" fill="#10B981" fillOpacity="0.18" />
      <path
        d="M16 6L23 9.5V16C23 20.5 19.5 24.5 16 26C12.5 24.5 9 20.5 9 16V9.5L16 6Z"
        stroke="#10B981"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="16" cy="14" r="2.5" fill="#10B981" />
      <path d="M13 19C13 17.5 14.3 16.5 16 16.5C17.7 16.5 19 17.5 19 19" stroke="#10B981" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export const PROVIDERS_CONFIG: ProviderOption[] = [
  {
    id: "groq",
    name: "Groq LPU",
    tagline: "Ultra-fast hardware inference (0.2s latency)",
    badge: "Hardware LPU",
    icon: GroqIcon,
    models: [
      {
        id: "openai/gpt-oss-20b",
        name: "GPT-OSS 20B",
        description: "Default ultra-fast general purpose intelligence",
        badge: "⚡ Fast",
        speed: "Fast",
      },
      {
        id: "llama-3.3-70b-versatile",
        name: "Llama 3.3 70B",
        description: "Heavy reasoning, coding & complex agentic tool use",
        badge: "🧠 Deep",
        speed: "Deep",
      },
      {
        id: "llama-3.1-8b-instant",
        name: "Llama 3.1 8B",
        description: "Instant sub-second conversational responses",
        badge: "⚡ Instant",
        speed: "Fast",
      },
    ],
  },
  {
    id: "openrouter",
    name: "OpenRouter",
    tagline: "Global unified API gateway & free tier models",
    badge: "Free Gateway",
    icon: OpenRouterIcon,
    models: [
      {
        id: "openrouter/free",
        name: "OpenRouter Free Auto",
        description: "Dynamically routes to best available free model",
        badge: "🌐 Smart",
        speed: "Balanced",
      },
      {
        id: "deepseek/deepseek-r1:free",
        name: "DeepSeek R1 (Free)",
        description: "Open-weights reasoning model with chain-of-thought",
        badge: "🧠 Think",
        speed: "Deep",
      },
      {
        id: "meta-llama/llama-3.3-70b-instruct:free",
        name: "Llama 3.3 70B (Free)",
        description: "High-capability instruction model on free cluster",
        badge: "✨ 70B",
        speed: "Balanced",
      },
    ],
  },
  {
    id: "auto",
    name: "Auto Cascade",
    tagline: "Automated failover: Groq ➔ OpenRouter ➔ Ollama",
    badge: "Fail-Safe",
    icon: CascadeIcon,
    models: [
      {
        id: "auto-cascade",
        name: "Fail-Safe Cascade",
        description: "Prioritizes Groq speed with automatic fallback if rate-limited",
        badge: "🛡️ Auto",
        speed: "Fast",
      },
    ],
  },
];

export const CUSTOM_AGENT_PROVIDER: ProviderOption = {
  id: "custom",
  name: "Custom Agent",
  tagline: "Dedicated private endpoint & custom specialist",
  badge: "Private BYOK",
  icon: CustomAgentIcon,
  models: [
    {
      id: "custom-agent",
      name: "Custom Agent",
      description: "Autonomous execution powered by your private API key",
      badge: "🛡️ Private",
      speed: "Deep",
    },
  ],
};

type ModelPickerProps = {
  selectedProvider: "groq" | "openrouter" | "auto" | "custom";
  selectedModel: string;
  onSelect: (provider: "groq" | "openrouter" | "auto" | "custom", modelId: string) => void;
  isDark: boolean;
  hasCustomAgentKey?: boolean;
  accentColor?: string;
};

export function ModelPicker({
  selectedProvider,
  selectedModel,
  onSelect,
  isDark,
  hasCustomAgentKey,
  accentColor = "#a855f7",
}: ModelPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<"groq" | "openrouter" | "auto" | "custom">(selectedProvider);
  const [searchQuery, setSearchQuery] = useState("");
  const [internalHasKey, setInternalHasKey] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Sync internal check with localStorage on open or mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("astra_custom_agent_key");
      setInternalHasKey(Boolean(stored && stored.trim()));
    }
  }, [hasCustomAgentKey, isOpen]);

  const showCustom = hasCustomAgentKey ?? internalHasKey;
  const availableProviders = showCustom
    ? [...PROVIDERS_CONFIG, CUSTOM_AGENT_PROVIDER]
    : PROVIDERS_CONFIG;

  const [coords, setCoords] = useState<{
    top: number;
    left: number;
    width: number;
    openUpwards: boolean;
  }>({
    top: 0,
    left: 0,
    width: 380,
    openUpwards: true,
  });

  // Client mount flag for safe Portal rendering
  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync tab with external provider changes
  useEffect(() => {
    setActiveTab(selectedProvider);
  }, [selectedProvider]);

  // Compute position relative to trigger button to open UPWARDS without container clipping
  const updatePosition = () => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const panelWidth = Math.min(380, window.innerWidth - 24);
    // Align left with button, clamping to stay within viewport
    const left = Math.max(12, Math.min(rect.left, window.innerWidth - panelWidth - 12));

    // Prefer opening upwards above prompt bar unless near top of viewport
    const openUpwards = rect.top >= 250;

    setCoords({
      top: openUpwards ? rect.top - 8 : rect.bottom + 8,
      left,
      width: panelWidth,
      openUpwards,
    });
  };

  useEffect(() => {
    if (isOpen) {
      updatePosition();
      window.addEventListener("scroll", updatePosition, true);
      window.addEventListener("resize", updatePosition);
      return () => {
        window.removeEventListener("scroll", updatePosition, true);
        window.removeEventListener("resize", updatePosition);
      };
    }
  }, [isOpen]);

  // Close on click outside (works across portal)
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (
        buttonRef.current &&
        !buttonRef.current.contains(target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  // Find active provider and active model details
  const currentProviderObj = availableProviders.find((p) => p.id === selectedProvider) || availableProviders[0];
  const currentModelObj =
    currentProviderObj.models.find((m) => m.id === selectedModel) || currentProviderObj.models[0];

  const activeProviderTabObj = availableProviders.find((p) => p.id === activeTab) || availableProviders[0];

  // Filter models based on search query
  const filteredModels = searchQuery.trim()
    ? availableProviders.flatMap((p) =>
        p.models
          .filter(
            (m) =>
              m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              m.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
              p.name.toLowerCase().includes(searchQuery.toLowerCase())
          )
          .map((m) => ({ ...m, providerId: p.id, providerName: p.name }))
      )
    : activeProviderTabObj.models.map((m) => ({
        ...m,
        providerId: activeProviderTabObj.id,
        providerName: activeProviderTabObj.name,
      }));

  const ProviderIconComponent = currentProviderObj.icon;

  return (
    <>
      {/* 1. Trigger Pill Button in Prompt Bar */}
      <button
        ref={buttonRef}
        type="button"
        onClick={() => {
          if (!isOpen) {
            updatePosition();
          }
          setIsOpen(!isOpen);
        }}
        style={
          selectedProvider !== "custom"
            ? {
                borderColor: `${accentColor}40`,
                backgroundColor: isDark ? `${accentColor}18` : undefined,
              }
            : undefined
        }
        className={`inline-flex items-center gap-1.5 h-7 px-2.5 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer select-none border ${
          selectedProvider === "custom"
            ? isDark
              ? "bg-emerald-950/40 hover:bg-emerald-900/50 border-emerald-500/40 text-emerald-200 shadow-sm"
              : "bg-emerald-50/90 hover:bg-emerald-100 border-emerald-300 text-emerald-900 shadow-sm"
            : isDark
            ? "hover:opacity-90 text-purple-100 shadow-sm"
            : "bg-white/80 hover:bg-white text-purple-900 shadow-sm"
        }`}
        title="Select AI Agent / Model Provider"
        aria-expanded={isOpen}
      >
        <ProviderIconComponent className="w-3.5 h-3.5 shrink-0" />
        <span className="font-semibold whitespace-nowrap">{currentModelObj.name}</span>
        <svg
          className={`w-3 h-3 opacity-60 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* 2. Portalled Glassmorphic Dropdown Panel (Opens completely outside container, downward) */}
      {mounted &&
        isOpen &&
        createPortal(
          <div
            ref={dropdownRef}
            style={{
              position: "fixed",
              top: `${coords.top}px`,
              left: `${coords.left}px`,
              width: `${coords.width}px`,
              transform: coords.openUpwards ? "translateY(-100%)" : "none",
              zIndex: 999999,
              borderColor: isDark ? `${accentColor}40` : undefined,
              boxShadow: isDark
                ? `0 20px 50px rgba(0,0,0,0.85), 0 0 24px ${accentColor}25`
                : undefined,
            }}
            className={`rounded-2xl overflow-hidden shadow-2xl transition-all duration-200 border animate-in fade-in-0 zoom-in-95 ${
              isDark
                ? "bg-[#140c24]/95 text-white backdrop-blur-2xl"
                : "bg-white/95 border-purple-200 text-purple-950 shadow-[0_20px_50px_rgba(85,45,145,0.22)] backdrop-blur-2xl"
            }`}
          >
            {/* Top Search Bar */}
            <div
              className={`flex items-center gap-2 px-3 py-2 border-b ${
                isDark ? "border-purple-500/20 bg-purple-950/20" : "border-purple-100 bg-purple-50/40"
              }`}
            >
              <svg
                style={{ color: accentColor }}
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                placeholder="Search agent models..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-xs outline-none placeholder:text-gray-400"
                autoFocus
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="text-xs opacity-60 hover:opacity-100 cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Two-Column Body: Left Rail + Right Model List */}
            <div className="flex h-56">
              {/* Left Rail: Providers */}
              {!searchQuery && (
                <div
                  className={`w-28 sm:w-32 flex flex-col p-1.5 gap-1 border-r shrink-0 overflow-y-auto ${
                    isDark ? "border-purple-500/20 bg-purple-950/30" : "border-purple-100 bg-purple-50/50"
                  }`}
                >
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-1 opacity-50">
                    Providers
                  </span>
                  {availableProviders.map((provider) => {
                    const Icon = provider.icon;
                    const isActive = activeTab === provider.id;
                    const isCustom = provider.id === "custom";
                    return (
                      <button
                        key={provider.id}
                        type="button"
                        onClick={() => setActiveTab(provider.id)}
                        className={`flex items-center gap-2 px-2 py-2 rounded-xl text-left text-xs font-medium transition-all cursor-pointer ${
                          isActive
                            ? isCustom
                              ? isDark
                                ? "bg-emerald-600/30 text-emerald-200 border border-emerald-500/40 shadow-sm"
                                : "bg-emerald-50 text-emerald-950 border border-emerald-300 shadow-sm font-semibold"
                              : isDark
                              ? "bg-purple-600/30 text-white border border-purple-500/40 shadow-sm"
                              : "bg-white text-purple-900 border border-purple-200 shadow-sm font-semibold"
                            : isCustom
                            ? isDark
                              ? "text-emerald-400/80 hover:bg-emerald-500/10 hover:text-emerald-300"
                              : "text-emerald-700 hover:bg-emerald-50/70 hover:text-emerald-900"
                            : isDark
                            ? "text-purple-300/70 hover:bg-white/5 hover:text-white"
                            : "text-purple-700/70 hover:bg-white/50 hover:text-purple-950"
                        }`}
                      >
                        <Icon className="w-4 h-4 shrink-0" />
                        <div className="truncate">{provider.name}</div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Right List: Models */}
              <div className="flex-1 p-2 overflow-y-auto flex flex-col gap-1.5">
                <div className="px-1.5 py-0.5 flex items-center justify-between">
                  <span className="text-[11px] font-semibold opacity-70">
                    {searchQuery ? `Results (${filteredModels.length})` : activeProviderTabObj.tagline}
                  </span>
                </div>

                {filteredModels.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-36 text-center text-xs opacity-60">
                    <p>No models match your search.</p>
                  </div>
                ) : (
                  filteredModels.map((model) => {
                    const isSelected =
                      selectedModel === model.id && selectedProvider === model.providerId;
                    const isCustom = model.providerId === "custom";
                    return (
                      <div
                        key={`${model.providerId}-${model.id}`}
                        onClick={() => {
                          onSelect(model.providerId as "groq" | "openrouter" | "auto" | "custom", model.id);
                          setIsOpen(false);
                        }}
                        className={`flex items-start justify-between p-2.5 rounded-xl cursor-pointer transition-all duration-150 border ${
                          isSelected
                            ? isCustom
                              ? isDark
                                ? "bg-emerald-600/25 border-emerald-400/50 shadow-md"
                                : "bg-emerald-100/70 border-emerald-300 shadow-sm"
                              : isDark
                              ? "bg-purple-600/25 border-purple-400/50 shadow-md"
                              : "bg-purple-100/70 border-purple-300 shadow-sm"
                            : isDark
                            ? "border-transparent hover:bg-purple-900/20 hover:border-purple-500/25"
                            : "border-transparent hover:bg-purple-50 hover:border-purple-200"
                        }`}
                      >
                        <div className="flex-1 pr-2">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <span className="text-xs font-semibold">{model.name}</span>
                            <span
                              className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${
                                isCustom
                                  ? isDark
                                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                    : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                  : isDark
                                  ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                                  : "bg-purple-100 text-purple-800 border border-purple-200"
                              }`}
                            >
                              {model.badge}
                            </span>
                          </div>
                          <p className="text-[11px] opacity-70 leading-relaxed line-clamp-2">
                            {model.description}
                          </p>
                        </div>

                        {/* Selected Checkmark */}
                        {isSelected && (
                          <div className={`shrink-0 pt-0.5 ${isCustom ? "text-emerald-400" : "text-purple-400"}`}>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2.5"
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
