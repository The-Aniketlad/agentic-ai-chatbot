"use client";

import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import {
  UserRoundCogIcon,
  SunIcon,
  MoonIcon,
  LaptopIcon,
  PaletteIcon,
  AArrowDownIcon,
  TypeIcon,
  AArrowUpIcon,
  RocketIcon,
  PencilIcon,
  BatteryChargingIcon,
  ActivityIcon,
  UserIcon,
  CodeXmlIcon,
  SearchIcon,
  GraduationCapIcon,
  BriefcaseIcon,
  CircleCheckIcon,
  RotateCcwIcon,
} from "@animateicons/react/lucide";
import {
  CheckmarkCircle01Icon,
  type CheckmarkCircle01IconHandle,
} from "@animateicons/react/huge";

export type ThemeMode = "dark" | "light" | "system";
export type FontDensity = "compact" | "default" | "spacious";
export type StreamingMode = "instant" | "fluid";
export type UserDomain = "developer" | "researcher" | "student" | "founder";

export interface PersonalizationSettings {
  theme: ThemeMode;
  accentColor: string;
  fontDensity: FontDensity;
  streamingMode: StreamingMode;
  batterySaver: boolean;
  showTelemetry: boolean;
  userName: string;
  userDomain: UserDomain;
}

interface PersonalizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDark: boolean;
  onSettingsSaved?: (settings: PersonalizationSettings) => void;
}

const PRESET_COLORS = [
  { name: "Astra Purple", hex: "#a855f7" },
  { name: "Emerald Neon", hex: "#10b981" },
  { name: "Electric Blue", hex: "#3b82f6" },
  { name: "Sunset Amber", hex: "#f59e0b" },
  { name: "Rose Quartz", hex: "#ec4899" },
  { name: "Cyber Yellow", hex: "#eab308" },
  { name: "Crimson Fire", hex: "#ef4444" },
  { name: "Slate Stealth", hex: "#64748b" },
];

