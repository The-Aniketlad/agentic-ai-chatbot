"use client";

import React, { useState, useRef, useEffect, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import {
  BoltIcon,
  KeyRoundIcon,
  SlidersHorizontalIcon,
  UserRoundCogIcon,
  KeyboardIcon,
} from "@animateicons/react/lucide";

const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

interface AccountSettingsDropdownProps {
  isDark: boolean;
  accentColor?: string;
  userName?: string;
  userDomain?: string;
  onOpenApiKeys?: () => void;
  onOpenResponseSettings?: () => void;
  onOpenPersonalization?: () => void;
  onOpenShortcuts?: () => void;
}

export function AccountSettingsDropdown({
  isDark,
  accentColor = "#a855f7",
  userName,
  userDomain,
  onOpenApiKeys,
  onOpenResponseSettings,
  onOpenPersonalization,
  onOpenShortcuts,
}: AccountSettingsDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const boltIconRef = useRef<{ startAnimation: () => void; stopAnimation: () => void } | null>(null);
  const keyIconRef = useRef<{ startAnimation: () => void; stopAnimation: () => void } | null>(null);
  const sliderIconRef = useRef<{ startAnimation: () => void; stopAnimation: () => void } | null>(null);
  const appearIconRef = useRef<{ startAnimation: () => void; stopAnimation: () => void } | null>(null);
  const keyboardIconRef = useRef<{ startAnimation: () => void; stopAnimation: () => void } | null>(null);

  const [coords, setCoords] = useState<{ top: number; left: number; width: number } | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const updatePosition = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const cardWidth = 272;
    // Shift slightly to the right as requested, but ensure it never clips off-screen
    const left = Math.max(16, Math.min(rect.left + 4, window.innerWidth - cardWidth - 16));

    setCoords({
      top: rect.top - 10, // Places bottom 10px above the trigger button via translateY(-100%)
      left,
      width: cardWidth,
    });
  };

  useIsomorphicLayoutEffect(() => {
    if (isOpen) {
      updatePosition();
      window.addEventListener("scroll", updatePosition, true);
      window.addEventListener("resize", updatePosition);
      return () => {
        window.removeEventListener("scroll", updatePosition, true);
        window.removeEventListener("resize", updatePosition);
      };
    } else {
      setCoords(null);
    }
  }, [isOpen]);

  // Click outside listener (safe across portal)
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (
        triggerRef.current &&
        !triggerRef.current.contains(target) &&
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

  // Escape key listener
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

  return (
    <>
      {/* Trigger Button inside Sidebar Footer */}
      <button
        ref={triggerRef}
        type="button"
        onMouseEnter={() => boltIconRef.current?.startAnimation()}
        onMouseLeave={() => boltIconRef.current?.stopAnimation()}
        onClick={() => {
          if (!isOpen) {
            updatePosition();
          }
          setIsOpen(!isOpen);
        }}
        className={`w-full flex items-center justify-between p-2 rounded-xl transition-all duration-200 cursor-pointer select-none group border ${
          isDark
            ? "bg-purple-950/25 hover:bg-purple-900/40 border-purple-500/20 hover:border-purple-500/40 text-purple-100"
            : "bg-purple-50/60 hover:bg-purple-100/80 border-purple-200/80 hover:border-purple-300 text-purple-950"
        } ${isOpen ? (isDark ? "ring-2 ring-purple-500/40 bg-purple-900/40" : "ring-2 ring-purple-300 bg-purple-100") : ""}`}
        title="Account & Settings"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          {/* Animated Bolt Icon badge */}
          <div className="relative shrink-0">
            <div
              style={{
                backgroundColor: `${accentColor}18`,
                borderColor: `${accentColor}35`,
                boxShadow: `0 0 10px ${accentColor}25`,
              }}
              className="w-7 h-7 rounded-lg flex items-center justify-center shadow-sm transition-transform duration-300 group-hover:scale-105 border"
            >
              <BoltIcon
                ref={boltIconRef}
                size={18}
                duration={1}
                color={accentColor}
              />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 border border-[#0e071d]" />
          </div>

          <div className="flex flex-col text-left truncate">
            <span className="text-xs font-semibold leading-tight truncate">Account & Settings</span>
            <span className="text-[10px] opacity-60 leading-tight">Preferences & Config</span>
          </div>
        </div>

        {/* Chevron Icon (Rotates 180deg when open) */}
        <svg
          className={`w-4 h-4 shrink-0 transition-transform duration-200 opacity-60 group-hover:opacity-100 ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Popover Dropdown (Portaled outside, opens upwards and slightly right) */}
      {mounted && isOpen && coords &&
        createPortal(
          <div
            ref={dropdownRef}
            style={{
              position: "fixed",
              top: `${coords.top}px`,
              left: `${coords.left}px`,
              width: `${coords.width}px`,
              transform: "translateY(-100%)",
              transformOrigin: "bottom left",
              zIndex: 999999,
              borderColor: isDark ? `${accentColor}40` : undefined,
              boxShadow: isDark
                ? `0 24px 60px rgba(0,0,0,0.85), 0 0 30px ${accentColor}25`
                : undefined,
            }}
            className={`rounded-2xl overflow-hidden shadow-2xl border origin-bottom-left animate-in fade-in-0 zoom-in-95 duration-200 ease-out p-1.5 ${
              isDark
                ? "bg-[#130b24]/95 text-white backdrop-blur-2xl"
                : "bg-white/95 border-purple-200 text-purple-950 shadow-[0_24px_60px_rgba(85,45,145,0.2)] backdrop-blur-2xl"
            }`}
          >
            {/* Header: User Profile Details */}
            <div
              className={`p-2.5 rounded-xl flex items-center justify-between mb-1 ${
                isDark ? "bg-purple-950/40 border border-purple-500/20" : "bg-purple-50/70 border border-purple-100"
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-md uppercase transition-all duration-300"
                  style={{
                    background: `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)`,
                    boxShadow: `0 2px 10px ${accentColor}40`,
                  }}
                >
                  {(userName || "Aniket Lad").trim().charAt(0) || "A"}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-semibold truncate leading-tight">{userName || "Aniket Lad"}</p>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  </div>
                  <p className="text-[10px] opacity-60 truncate">Free Plan • v2.0</p>
                </div>
              </div>
              <span
                className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded-md font-semibold tracking-wider border transition-all duration-300"
                style={{
                  borderColor: `${accentColor}40`,
                  color: accentColor,
                  backgroundColor: `${accentColor}18`,
                }}
              >
                {userDomain || "Agentic"}
              </span>
            </div>

            {/* Section Divider */}
            <div className={`h-px my-1 ${isDark ? "bg-purple-500/20" : "bg-purple-100"}`} />

            {/* Menu Section 1: AI & Keys */}
            <div className="space-y-0.5">
              <div className="px-2 py-1 text-[10px] font-bold tracking-wider uppercase opacity-50 select-none">
                Configuration
              </div>

              {/* 1. Custom API Keys */}
              <button
                type="button"
                onClick={() => {
                  if (onOpenApiKeys) onOpenApiKeys();
                  setIsOpen(false);
                }}
                onMouseEnter={() => keyIconRef.current?.startAnimation()}
                onMouseLeave={() => keyIconRef.current?.stopAnimation()}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-medium transition-colors select-none cursor-pointer group/item text-left ${
                  isDark
                    ? "hover:bg-purple-900/30 text-purple-100"
                    : "hover:bg-purple-100/60 text-purple-950"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    style={{
                      backgroundColor: `${accentColor}18`,
                      borderColor: `${accentColor}30`,
                    }}
                    className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border transition-transform duration-200 group-hover/item:scale-105"
                  >
                    <KeyRoundIcon
                      ref={keyIconRef}
                      size={16}
                      duration={1}
                      color={accentColor}
                    />
                  </div>
                  <span>Custom API Keys</span>
                </div>
                <span
                  style={{
                    borderColor: `${accentColor}40`,
                    color: accentColor,
                    backgroundColor: `${accentColor}12`,
                  }}
                  className="text-[9px] font-mono px-1.5 py-0.5 rounded border"
                >
                  BYOK
                </span>
              </button>

              {/* 2. AI Response Settings */}
              <button
                type="button"
                onClick={() => {
                  if (onOpenResponseSettings) onOpenResponseSettings();
                  setIsOpen(false);
                }}
                onMouseEnter={() => sliderIconRef.current?.startAnimation()}
                onMouseLeave={() => sliderIconRef.current?.stopAnimation()}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-medium transition-colors select-none cursor-pointer group/item text-left ${
                  isDark
                    ? "hover:bg-purple-900/30 text-purple-100"
                    : "hover:bg-purple-100/60 text-purple-950"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    style={{
                      backgroundColor: `${accentColor}18`,
                      borderColor: `${accentColor}30`,
                    }}
                    className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border transition-transform duration-200 group-hover/item:scale-105"
                  >
                    <SlidersHorizontalIcon
                      ref={sliderIconRef}
                      size={16}
                      duration={1}
                      color={accentColor}
                    />
                  </div>
                  <span>AI Response Settings</span>
                </div>
                <span
                  style={{
                    borderColor: `${accentColor}40`,
                    color: accentColor,
                    backgroundColor: `${accentColor}12`,
                  }}
                  className="text-[9px] font-mono px-1.5 py-0.5 rounded border"
                >
                  Style
                </span>
              </button>

              {/* 3. Appearance & Performance */}
              <button
                type="button"
                onClick={() => {
                  if (onOpenPersonalization) onOpenPersonalization();
                  setIsOpen(false);
                }}
                onMouseEnter={() => appearIconRef.current?.startAnimation()}
                onMouseLeave={() => appearIconRef.current?.stopAnimation()}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-medium transition-colors select-none cursor-pointer group/item text-left ${
                  isDark
                    ? "hover:bg-purple-900/30 text-purple-100"
                    : "hover:bg-purple-100/60 text-purple-950"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    style={{
                      backgroundColor: `${accentColor}18`,
                      borderColor: `${accentColor}30`,
                    }}
                    className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border transition-transform duration-200 group-hover/item:scale-105"
                  >
                    <UserRoundCogIcon
                      ref={appearIconRef}
                      size={16}
                      duration={1}
                      color={accentColor}
                    />
                  </div>
                  <span>Appearance & Performance</span>
                </div>
                <span
                  style={{
                    borderColor: `${accentColor}40`,
                    color: accentColor,
                    backgroundColor: `${accentColor}12`,
                  }}
                  className="text-[9px] font-mono px-1.5 py-0.5 rounded border"
                >
                  Theme
                </span>
              </button>
            </div>

            {/* Section Divider */}
            <div className={`h-px my-1.5 ${isDark ? "bg-purple-500/20" : "bg-purple-100"}`} />

            {/* Menu Section 2: Shortcuts */}
            <div className="space-y-0.5">
              <div className="px-2 py-1 text-[10px] font-bold tracking-wider uppercase opacity-50 select-none">
                System
              </div>

              {/* 4. Keyboard Shortcuts */}
              <button
                type="button"
                onClick={() => {
                  if (onOpenShortcuts) onOpenShortcuts();
                  setIsOpen(false);
                }}
                onMouseEnter={() => keyboardIconRef.current?.startAnimation()}
                onMouseLeave={() => keyboardIconRef.current?.stopAnimation()}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-medium transition-colors select-none cursor-pointer group/item text-left ${
                  isDark
                    ? "hover:bg-purple-900/30 text-purple-100"
                    : "hover:bg-purple-100/60 text-purple-950"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    style={{
                      backgroundColor: `${accentColor}18`,
                      borderColor: `${accentColor}30`,
                    }}
                    className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border transition-transform duration-200 group-hover/item:scale-105"
                  >
                    <KeyboardIcon
                      ref={keyboardIconRef}
                      size={16}
                      duration={1}
                      color={accentColor}
                    />
                  </div>
                  <span>Keyboard Shortcuts</span>
                </div>
                <span
                  style={{
                    borderColor: `${accentColor}40`,
                    color: accentColor,
                    backgroundColor: `${accentColor}12`,
                  }}
                  className="text-[9px] font-mono px-1.5 py-0.5 rounded border"
                >
                  ⌘K
                </span>
              </button>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
