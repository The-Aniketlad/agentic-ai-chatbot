"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
import { KeyboardIcon } from "@animateicons/react/lucide";
import { Kbd, KbdGroup } from "./kbd";

export interface ShortcutItem {
  id: string;
  title: string;
  category: "General & Navigation" | "Chat & Compose" | "Pro Controls" | "Upcoming Agentic";
  description: string;
  macKeys: string[];
  winKeys: string[];
  badge?: string;
  isUpcoming?: boolean;
}

const SHORTCUTS_DATA: ShortcutItem[] = [
  // 1. General & Navigation
  {
    id: "command-palette",
    title: "Command Palette & Shortcuts",
    category: "General & Navigation",
    description: "Open the shortcuts cheat sheet and quick actions",
    macKeys: ["⌘", "K"],
    winKeys: ["Ctrl", "K"],
    badge: "Universal",
  },
  {
    id: "new-chat",
    title: "New Chat Session",
    category: "General & Navigation",
    description: "Start a clean conversation thread",
    macKeys: ["⌘", "Shift", "O"],
    winKeys: ["Ctrl", "Shift", "O"],
    badge: "Global",
  },
  {
    id: "toggle-sidebar",
    title: "Toggle History Sidebar",
    category: "General & Navigation",
    description: "Expand or collapse chat history drawer",
    macKeys: ["⌘", "B"],
    winKeys: ["Ctrl", "B"],
  },
  {
    id: "toggle-theme",
    title: "Toggle Dark / Light Theme",
    category: "General & Navigation",
    description: "Instantly switch appearance mode",
    macKeys: ["⌘", "Shift", "D"],
    winKeys: ["Ctrl", "Shift", "D"],
  },
  {
    id: "open-settings",
    title: "Settings & Personalization",
    category: "General & Navigation",
    description: "Open appearance, performance, and profile modal",
    macKeys: ["⌘", ","],
    winKeys: ["Ctrl", ","],
  },
  {
    id: "close-modal",
    title: "Close Modal / Cancel Popover",
    category: "General & Navigation",
    description: "Dismiss any active dialog, card, or menu",
    macKeys: ["Esc"],
    winKeys: ["Esc"],
  },

  // 2. Chat & Compose
  {
    id: "send-message",
    title: "Send Message",
    category: "Chat & Compose",
    description: "Submit prompt to Astra AI agents",
    macKeys: ["↵ Return"],
    winKeys: ["Enter"],
    badge: "Prompt",
  },
  {
    id: "new-line",
    title: "Insert New Line",
    category: "Chat & Compose",
    description: "Add a paragraph break without sending",
    macKeys: ["Shift", "↵"],
    winKeys: ["Shift", "Enter"],
  },
  {
    id: "focus-prompt",
    title: "Focus Message Bar",
    category: "Chat & Compose",
    description: "Jump typing cursor straight into prompt bar",
    macKeys: ["/"],
    winKeys: ["/"],
  },
  {
    id: "stop-generation",
    title: "Stop AI Generation",
    category: "Chat & Compose",
    description: "Interrupt ongoing token streaming",
    macKeys: ["Esc"],
    winKeys: ["Esc"],
  },
  {
    id: "attach-file",
    title: "Attach & Upload Files",
    category: "Chat & Compose",
    description: "Open document & media upload drawer",
    macKeys: ["⌘", "U"],
    winKeys: ["Ctrl", "U"],
  },
  {
    id: "switch-model",
    title: "Switch AI Model Provider",
    category: "Chat & Compose",
    description: "Toggle between Groq, OpenRouter, and Custom models",
    macKeys: ["⌘", "M"],
    winKeys: ["Ctrl", "M"],
  },

  // 3. Pro Controls
  {
    id: "api-keys",
    title: "Custom API Keys (BYOK)",
    category: "Pro Controls",
    description: "Direct access to private LLM API tokens",
    macKeys: ["⌘", "Shift", "K"],
    winKeys: ["Ctrl", "Shift", "K"],
    badge: "BYOK",
  },
  {
    id: "response-settings",
    title: "AI Response Settings",
    category: "Pro Controls",
    description: "Adjust temperature, tone, and system prompt",
    macKeys: ["⌘", "Shift", "T"],
    winKeys: ["Ctrl", "Shift", "T"],
  },
  {
    id: "clear-history",
    title: "Clear Current Chat History",
    category: "Pro Controls",
    description: "Reset active messages in thread",
    macKeys: ["⌘", "Shift", "⌫"],
    winKeys: ["Ctrl", "Shift", "Backspace"],
  },

  // 4. Upcoming Agentic Features
  {
    id: "mention-agent",
    title: "Mention / Focus Agent",
    category: "Upcoming Agentic",
    description: "Tag specialized agent (Researcher, Coder, Summarizer)",
    macKeys: ["@"],
    winKeys: ["@"],
    isUpcoming: true,
  },
  {
    id: "toggle-reasoning",
    title: "Inspect Agent Reasoning Tree",
    category: "Upcoming Agentic",
    description: "Expand or collapse internal chain-of-thought traces",
    macKeys: ["⌘", "Shift", "E"],
    winKeys: ["Ctrl", "Shift", "E"],
    isUpcoming: true,
  },
];

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDark: boolean;
  accentColor?: string;
}