export function PersonalizationModal({
  isOpen,
  onClose,
  isDark,
  onSettingsSaved,
}: PersonalizationModalProps) {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<"appearance" | "performance" | "profile">("appearance");

  // State values
  const [themeMode, setThemeMode] = useState<ThemeMode>("dark");
  const [accentColor, setAccentColor] = useState<string>("#a855f7");
  const [fontDensity, setFontDensity] = useState<FontDensity>("default");
  const [streamingMode, setStreamingMode] = useState<StreamingMode>("instant");
  const [batterySaver, setBatterySaver] = useState<boolean>(false);
  const [showTelemetry, setShowTelemetry] = useState<boolean>(true);
  const [userName, setUserName] = useState<string>("Aniket Lad");
  const [userDomain, setUserDomain] = useState<UserDomain>("developer");

  const [savedSuccess, setSavedSuccess] = useState(false);

  // Icon refs for animations
  const headerIconRef = useRef<{ startAnimation: () => void; stopAnimation: () => void } | null>(null);
  const bannerIconRef = useRef<CheckmarkCircle01IconHandle>(null);
  const saveIconRef = useRef<{ startAnimation: () => void; stopAnimation: () => void } | null>(null);
  const resetIconRef = useRef<{ startAnimation: () => void; stopAnimation: () => void } | null>(null);

  // Theme icons
  const moonIconRef = useRef<{ startAnimation: () => void; stopAnimation: () => void } | null>(null);
  const sunIconRef = useRef<{ startAnimation: () => void; stopAnimation: () => void } | null>(null);
  const laptopIconRef = useRef<{ startAnimation: () => void; stopAnimation: () => void } | null>(null);

  // Font density icons
  const downFontIconRef = useRef<{ startAnimation: () => void; stopAnimation: () => void } | null>(null);
  const defaultFontIconRef = useRef<{ startAnimation: () => void; stopAnimation: () => void } | null>(null);
  const upFontIconRef = useRef<{ startAnimation: () => void; stopAnimation: () => void } | null>(null);

  // Performance icons
  const rocketIconRef = useRef<{ startAnimation: () => void; stopAnimation: () => void } | null>(null);
  const pencilIconRef = useRef<{ startAnimation: () => void; stopAnimation: () => void } | null>(null);
  const batteryIconRef = useRef<{ startAnimation: () => void; stopAnimation: () => void } | null>(null);
  const activityIconRef = useRef<{ startAnimation: () => void; stopAnimation: () => void } | null>(null);

  // Profile icons
  const devIconRef = useRef<{ startAnimation: () => void; stopAnimation: () => void } | null>(null);
  const searchIconRef = useRef<{ startAnimation: () => void; stopAnimation: () => void } | null>(null);
  const studentIconRef = useRef<{ startAnimation: () => void; stopAnimation: () => void } | null>(null);
  const founderIconRef = useRef<{ startAnimation: () => void; stopAnimation: () => void } | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Hydrate settings from localStorage when opening
  useEffect(() => {
    if (isOpen) {
      const storedTheme = (localStorage.getItem("astra_theme") as ThemeMode) || "dark";
      const storedColor = localStorage.getItem("astra_accent_color") || "#a855f7";
      const storedDensity = (localStorage.getItem("astra_font_density") as FontDensity) || "default";
      const storedStream = (localStorage.getItem("astra_streaming_mode") as StreamingMode) || "instant";
      const storedBattery = localStorage.getItem("astra_battery_saver") === "true";
      const storedTelemetry = localStorage.getItem("astra_show_telemetry") !== "false";
      const storedName = localStorage.getItem("astra_user_name") || "Aniket Lad";
      const storedDomain = (localStorage.getItem("astra_user_domain") as UserDomain) || "developer";

      setThemeMode(storedTheme);
      setAccentColor(storedColor);
      setFontDensity(storedDensity);
      setStreamingMode(storedStream);
      setBatterySaver(storedBattery);
      setShowTelemetry(storedTelemetry);
      setUserName(storedName);
      setUserDomain(storedDomain);
      setSavedSuccess(false);

      setTimeout(() => {
        headerIconRef.current?.startAnimation();
      }, 150);
    }
  }, [isOpen]);

  useEffect(() => {
    if (savedSuccess) {
      bannerIconRef.current?.startAnimation();
      const timer = setTimeout(() => {
        setSavedSuccess(false);
      }, 2800);
      return () => clearTimeout(timer);
    }
  }, [savedSuccess]);

  // Escape key listener
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
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

  if (!mounted || !isOpen) return null;

  const handleSave = () => {
    saveIconRef.current?.startAnimation();

    const payload: PersonalizationSettings = {
      theme: themeMode,
      accentColor,
      fontDensity,
      streamingMode,
      batterySaver,
      showTelemetry,
      userName: userName.trim() || "Aniket Lad",
      userDomain,
    };

    // Persist to localStorage
    localStorage.setItem("astra_theme", payload.theme);
    localStorage.setItem("astra_accent_color", payload.accentColor);
    localStorage.setItem("astra_font_density", payload.fontDensity);
    localStorage.setItem("astra_streaming_mode", payload.streamingMode);
    localStorage.setItem("astra_battery_saver", payload.batterySaver ? "true" : "false");
    localStorage.setItem("astra_show_telemetry", payload.showTelemetry ? "true" : "false");
    localStorage.setItem("astra_user_name", payload.userName);
    localStorage.setItem("astra_user_domain", payload.userDomain);

    // Broadcast saved event
    if (onSettingsSaved) {
      onSettingsSaved(payload);
    }

    setSavedSuccess(true);
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  const handleResetDefaults = () => {
    resetIconRef.current?.startAnimation();
    setThemeMode("dark");
    setAccentColor("#a855f7");
    setFontDensity("default");
    setStreamingMode("instant");
    setBatterySaver(false);
    setShowTelemetry(true);
    setUserName("Aniket Lad");
    setUserDomain("developer");
  };

  return createPortal(
    <>
      {/* Top Center Dropdown Banner (Matches AI Response & API Keys Banner) */}
      {savedSuccess && (
        <div
          className={`fixed top-6 left-1/2 -translate-x-1/2 z-[9999999] px-5 py-3 rounded-2xl flex items-center gap-3 shadow-2xl border backdrop-blur-xl transition-all duration-300 astra-banner-drop select-none pointer-events-none ${
            isDark
              ? "bg-[#180a33]/95 border-emerald-500/50 text-emerald-300 shadow-[0_10px_40px_rgba(16,185,129,0.35)]"
              : "bg-white/95 border-emerald-400 text-emerald-900 shadow-[0_10px_35px_rgba(16,185,129,0.25)]"
          }`}
        >
          <div
            className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
              isDark ? "bg-emerald-500/20 text-emerald-300" : "bg-emerald-100 text-emerald-700"
            }`}
          >
            <CheckmarkCircle01Icon
              ref={bannerIconRef}
              size={20}
              duration={0.8}
              color={isDark ? "#34d399" : "#059669"}
            />
          </div>
          <div className="text-xs sm:text-sm font-semibold tracking-wide select-none whitespace-nowrap">
            Personalization preferences saved & synced across session!
          </div>
        </div>
      )}

      {/* Main Modal Overlay with HeroUI Glassmorphic Styling */}
      <div className="fixed inset-0 z-[999999] flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-md animate-in fade-in-0 duration-200">
        {/* Click outside backdrop */}
        <div className="fixed inset-0" onClick={onClose} />

        {/* Main Modal Dialog Box */}
        <div
          className={`relative w-full max-w-xl rounded-2xl overflow-hidden shadow-2xl border transition-all duration-200 animate-in zoom-in-95 fade-in-0 flex flex-col max-h-[92vh] ${
            isDark
              ? "bg-[#130b24]/95 border-purple-500/35 text-white shadow-[0_24px_70px_rgba(0,0,0,0.9),0_0_35px_rgba(168,85,247,0.25)] backdrop-blur-2xl"
              : "bg-white/95 border-purple-200 text-purple-950 shadow-[0_24px_70px_rgba(85,45,145,0.2)] backdrop-blur-2xl"
          }`}
        >
          {/* HeroUI-inspired Ambient Top Glow & Beam line */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-28 opacity-60 transition-all duration-300"
            style={{
              background: `linear-gradient(to bottom, ${accentColor}25, transparent)`,
            }}
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-12 top-0 h-px transition-all duration-300"
            style={{
              background: `linear-gradient(to right, transparent, ${accentColor}80, transparent)`,
            }}
          />

          {/* Modal Header */}
          <div
            className={`relative flex items-center justify-between p-4 md:p-5 border-b shrink-0 ${
              isDark ? "border-purple-500/20 bg-purple-950/30" : "border-purple-100 bg-purple-50/50"
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                onMouseEnter={() => headerIconRef.current?.startAnimation()}
                onMouseLeave={() => headerIconRef.current?.stopAnimation()}
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border cursor-pointer transition-all duration-200 hover:scale-105"
                style={{
                  backgroundColor: `${accentColor}18`,
                  borderColor: `${accentColor}40`,
                  boxShadow: `0 0 14px ${accentColor}25`,
                }}
              >
                <UserRoundCogIcon
                  ref={headerIconRef}
                  size={22}
                  duration={1}
                  color={accentColor}
                />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold tracking-tight leading-snug">
                  Appearance & Performance
                </h3>
                <p className="text-xs opacity-65 leading-tight">
                  Personalize theme modes, accent colors, typing speed & your persona
                </p>
              </div>
            </div>

            {/* Modal Close Trigger Button */}
            <button
              type="button"
              onClick={onClose}
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                isDark
                  ? "hover:bg-purple-500/20 text-purple-300 hover:text-white"
                  : "hover:bg-purple-100 text-purple-700 hover:text-purple-950"
              }`}
              title="Close (Esc)"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Segmented Pill Tabs Navigation Bar */}
          <div className={`p-3 pb-0 border-b shrink-0 ${isDark ? "border-purple-500/15 bg-[#170e2e]/40" : "border-purple-100 bg-purple-50/40"}`}>
            <nav className="flex p-1 gap-1.5 rounded-xl bg-purple-950/40 border border-purple-500/20 shadow-inner" aria-label="Personalization Tabs">
              <button
                type="button"
                onClick={() => setActiveTab("appearance")}
                style={
                  activeTab === "appearance"
                    ? {
                        background: `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)`,
                        boxShadow: `0 4px 16px ${accentColor}40`,
                      }
                    : undefined
                }
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer select-none ${
                  activeTab === "appearance"
                    ? "text-white scale-[1.01]"
                    : isDark
                    ? "text-purple-300 hover:text-white hover:bg-purple-900/30"
                    : "text-purple-700 hover:text-purple-950 hover:bg-purple-100/60"
                }`}
              >
                <PaletteIcon size={16} duration={0.8} color={activeTab === "appearance" ? "#ffffff" : isDark ? "#c084fc" : "#7c3aed"} />
                <span>Appearance</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("performance")}
                style={
                  activeTab === "performance"
                    ? {
                        background: `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)`,
                        boxShadow: `0 4px 16px ${accentColor}40`,
                      }
                    : undefined
                }
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer select-none ${
                  activeTab === "performance"
                    ? "text-white scale-[1.01]"
                    : isDark
                    ? "text-purple-300 hover:text-white hover:bg-purple-900/30"
                    : "text-purple-700 hover:text-purple-950 hover:bg-purple-100/60"
                }`}
              >
                <RocketIcon size={16} duration={0.8} color={activeTab === "performance" ? "#ffffff" : isDark ? "#c084fc" : "#7c3aed"} />
                <span>Performance</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("profile")}
                style={
                  activeTab === "profile"
                    ? {
                        background: `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)`,
                        boxShadow: `0 4px 16px ${accentColor}40`,
                      }
                    : undefined
                }
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer select-none ${
                  activeTab === "profile"
                    ? "text-white scale-[1.01]"
                    : isDark
                    ? "text-purple-300 hover:text-white hover:bg-purple-900/30"
                    : "text-purple-700 hover:text-purple-950 hover:bg-purple-100/60"
                }`}
              >
                <UserIcon size={16} duration={0.8} color={activeTab === "profile" ? "#ffffff" : isDark ? "#c084fc" : "#7c3aed"} />
                <span>User Profile</span>
              </button>
            </nav>
          </div>

          {/* Modal Scrollable Body */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
            {/* ============================================================== */}
            {/* TAB 1: APPEARANCE (Theme modes, Accent palette, Font density) */}
            {/* ============================================================== */}
            {activeTab === "appearance" && (
              <div className="space-y-6 animate-in fade-in-50 duration-200">
                {/* 1. Interface Theme Modes */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider opacity-75">
                      Interface Theme Mode
                    </label>
                    <span className="text-[11px] font-mono opacity-50 capitalize">
                      Active: {themeMode}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    {/* Dark Mode */}
                    <button
                      type="button"
                      onClick={() => setThemeMode("dark")}
                      onMouseEnter={() => moonIconRef.current?.startAnimation()}
                      onMouseLeave={() => moonIconRef.current?.stopAnimation()}
                      style={
                        themeMode === "dark"
                          ? {
                              borderColor: accentColor,
                              boxShadow: `0 0 18px ${accentColor}40`,
                              backgroundColor: isDark ? `${accentColor}18` : `${accentColor}10`,
                            }
                          : undefined
                      }
                      className={`p-3.5 rounded-xl border flex flex-col items-center justify-center gap-2 text-center transition-all cursor-pointer group ${
                        themeMode === "dark"
                          ? "scale-[1.02]"
                          : isDark
                          ? "bg-purple-950/20 border-purple-500/20 hover:border-purple-500/40 hover:bg-purple-900/20"
                          : "bg-purple-50/50 border-purple-100 hover:border-purple-200"
                      }`}
                    >
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110">
                        <MoonIcon
                          ref={moonIconRef}
                          size={24}
                          duration={0.8}
                          color={themeMode === "dark" ? accentColor : isDark ? "#a855f7" : "#7c3aed"}
                        />
                      </div>
                      <div>
                        <div className="text-xs font-bold leading-tight" style={themeMode === "dark" ? { color: accentColor } : undefined}>Dark</div>
                        <div className="text-[10px] opacity-60">Deep obsidian</div>
                      </div>
                    </button>

                    {/* Light Mode */}
                    <button
                      type="button"
                      onClick={() => setThemeMode("light")}
                      onMouseEnter={() => sunIconRef.current?.startAnimation()}
                      onMouseLeave={() => sunIconRef.current?.stopAnimation()}
                      style={
                        themeMode === "light"
                          ? {
                              borderColor: accentColor,
                              boxShadow: `0 0 18px ${accentColor}40`,
                              backgroundColor: isDark ? `${accentColor}18` : `${accentColor}10`,
                            }
                          : undefined
                      }
                      className={`p-3.5 rounded-xl border flex flex-col items-center justify-center gap-2 text-center transition-all cursor-pointer group ${
                        themeMode === "light"
                          ? "scale-[1.02]"
                          : isDark
                          ? "bg-purple-950/20 border-purple-500/20 hover:border-purple-500/40 hover:bg-purple-900/20"
                          : "bg-purple-50/50 border-purple-100 hover:border-purple-200"
                      }`}
                    >
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110">
                        <SunIcon
                          ref={sunIconRef}
                          size={24}
                          duration={0.8}
                          color={themeMode === "light" ? accentColor : isDark ? "#a855f7" : "#7c3aed"}
                        />
                      </div>
                      <div>
                        <div className="text-xs font-bold leading-tight" style={themeMode === "light" ? { color: accentColor } : undefined}>Light</div>
                        <div className="text-[10px] opacity-60">Luminous glow</div>
                      </div>
                    </button>

                    {/* System Auto */}
                    <button
                      type="button"
                      onClick={() => setThemeMode("system")}
                      onMouseEnter={() => laptopIconRef.current?.startAnimation()}
                      onMouseLeave={() => laptopIconRef.current?.stopAnimation()}
                      style={
                        themeMode === "system"
                          ? {
                              borderColor: accentColor,
                              boxShadow: `0 0 18px ${accentColor}40`,
                              backgroundColor: isDark ? `${accentColor}18` : `${accentColor}10`,
                            }
                          : undefined
                      }
                      className={`p-3.5 rounded-xl border flex flex-col items-center justify-center gap-2 text-center transition-all cursor-pointer group ${
                        themeMode === "system"
                          ? "scale-[1.02]"
                          : isDark
                          ? "bg-purple-950/20 border-purple-500/20 hover:border-purple-500/40 hover:bg-purple-900/20"
                          : "bg-purple-50/50 border-purple-100 hover:border-purple-200"
                      }`}
                    >
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110">
                        <LaptopIcon
                          ref={laptopIconRef}
                          size={24}
                          duration={0.8}
                          color={themeMode === "system" ? accentColor : isDark ? "#a855f7" : "#7c3aed"}
                        />
                      </div>
                      <div>
                        <div className="text-xs font-bold leading-tight" style={themeMode === "system" ? { color: accentColor } : undefined}>System</div>
                        <div className="text-[10px] opacity-60">OS synchronized</div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* 2. Color Accent Palette (Inspired by Color_palette/demo.tsx) */}
                <div className="space-y-3 pt-2 border-t border-purple-500/15">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider opacity-75">
                        Color Accent Palette
                      </label>
                      <p className="text-[11px] opacity-60">
                        Primary brand accent, glow illumination & interactive highlights
                      </p>
                    </div>
                    <span className="text-xs font-mono font-bold uppercase px-2 py-0.5 rounded-md border" style={{ borderColor: accentColor + '50', color: accentColor, backgroundColor: accentColor + '18' }}>
                      {accentColor}
                    </span>
                  </div>

                  {/* Preset Swatches */}
                  <div className="grid grid-cols-4 sm:grid-cols-8 gap-2.5">
                    {PRESET_COLORS.map((col) => {
                      const isSelected = accentColor.toLowerCase() === col.hex.toLowerCase();
                      return (
                        <button
                          key={col.hex}
                          type="button"
                          onClick={() => setAccentColor(col.hex)}
                          className={`group relative h-9 w-9 rounded-full transition-all duration-200 flex items-center justify-center cursor-pointer ${
                            isSelected
                              ? "scale-115 ring-2 ring-white shadow-lg"
                              : "hover:scale-105 opacity-80 hover:opacity-100"
                          }`}
                          style={{
                            backgroundColor: col.hex,
                            boxShadow: isSelected ? `0 0 16px ${col.hex}90` : "none",
                          }}
                          title={col.name}
                        >
                          {isSelected && (
                            <svg className="w-4 h-4 text-white drop-shadow-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Custom Color Input row */}
                  <div className="flex items-center gap-3 pt-1">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-purple-500/25 bg-purple-950/30">
                      <input
                        type="color"
                        id="astra-custom-color"
                        value={accentColor}
                        onChange={(e) => setAccentColor(e.target.value)}
                        className="w-7 h-7 rounded-md cursor-pointer border-0 p-0 bg-transparent"
                      />
                      <label htmlFor="astra-custom-color" className="text-xs font-medium cursor-pointer opacity-80 select-none">
                        Custom Picker
                      </label>
                    </div>

                    <div className="flex-1 flex items-center px-3 py-1.5 rounded-xl border border-purple-500/25 bg-purple-950/30 focus-within:border-purple-400">
                      <span className="text-xs opacity-50 font-mono select-none">HEX</span>
                      <input
                        type="text"
                        value={accentColor}
                        onChange={(e) => {
                          const val = e.target.value;
                          setAccentColor(val.startsWith("#") ? val : `#${val}`);
                        }}
                        placeholder="#a855f7"
                        className="w-full bg-transparent px-2 text-xs font-mono font-semibold outline-none"
                      />
                    </div>
                  </div>

                  {/* Live Accent Preview Box */}
                  <div
                    className="rounded-xl border p-3.5 transition-all flex items-center justify-between"
                    style={{
                      backgroundColor: accentColor + "15",
                      borderColor: accentColor + "45",
                      boxShadow: `0 0 20px ${accentColor}12`,
                    }}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-3.5 h-3.5 rounded-full transition-all"
                        style={{
                          backgroundColor: accentColor,
                          boxShadow: `0 0 12px ${accentColor}`,
                        }}
                      />
                      <div>
                        <div className="text-xs font-bold leading-tight" style={{ color: accentColor }}>
                          Live Accent Glow Preview
                        </div>
                        <div className="text-[10px] opacity-75">
                          Buttons, badges, and focus rings will reflect this hue
                        </div>
                      </div>
                    </div>
                    <span
                      className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-md border font-semibold"
                      style={{
                        color: accentColor,
                        borderColor: accentColor + "50",
                        backgroundColor: accentColor + "25",
                      }}
                    >
                      Active
                    </span>
                  </div>
                </div>

                {/* 3. Chat Font Density (Inspired by Fonticons.jsx & segmentedpillbar.html) */}
                <div className="space-y-2.5 pt-2 border-t border-purple-500/15">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider opacity-75">
                        Chat Font Density & Spacing
                      </label>
                      <p className="text-[11px] opacity-60">
                        Adjust line heights, bubble padding, and typography scale
                      </p>
                    </div>
                    <span className="text-[11px] font-mono opacity-50 capitalize">
                      {fontDensity}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    {/* Compact */}
                    <button
                      type="button"
                      onClick={() => setFontDensity("compact")}
                      onMouseEnter={() => downFontIconRef.current?.startAnimation()}
                      onMouseLeave={() => downFontIconRef.current?.stopAnimation()}
                      style={
                        fontDensity === "compact"
                          ? {
                              borderColor: accentColor,
                              boxShadow: `0 0 16px ${accentColor}35`,
                              backgroundColor: isDark ? `${accentColor}18` : `${accentColor}10`,
                            }
                          : undefined
                      }
                      className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 text-center transition-all cursor-pointer group ${
                        fontDensity === "compact"
                          ? "scale-[1.02]"
                          : isDark
                          ? "bg-purple-950/20 border-purple-500/20 hover:border-purple-500/40"
                          : "bg-purple-50/50 border-purple-100"
                      }`}
                    >
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110">
                        <AArrowDownIcon
                          ref={downFontIconRef}
                          size={20}
                          duration={0.8}
                          color={fontDensity === "compact" ? accentColor : isDark ? "#a855f7" : "#7c3aed"}
                        />
                      </div>
                      <div className="text-xs font-bold leading-tight" style={fontDensity === "compact" ? { color: accentColor } : undefined}>Compact</div>
                      <div className="text-[9px] opacity-60">Dense for speed</div>
                    </button>

                    {/* Default */}
                    <button
                      type="button"
                      onClick={() => setFontDensity("default")}
                      onMouseEnter={() => defaultFontIconRef.current?.startAnimation()}
                      onMouseLeave={() => defaultFontIconRef.current?.stopAnimation()}
                      style={
                        fontDensity === "default"
                          ? {
                              borderColor: accentColor,
                              boxShadow: `0 0 16px ${accentColor}35`,
                              backgroundColor: isDark ? `${accentColor}18` : `${accentColor}10`,
                            }
                          : undefined
                      }
                      className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 text-center transition-all cursor-pointer group ${
                        fontDensity === "default"
                          ? "scale-[1.02]"
                          : isDark
                          ? "bg-purple-950/20 border-purple-500/20 hover:border-purple-500/40"
                          : "bg-purple-50/50 border-purple-100"
                      }`}
                    >
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110">
                        <TypeIcon
                          ref={defaultFontIconRef}
                          size={20}
                          duration={0.8}
                          color={fontDensity === "default" ? accentColor : isDark ? "#a855f7" : "#7c3aed"}
                        />
                      </div>
                      <div className="text-xs font-bold leading-tight" style={fontDensity === "default" ? { color: accentColor } : undefined}>Default</div>
                      <div className="text-[9px] opacity-60">Standard balanced</div>
                    </button>

                    {/* Spacious */}
                    <button
                      type="button"
                      onClick={() => setFontDensity("spacious")}
                      onMouseEnter={() => upFontIconRef.current?.startAnimation()}
                      onMouseLeave={() => upFontIconRef.current?.stopAnimation()}
                      style={
                        fontDensity === "spacious"
                          ? {
                              borderColor: accentColor,
                              boxShadow: `0 0 16px ${accentColor}35`,
                              backgroundColor: isDark ? `${accentColor}18` : `${accentColor}10`,
                            }
                          : undefined
                      }
                      className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 text-center transition-all cursor-pointer group ${
                        fontDensity === "spacious"
                          ? "scale-[1.02]"
                          : isDark
                          ? "bg-purple-950/20 border-purple-500/20 hover:border-purple-500/40"
                          : "bg-purple-50/50 border-purple-100"
                      }`}
                    >
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110">
                        <AArrowUpIcon
                          ref={upFontIconRef}
                          size={20}
                          duration={0.8}
                          color={fontDensity === "spacious" ? accentColor : isDark ? "#a855f7" : "#7c3aed"}
                        />
                      </div>
                      <div className="text-xs font-bold leading-tight" style={fontDensity === "spacious" ? { color: accentColor } : undefined}>Spacious</div>
                      <div className="text-[9px] opacity-60">Relaxed reading</div>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ============================================================== */}
            {/* TAB 2: PERFORMANCE (Streaming, Battery Saver, Telemetry)       */}
            {/* ============================================================== */}
            {activeTab === "performance" && (
              <div className="space-y-6 animate-in fade-in-50 duration-200">
                {/* 1. Streaming Speed Mode */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider opacity-75">
                        AI Streaming Cadence
                      </label>
                      <p className="text-[11px] opacity-60">
                        Choose between instant token dumps or smooth human typewriter rhythm
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {/* Instant Burst */}
                    <button
                      type="button"
                      onClick={() => setStreamingMode("instant")}
                      onMouseEnter={() => rocketIconRef.current?.startAnimation()}
                      onMouseLeave={() => rocketIconRef.current?.stopAnimation()}
                      style={
                        streamingMode === "instant"
                          ? {
                              borderColor: accentColor,
                              boxShadow: `0 0 18px ${accentColor}40`,
                              backgroundColor: isDark ? `${accentColor}18` : `${accentColor}10`,
                            }
                          : undefined
                      }
                      className={`p-4 rounded-xl border text-left transition-all cursor-pointer group flex items-start gap-3 ${
                        streamingMode === "instant"
                          ? "scale-[1.01]"
                          : isDark
                          ? "bg-purple-950/20 border-purple-500/20 hover:border-purple-500/40 hover:bg-purple-900/20"
                          : "bg-purple-50/50 border-purple-100"
                      }`}
                    >
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-transform group-hover:scale-110"
                        style={{ backgroundColor: `${accentColor}22` }}
                      >
                        <RocketIcon
                          ref={rocketIconRef}
                          size={22}
                          duration={0.8}
                          color={streamingMode === "instant" ? accentColor : isDark ? "#a855f7" : "#7c3aed"}
                        />
                      </div>
                      <div>
                        <div className="text-xs font-bold" style={streamingMode === "instant" ? { color: accentColor } : undefined}>Instant Burst</div>
                        <div className="text-[10px] opacity-60 mt-0.5 leading-relaxed">
                          Max throughput with zero rendering throttle. Best for coding.
                        </div>
                      </div>
                    </button>

                    {/* Fluid Typing */}
                    <button
                      type="button"
                      onClick={() => setStreamingMode("fluid")}
                      onMouseEnter={() => pencilIconRef.current?.startAnimation()}
                      onMouseLeave={() => pencilIconRef.current?.stopAnimation()}
                      style={
                        streamingMode === "fluid"
                          ? {
                              borderColor: accentColor,
                              boxShadow: `0 0 18px ${accentColor}40`,
                              backgroundColor: isDark ? `${accentColor}18` : `${accentColor}10`,
                            }
                          : undefined
                      }
                      className={`p-4 rounded-xl border text-left transition-all cursor-pointer group flex items-start gap-3 ${
                        streamingMode === "fluid"
                          ? "scale-[1.01]"
                          : isDark
                          ? "bg-purple-950/20 border-purple-500/20 hover:border-purple-500/40 hover:bg-purple-900/20"
                          : "bg-purple-50/50 border-purple-100"
                      }`}
                    >
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-transform group-hover:scale-110"
                        style={{ backgroundColor: `${accentColor}22` }}
                      >
                        <PencilIcon
                          ref={pencilIconRef}
                          size={22}
                          duration={0.8}
                          color={streamingMode === "fluid" ? accentColor : isDark ? "#a855f7" : "#7c3aed"}
                        />
                      </div>
                      <div>
                        <div className="text-xs font-bold" style={streamingMode === "fluid" ? { color: accentColor } : undefined}>Fluid Typing</div>
                        <div className="text-[10px] opacity-60 mt-0.5 leading-relaxed">
                          Natural, cinematic typewriter pacing for relaxed reading.
                        </div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* 2. Battery Saver & Lite Mode Toggle */}
                <div
                  className={`p-4 rounded-xl border flex items-center justify-between gap-4 transition-all ${
                    isDark ? "bg-purple-950/25 border-purple-500/25" : "bg-purple-50/50 border-purple-100"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      onMouseEnter={() => batteryIconRef.current?.startAnimation()}
                      onMouseLeave={() => batteryIconRef.current?.stopAnimation()}
                      className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                      style={{
                        backgroundColor: batterySaver ? `${accentColor}25` : "rgba(168, 85, 247, 0.15)",
                      }}
                    >
                      <BatteryChargingIcon
                        ref={batteryIconRef}
                        size={20}
                        duration={0.8}
                        color={batterySaver ? accentColor : isDark ? "#c084fc" : "#7c3aed"}
                      />
                    </div>
                    <div>
                      <div className="text-xs font-bold leading-tight">Battery Saver & Lite Mode</div>
                      <div className="text-[11px] opacity-60 mt-0.5 leading-snug">
                        Disables heavy backdrop-blur filters and animated gradient beams to save battery.
                      </div>
                    </div>
                  </div>

                  {/* Toggle Switch */}
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={batterySaver}
                      onChange={(e) => setBatterySaver(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div
                      style={
                        batterySaver
                          ? {
                              backgroundColor: accentColor,
                              borderColor: accentColor,
                              boxShadow: `0 0 14px ${accentColor}60`,
                            }
                          : undefined
                      }
                      className="w-11 h-6 bg-purple-950/60 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all border border-purple-500/40"
                    ></div>
                  </label>
                </div>

                {/* 3. Real-Time Telemetry & Latency Badge Toggle */}
                <div
                  className={`p-4 rounded-xl border flex items-center justify-between gap-4 transition-all ${
                    isDark ? "bg-purple-950/25 border-purple-500/25" : "bg-purple-50/50 border-purple-100"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      onMouseEnter={() => activityIconRef.current?.startAnimation()}
                      onMouseLeave={() => activityIconRef.current?.stopAnimation()}
                      className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                      style={{
                        backgroundColor: showTelemetry ? `${accentColor}25` : "rgba(168, 85, 247, 0.15)",
                      }}
                    >
                      <ActivityIcon
                        ref={activityIconRef}
                        size={20}
                        duration={0.8}
                        color={showTelemetry ? accentColor : isDark ? "#c084fc" : "#7c3aed"}
                      />
                    </div>
                    <div>
                      <div className="text-xs font-bold leading-tight">Live Telemetry & Latency Badge</div>
                      <div className="text-[11px] opacity-60 mt-0.5 leading-snug">
                        Displays generation throughput (tok/s) and time-to-first-token on AI bubbles.
                      </div>
                    </div>
                  </div>

                  {/* Toggle Switch */}
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={showTelemetry}
                      onChange={(e) => setShowTelemetry(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div
                      style={
                        showTelemetry
                          ? {
                              backgroundColor: accentColor,
                              borderColor: accentColor,
                              boxShadow: `0 0 14px ${accentColor}60`,
                            }
                          : undefined
                      }
                      className="w-11 h-6 bg-purple-950/60 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all border border-purple-500/40"
                    ></div>
                  </label>
                </div>
              </div>
            )}

            {/* ============================================================== */}
            {/* TAB 3: USER PROFILE (Display name, Domain/Profession Focus)    */}
            {/* ============================================================== */}
            {activeTab === "profile" && (
              <div className="space-y-6 animate-in fade-in-50 duration-200">
                {/* 1. Display / Calling Name */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider opacity-75">
                    Calling / Display Name
                  </label>
                  <p className="text-[11px] opacity-60">
                    How Astra AI should address you during greeting & conversational steps
                  </p>

                  <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border border-purple-500/25 bg-purple-950/30 focus-within:border-purple-400 focus-within:ring-1 focus-within:ring-purple-400/40 transition-all">
                    <UserIcon size={18} duration={0.8} color={isDark ? "#c084fc" : "#7c3aed"} />
                    <input
                      type="text"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      placeholder="e.g. Aniket Lad, Chief, Boss"
                      className="w-full bg-transparent text-xs sm:text-sm font-semibold outline-none"
                    />
                  </div>
                </div>

                {/* 2. Domain / Profession Focus Chips */}
                <div className="space-y-2.5 pt-2 border-t border-purple-500/15">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider opacity-75">
                      Workflow & Persona Focus
                    </label>
                    <p className="text-[11px] opacity-60">
                      Tailors default multi-agent reasoning metaphors, technical depth, and tone
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {/* Developer */}
                    <button
                      type="button"
                      onClick={() => setUserDomain("developer")}
                      onMouseEnter={() => devIconRef.current?.startAnimation()}
                      onMouseLeave={() => devIconRef.current?.stopAnimation()}
                      style={
                        userDomain === "developer"
                          ? {
                              borderColor: accentColor,
                              boxShadow: `0 0 16px ${accentColor}35`,
                              backgroundColor: isDark ? `${accentColor}18` : `${accentColor}10`,
                            }
                          : undefined
                      }
                      className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer group flex items-start gap-3 ${
                        userDomain === "developer"
                          ? "scale-[1.01]"
                          : isDark
                          ? "bg-purple-950/20 border-purple-500/20 hover:border-purple-500/40"
                          : "bg-purple-50/50 border-purple-100"
                      }`}
                    >
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-transform group-hover:scale-110"
                        style={{ backgroundColor: `${accentColor}22` }}
                      >
                        <CodeXmlIcon
                          ref={devIconRef}
                          size={18}
                          duration={0.8}
                          color={userDomain === "developer" ? accentColor : isDark ? "#a855f7" : "#7c3aed"}
                        />
                      </div>
                      <div>
                        <div className="text-xs font-bold" style={userDomain === "developer" ? { color: accentColor } : undefined}>Developer</div>
                        <div className="text-[10px] opacity-60 mt-0.5 leading-snug">
                          Syntax, clean architecture & strict typing.
                        </div>
                      </div>
                    </button>

                    {/* Researcher */}
                    <button
                      type="button"
                      onClick={() => setUserDomain("researcher")}
                      onMouseEnter={() => searchIconRef.current?.startAnimation()}
                      onMouseLeave={() => searchIconRef.current?.stopAnimation()}
                      style={
                        userDomain === "researcher"
                          ? {
                              borderColor: accentColor,
                              boxShadow: `0 0 16px ${accentColor}35`,
                              backgroundColor: isDark ? `${accentColor}18` : `${accentColor}10`,
                            }
                          : undefined
                      }
                      className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer group flex items-start gap-3 ${
                        userDomain === "researcher"
                          ? "scale-[1.01]"
                          : isDark
                          ? "bg-purple-950/20 border-purple-500/20 hover:border-purple-500/40"
                          : "bg-purple-50/50 border-purple-100"
                      }`}
                    >
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-transform group-hover:scale-110"
                        style={{ backgroundColor: `${accentColor}22` }}
                      >
                        <SearchIcon
                          ref={searchIconRef}
                          size={18}
                          duration={0.8}
                          color={userDomain === "researcher" ? accentColor : isDark ? "#a855f7" : "#7c3aed"}
                        />
                      </div>
                      <div>
                        <div className="text-xs font-bold" style={userDomain === "researcher" ? { color: accentColor } : undefined}>Researcher</div>
                        <div className="text-[10px] opacity-60 mt-0.5 leading-snug">
                          Deep analysis, citations & structured evidence.
                        </div>
                      </div>
                    </button>

                    {/* Student */}
                    <button
                      type="button"
                      onClick={() => setUserDomain("student")}
                      onMouseEnter={() => studentIconRef.current?.startAnimation()}
                      onMouseLeave={() => studentIconRef.current?.stopAnimation()}
                      style={
                        userDomain === "student"
                          ? {
                              borderColor: accentColor,
                              boxShadow: `0 0 16px ${accentColor}35`,
                              backgroundColor: isDark ? `${accentColor}18` : `${accentColor}10`,
                            }
                          : undefined
                      }
                      className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer group flex items-start gap-3 ${
                        userDomain === "student"
                          ? "scale-[1.01]"
                          : isDark
                          ? "bg-purple-950/20 border-purple-500/20 hover:border-purple-500/40"
                          : "bg-purple-50/50 border-purple-100"
                      }`}
                    >
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-transform group-hover:scale-110"
                        style={{ backgroundColor: `${accentColor}22` }}
                      >
                        <GraduationCapIcon
                          ref={studentIconRef}
                          size={18}
                          duration={0.8}
                          color={userDomain === "student" ? accentColor : isDark ? "#a855f7" : "#7c3aed"}
                        />
                      </div>
                      <div>
                        <div className="text-xs font-bold" style={userDomain === "student" ? { color: accentColor } : undefined}>Student</div>
                        <div className="text-[10px] opacity-60 mt-0.5 leading-snug">
                          Analogies, step-by-step logic & study notes.
                        </div>
                      </div>
                    </button>

                    {/* Creator / Founder */}
                    <button
                      type="button"
                      onClick={() => setUserDomain("founder")}
                      onMouseEnter={() => founderIconRef.current?.startAnimation()}
                      onMouseLeave={() => founderIconRef.current?.stopAnimation()}
                      style={
                        userDomain === "founder"
                          ? {
                              borderColor: accentColor,
                              boxShadow: `0 0 16px ${accentColor}35`,
                              backgroundColor: isDark ? `${accentColor}18` : `${accentColor}10`,
                            }
                          : undefined
                      }
                      className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer group flex items-start gap-3 ${
                        userDomain === "founder"
                          ? "scale-[1.01]"
                          : isDark
                          ? "bg-purple-950/20 border-purple-500/20 hover:border-purple-500/40"
                          : "bg-purple-50/50 border-purple-100"
                      }`}
                    >
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-transform group-hover:scale-110"
                        style={{ backgroundColor: `${accentColor}22` }}
                      >
                        <BriefcaseIcon
                          ref={founderIconRef}
                          size={18}
                          duration={0.8}
                          color={userDomain === "founder" ? accentColor : isDark ? "#a855f7" : "#7c3aed"}
                        />
                      </div>
                      <div>
                        <div className="text-xs font-bold" style={userDomain === "founder" ? { color: accentColor } : undefined}>Creator / Founder</div>
                        <div className="text-[10px] opacity-60 mt-0.5 leading-snug">
                          Product UX, market strategy & execution.
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Modal Footer Actions (Reset, Cancel & Save Changes Button with CircleCheckIcon) */}
          <div
            className={`p-4 md:p-5 border-t shrink-0 flex items-center justify-between gap-3 ${
              isDark ? "border-purple-500/20 bg-purple-950/40" : "border-purple-100 bg-purple-50/60"
            }`}
          >
            {/* Left: Reset Defaults Button */}
            <button
              type="button"
              onClick={handleResetDefaults}
              onMouseEnter={() => resetIconRef.current?.startAnimation()}
              onMouseLeave={() => resetIconRef.current?.stopAnimation()}
              className={`px-3 py-2 rounded-xl text-xs font-medium flex items-center gap-2 transition-all cursor-pointer select-none ${
                isDark
                  ? "text-purple-300 hover:text-white hover:bg-purple-900/30"
                  : "text-purple-700 hover:text-purple-950 hover:bg-purple-100"
              }`}
            >
              <RotateCcwIcon
                ref={resetIconRef}
                size={14}
                duration={0.8}
                color={isDark ? "#c084fc" : "#7c3aed"}
              />
              <span>Reset Defaults</span>
            </button>

            {/* Right: Cancel & Save Changes */}
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer select-none ${
                  isDark
                    ? "text-purple-300 hover:text-white hover:bg-purple-900/30"
                    : "text-purple-700 hover:text-purple-950 hover:bg-purple-100"
                }`}
              >
                Cancel
              </button>

              {/* Save Button with CircleCheckIcon from Save_button_action/button.jsx */}
              <button
                type="button"
                onClick={handleSave}
                onMouseEnter={() => saveIconRef.current?.startAnimation()}
                onMouseLeave={() => saveIconRef.current?.stopAnimation()}
                style={{
                  background: `linear-gradient(135deg, ${accentColor}, ${accentColor}dd)`,
                  boxShadow: `0 8px 25px ${accentColor}45`,
                }}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white hover:opacity-90 active:scale-98 transition-all cursor-pointer flex items-center gap-2 select-none"
              >
                <CircleCheckIcon
                  ref={saveIconRef}
                  size={16}
                  duration={0.8}
                  color="#ffffff"
                />
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}