export function KeyboardShortcutsModal({
  isOpen,
  onClose,
  isDark,
  accentColor = "#a855f7",
}: KeyboardShortcutsModalProps) {
  const [mounted, setMounted] = useState(false);
  const [osMode, setOsMode] = useState<"mac" | "win">("win");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("All");

  const headerIconRef = useRef<{ startAnimation: () => void; stopAnimation: () => void } | null>(null);

  useEffect(() => {
    setMounted(true);
    // Auto detect OS on client
    if (typeof window !== "undefined") {
      const isApple = /Mac|iPhone|iPad|iPod/.test(navigator.platform || navigator.userAgent);
      setOsMode(isApple ? "mac" : "win");
    }
  }, []);

  // Animate header icon on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        headerIconRef.current?.startAnimation();
      }, 150);
    }
  }, [isOpen]);

  // Escape key listener to close modal
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
      }
    }
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Categories list
  const categories = ["All", "General & Navigation", "Chat & Compose", "Pro Controls", "Upcoming Agentic"];

  // Filtered shortcuts
  const filteredShortcuts = useMemo(() => {
    return SHORTCUTS_DATA.filter((item) => {
      const matchesCat = activeCategory === "All" || item.category === activeCategory;
      const q = searchQuery.toLowerCase().trim();
      if (!q) return matchesCat;

      const keys = (osMode === "mac" ? item.macKeys : item.winKeys).join(" ").toLowerCase();
      const matchesSearch =
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        keys.includes(q);

      return matchesCat && matchesSearch;
    });
  }, [searchQuery, activeCategory, osMode]);

  if (!mounted || !isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[999999] flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-md animate-in fade-in-0 duration-200">
      {/* Click outside backdrop */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Main Modal Card */}
      <div
        style={{
          borderColor: isDark ? `${accentColor}40` : undefined,
          boxShadow: isDark
            ? `0 24px 70px rgba(0,0,0,0.9), 0 0 35px ${accentColor}25`
            : undefined,
        }}
        className={`relative w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl border transition-all duration-200 animate-in zoom-in-95 fade-in-0 flex flex-col max-h-[85vh] ${
          isDark
            ? "bg-[#130b24]/95 text-white backdrop-blur-2xl"
            : "bg-white/95 border-purple-200 text-purple-950 shadow-[0_24px_70px_rgba(85,45,145,0.2)] backdrop-blur-2xl"
        }`}
      >
        {/* Ambient Top Glow & Beam line */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-24 opacity-60 transition-all duration-300"
          style={{
            background: `linear-gradient(to bottom, ${accentColor}25, transparent)`,
          }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-10 top-0 h-px transition-all duration-300"
          style={{
            background: `linear-gradient(to right, transparent, ${accentColor}80, transparent)`,
          }}
        />

        {/* 1. Header */}
        <div
          className={`relative flex items-center justify-between p-4 md:p-5 border-b shrink-0 ${
            isDark ? "border-purple-500/20 bg-purple-950/30" : "border-purple-100 bg-purple-50/50"
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm border transition-all duration-300"
              style={{
                backgroundColor: `${accentColor}18`,
                borderColor: `${accentColor}35`,
                boxShadow: `0 0 12px ${accentColor}25`,
              }}
            >
              <KeyboardIcon
                ref={headerIconRef}
                size={22}
                duration={1}
                color={accentColor}
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold leading-tight">Keyboard Shortcuts</h3>
                <span
                  style={{
                    backgroundColor: `${accentColor}15`,
                    borderColor: `${accentColor}40`,
                    color: accentColor,
                  }}
                  className="text-[10px] font-mono px-1.5 py-0.5 rounded border font-semibold"
                >
                  Pro Workstation
                </span>
              </div>
              <p className="text-xs opacity-70 mt-0.5">Speed up your workflow with quick keyboard actions</p>
            </div>
          </div>

          {/* Right Controls: OS Switcher + Close Button */}
          <div className="flex items-center gap-2.5">
            {/* Dual OS Switcher (Variant-3 Style) */}
            <div
              className={`flex items-center p-0.5 rounded-xl border text-xs font-medium select-none ${
                isDark ? "bg-purple-950/60 border-purple-500/30" : "bg-purple-50/80 border-purple-200"
              }`}
            >
              <button
                type="button"
                onClick={() => setOsMode("win")}
                style={
                  osMode === "win"
                    ? {
                        backgroundColor: accentColor,
                        color: "#ffffff",
                        boxShadow: `0 2px 8px ${accentColor}55`,
                      }
                    : undefined
                }
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  osMode === "win"
                    ? ""
                    : isDark
                    ? "opacity-60 hover:opacity-100 text-purple-200"
                    : "opacity-60 hover:opacity-100 text-purple-900"
                }`}
                title="View Windows / Linux shortcuts"
              >
                <span>Windows</span>
              </button>

              <button
                type="button"
                onClick={() => setOsMode("mac")}
                style={
                  osMode === "mac"
                    ? {
                        backgroundColor: accentColor,
                        color: "#ffffff",
                        boxShadow: `0 2px 8px ${accentColor}55`,
                      }
                    : undefined
                }
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  osMode === "mac"
                    ? ""
                    : isDark
                    ? "opacity-60 hover:opacity-100 text-purple-200"
                    : "opacity-60 hover:opacity-100 text-purple-900"
                }`}
                title="View macOS shortcuts"
              >
                <span>macOS</span>
              </button>
            </div>

            {/* Close button */}
            <button
              type="button"
              onClick={onClose}
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                isDark ? "hover:bg-white/10 text-purple-300" : "hover:bg-purple-100 text-purple-700"
              }`}
              title="Close (Esc)"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* 2. Search & Category Filters */}
        <div
          className={`p-3 md:p-4 border-b space-y-3 shrink-0 ${
            isDark ? "border-purple-500/15 bg-purple-950/15" : "border-purple-100 bg-purple-50/30"
          }`}
        >
          {/* Search Box */}
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all ${
              isDark
                ? "bg-purple-950/40 border-purple-500/25 focus-within:border-purple-400 focus-within:ring-2 focus-within:ring-purple-500/20"
                : "bg-white border-purple-200 focus-within:border-purple-400 focus-within:ring-2 focus-within:ring-purple-200"
            }`}
          >
            <svg
              style={{ color: accentColor }}
              className="w-4 h-4 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <circle cx="11" cy="11" r="8" strokeWidth="2" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-4.35-4.35" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search shortcuts by action name or key (e.g. 'chat', 'sidebar', 'ctrl')..."
              className="w-full bg-transparent text-xs outline-none border-none placeholder:opacity-50"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="opacity-50 hover:opacity-100 p-1 cursor-pointer"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Category Chips Bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
            {categories.map((cat) => {
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  style={
                    isActive
                      ? {
                          backgroundColor: `${accentColor}25`,
                          borderColor: `${accentColor}70`,
                          color: isDark ? "#ffffff" : accentColor,
                          boxShadow: `0 0 10px ${accentColor}20`,
                        }
                      : undefined
                  }
                  className={`px-3 py-1 rounded-lg font-medium whitespace-nowrap transition-all border cursor-pointer ${
                    isActive
                      ? "font-semibold"
                      : isDark
                      ? "border-purple-500/20 bg-purple-950/30 text-purple-300 hover:bg-purple-900/40"
                      : "border-purple-200 bg-white text-purple-800 hover:bg-purple-100/60"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Shortcuts List Body */}
        <div className="p-4 md:p-5 overflow-y-auto space-y-2 flex-1">
          {filteredShortcuts.length === 0 ? (
            <div className="py-12 text-center opacity-60">
              <p className="text-sm font-semibold">No shortcuts found</p>
              <p className="text-xs mt-1">Try searching for a different keyword or category</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {filteredShortcuts.map((item) => {
                const keys = osMode === "mac" ? item.macKeys : item.winKeys;

                return (
                  <div
                    key={item.id}
                    className={`flex items-center justify-between gap-3 p-3 rounded-xl border transition-all duration-150 group ${
                      isDark
                        ? "bg-purple-950/25 border-purple-500/20 hover:border-purple-400/40 hover:bg-purple-950/40"
                        : "bg-white/80 border-purple-200/80 hover:border-purple-300 hover:bg-white"
                    }`}
                  >
                    {/* Left: Info */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-semibold leading-tight">{item.title}</span>
                        {item.badge && (
                          <span
                            style={{
                              borderColor: `${accentColor}30`,
                              color: accentColor,
                            }}
                            className="text-[9px] font-mono px-1 py-0.2 rounded border uppercase font-medium"
                          >
                            {item.badge}
                          </span>
                        )}
                        {item.isUpcoming && (
                          <span className="text-[9px] font-mono px-1 py-0.2 rounded border bg-amber-500/15 border-amber-500/30 text-amber-400 font-medium">
                            Upcoming
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] opacity-60 truncate mt-0.5">{item.description}</p>
                    </div>

                    {/* Right: Keycaps (from kbd.tsx) */}
                    <KbdGroup
                      className={`shrink-0 border p-1 rounded-lg ${
                        isDark ? "bg-black/30 border-white/10" : "bg-purple-50/80 border-purple-200/80"
                      }`}
                    >
                      {keys.map((k, i) => (
                        <Kbd key={i} size="sm">
                          {k}
                        </Kbd>
                      ))}
                    </KbdGroup>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 4. Footer Helper & Quick Pro-Tip */}
        <div
          className={`px-5 py-3 border-t flex items-center justify-between text-xs shrink-0 ${
            isDark ? "border-purple-500/20 bg-purple-950/30" : "border-purple-100 bg-purple-50/50"
          }`}
        >
          <div className="flex items-center gap-2 opacity-70">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="text-[11px]">Shortcuts are globally active across your session</span>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] opacity-60">
            <span>Press</span>
            <Kbd size="xs">Esc</Kbd>
            <span>to close</span>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

