"use client";

import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import {
  SlidersHorizontalIcon,
  ListIcon,
  type ListIconHandle,
  SquareUserIcon,
  type SquareUserIconHandle,
  BotIcon,
  type BotIconHandle,
  CodeXmlIcon,
  type CodeXmlIconHandle,
} from "@animateicons/react/lucide";
import {
  CheckmarkCircle01Icon,
  type CheckmarkCircle01IconHandle,
} from "@animateicons/react/huge";

export type ResponseTone = "concise" | "professional" | "friendly" | "developer";

export interface AiResponseSettings {
  temperature: number;
  tone: ResponseTone;
  customInstructions: string;
  showReasoning: boolean;
}

interface AiResponseSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDark: boolean;
  accentColor?: string;
  onSettingsSaved?: (settings: AiResponseSettings) => void;
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

const PRESET_CHIPS = [
  { label: "Avoid fluff & filler", text: "Avoid fluff, disclaimers, and unnecessary conversational filler. Get straight to the answer." },
  { label: "Senior TypeScript / React", text: "Act as a Senior Staff Engineer. Provide strict TypeScript, clean architecture, and modern React patterns." },
  { label: "Bullet points first", text: "Structure answers with concise bullet points, executive summaries, and clear headers." },
  { label: "Step-by-step reasoning", text: "Explain solutions step-by-step with pros, cons, and edge case considerations." },
  { label: "Production code with comments", text: "Always provide complete, copy-pasteable production-ready code with inline comments." },
];

export function AiResponseSettingsModal({
  isOpen,
  onClose,
  isDark,
  accentColor = "#a855f7",
  onSettingsSaved,
}: AiResponseSettingsModalProps) {
  const [mounted, setMounted] = useState(false);
  const [temperature, setTemperature] = useState<number>(0.7);
  const [tone, setTone] = useState<ResponseTone>("friendly");
  const [customInstructions, setCustomInstructions] = useState<string>("");
  const [showReasoning, setShowReasoning] = useState<boolean>(true);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const bannerIconRef = useRef<CheckmarkCircle01IconHandle>(null);
  const sliderIconRef = useRef<{ startAnimation: () => void; stopAnimation: () => void } | null>(null);
  const conciseIconRef = useRef<ListIconHandle>(null);
  const professionalIconRef = useRef<SquareUserIconHandle>(null);
  const friendlyIconRef = useRef<BotIconHandle>(null);
  const developerIconRef = useRef<CodeXmlIconHandle>(null);

  const [isSliding, setIsSliding] = useState(false);
  const slidingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleSliderChange = (newVal: number) => {
    setTemperature(newVal);
    setIsSliding(true);
    if (slidingTimeoutRef.current) {
      clearTimeout(slidingTimeoutRef.current);
    }
    slidingTimeoutRef.current = setTimeout(() => {
      setIsSliding(false);
    }, 700);
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  // Hydrate from localStorage on open
  useEffect(() => {
    if (isOpen) {
      const storedTemp = localStorage.getItem("astra_ai_temperature");
      const storedTone = localStorage.getItem("astra_ai_tone") as ResponseTone | null;
      const storedInstructions = localStorage.getItem("astra_ai_custom_instructions");
      const storedReasoning = localStorage.getItem("astra_ai_show_reasoning");

      setTemperature(storedTemp !== null ? parseFloat(storedTemp) : 0.7);
      setTone(storedTone || "friendly");
      setCustomInstructions(storedInstructions || "");
      setShowReasoning(storedReasoning !== null ? storedReasoning === "true" : true);
      setSavedSuccess(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (savedSuccess) {
      bannerIconRef.current?.startAnimation();
    }
  }, [savedSuccess]);

  // Escape key handler
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
    localStorage.setItem("astra_ai_temperature", temperature.toString());
    localStorage.setItem("astra_ai_tone", tone);
    localStorage.setItem("astra_ai_custom_instructions", customInstructions.trim());
    localStorage.setItem("astra_ai_show_reasoning", showReasoning ? "true" : "false");

    if (onSettingsSaved) {
      onSettingsSaved({
        temperature,
        tone,
        customInstructions: customInstructions.trim(),
        showReasoning,
      });
    }

    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1500);
  };

  const handleReset = () => {
    localStorage.removeItem("astra_ai_temperature");
    localStorage.removeItem("astra_ai_tone");
    localStorage.removeItem("astra_ai_custom_instructions");
    localStorage.removeItem("astra_ai_show_reasoning");

    setTemperature(0.7);
    setTone("friendly");
    setCustomInstructions("");
    setShowReasoning(true);

    if (onSettingsSaved) {
      onSettingsSaved({
        temperature: 0.7,
        tone: "friendly",
        customInstructions: "",
        showReasoning: true,
      });
    }
  };

  const handleAddChip = (text: string) => {
    setCustomInstructions((prev) => {
      const trimmed = prev.trim();
      if (!trimmed) return text;
      if (trimmed.includes(text)) return prev;
      return `${trimmed}\n${text}`;
    });
  };

  // Temperature track gradient percentage (0.0 to 1.0)
  const tempPercent = Math.min(100, Math.max(0, Math.round(temperature * 100)));

  const getTempLabel = (val: number) => {
    if (val <= 0.35) {
      return {
        label: "Precise",
        desc: "Deterministic & factual",
        color: "text-sky-400",
        hex: "#38bdf8",
        rgb: "56, 189, 248",
        badgeBorder: isDark ? "border-sky-500/40" : "border-sky-300",
        badgeBg: isDark ? "bg-sky-950/50" : "bg-sky-50",
        badgeText: isDark ? "text-sky-300" : "text-sky-900",
        badgeGlow: isSliding
          ? "0 0 16px rgba(56, 189, 248, 0.55)"
          : "0 0 8px rgba(56, 189, 248, 0.2)",
      };
    }
    if (val <= 0.75) {
      return {
        label: "Balanced",
        desc: "Natural & conversational",
        color: "text-purple-400",
        hex: accentColor,
        rgb: hexToRgb(accentColor),
        badgeBorder: isDark ? "border-purple-500/40" : "border-purple-300",
        badgeBg: isDark ? "bg-purple-950/50" : "bg-purple-50",
        badgeText: isDark ? "text-purple-300" : "text-purple-900",
        isAccent: true,
        badgeGlow: isSliding
          ? `0 0 16px ${accentColor}80`
          : `0 0 8px ${accentColor}35`,
      };
    }
    return {
      label: "Creative",
      desc: "Imaginative & exploratory",
      color: "text-amber-400",
      hex: "#f59e0b",
      rgb: "245, 158, 11",
      badgeBorder: isDark ? "border-amber-500/40" : "border-amber-300",
      badgeBg: isDark ? "bg-amber-950/50" : "bg-amber-50",
      badgeText: isDark ? "text-amber-300" : "text-amber-900",
      badgeGlow: isSliding
        ? "0 0 16px rgba(245, 158, 11, 0.55)"
        : "0 0 8px rgba(245, 158, 11, 0.2)",
    };
  };

  const getTrackGradient = () => {
    const percent = tempPercent;
    const bgUnfilled = isDark ? "#261647" : "#e9d5ff";

    if (temperature <= 0.35) {
      return `linear-gradient(to right, #0284c7 0%, #38bdf8 ${percent}%, ${bgUnfilled} ${percent}%, ${bgUnfilled} 100%)`;
    } else if (temperature <= 0.75) {
      return `linear-gradient(to right, #0284c7 0%, ${accentColor} ${percent}%, ${bgUnfilled} ${percent}%, ${bgUnfilled} 100%)`;
    } else {
      return `linear-gradient(to right, #0284c7 0%, ${accentColor} 50%, #f59e0b ${percent}%, ${bgUnfilled} ${percent}%, ${bgUnfilled} 100%)`;
    }
  };

  const tempInfo = getTempLabel(temperature);

  return createPortal(
    <>
      {/* Top Center Dropdown Banner (Independent of modal, exactly in screen center) */}
      {savedSuccess && (
        <div
          role="alert"
          onMouseEnter={() => bannerIconRef.current?.startAnimation()}
          onMouseLeave={() => bannerIconRef.current?.stopAnimation()}
          className="fixed top-6 z-[1000005] pointer-events-auto astra-banner-drop flex items-center gap-3 px-5 py-3 rounded-2xl border-l-4 shadow-2xl backdrop-blur-2xl border border-emerald-500/30"
          style={{
            position: "fixed",
            top: "24px",
            left: "0",
            right: "0",
            marginLeft: "auto",
            marginRight: "auto",
            width: "fit-content",
            maxWidth: "calc(100vw - 32px)",
            background: isDark ? "rgba(10, 24, 18, 0.95)" : "rgba(255, 255, 255, 0.98)",
            borderLeftColor: "#10b981",
            color: isDark ? "#a7f3d0" : "#065f46",
            boxShadow: isDark
              ? "0 20px 50px rgba(0, 0, 0, 0.85), 0 0 30px rgba(16, 185, 129, 0.35)"
              : "0 20px 50px rgba(16, 185, 129, 0.25)",
          }}
        >
          <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
            <CheckmarkCircle01Icon
              ref={bannerIconRef}
              size={18}
              className="text-emerald-400 shrink-0"
            />
          </div>
          <div className="text-xs sm:text-sm font-semibold tracking-wide select-none whitespace-nowrap">
            Success — Response settings saved & applied!
          </div>
        </div>
      )}

      {/* Main Modal Overlay */}
      <div className="fixed inset-0 z-[999999] flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-md animate-in fade-in-0 duration-200">
        {/* Click outside backdrop */}
        <div className="fixed inset-0" onClick={onClose} />

        {/* Main Modal Card */}
        <div
          style={{
            borderColor: isDark ? `${accentColor}40` : undefined,
            boxShadow: isDark ? `0 24px 70px rgba(0,0,0,0.9), 0 0 35px ${accentColor}25` : undefined,
          }}
          className={`relative w-full max-w-xl rounded-2xl overflow-hidden shadow-2xl border transition-all duration-200 animate-in zoom-in-95 fade-in-0 flex flex-col max-h-[92vh] ${
            isDark
              ? "bg-[#130b24]/95 text-white backdrop-blur-2xl"
              : "bg-white/95 border-purple-200 text-purple-950 shadow-[0_24px_70px_rgba(85,45,145,0.2)] backdrop-blur-2xl"
          }`}
        >
          {/* Ambient Top Glow & Beam line */}
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
        {/* Scoped CSS for Slider & Toggle Switch */}
        <style dangerouslySetInnerHTML={{
          __html: `
            .astra-range-slider {
              -webkit-appearance: none;
              width: 100%;
              height: 7px;
              border-radius: 9999px;
              outline: none;
              transition: background 0.15s ease-in-out;
            }
            .astra-range-slider::-webkit-slider-thumb {
              -webkit-appearance: none;
              appearance: none;
              width: 22px;
              height: 22px;
              border-radius: 50%;
              background: var(--thumb-color, #9333ea);
              border: 3px solid #ffffff;
              cursor: pointer;
              box-shadow: var(--thumb-glow, 0 0 12px rgba(168, 85, 247, 0.6));
              transition: transform 0.15s ease, background 0.2s ease, box-shadow 0.2s ease;
            }
            .astra-range-slider::-webkit-slider-thumb:hover {
              transform: scale(1.15);
            }
            .astra-range-slider.sliding::-webkit-slider-thumb,
            .astra-range-slider:active::-webkit-slider-thumb {
              transform: scale(1.25);
              box-shadow: var(--thumb-glow-sliding, 0 0 24px rgba(168, 85, 247, 0.95));
            }
            .astra-range-slider::-moz-range-thumb {
              width: 20px;
              height: 20px;
              border-radius: 50%;
              background: var(--thumb-color, #9333ea);
              border: 3px solid #ffffff;
              cursor: pointer;
              box-shadow: var(--thumb-glow, 0 0 12px rgba(168, 85, 247, 0.6));
              transition: transform 0.15s ease, background 0.2s ease, box-shadow 0.2s ease;
            }
            .astra-range-slider::-moz-range-thumb:hover {
              transform: scale(1.15);
            }
            .astra-range-slider.sliding::-moz-range-thumb,
            .astra-range-slider:active::-moz-range-thumb {
              transform: scale(1.25);
              box-shadow: var(--thumb-glow-sliding, 0 0 24px rgba(168, 85, 247, 0.95));
            }

            /* Custom Toggle Switch from Uiverse.io reference */
            .astra-switch {
              position: relative;
              display: inline-block;
              width: 48px;
              height: 26px;
              flex-shrink: 0;
            }
            .astra-switch input {
              opacity: 0;
              width: 0;
              height: 0;
            }
            .astra-switch-slider {
              position: absolute;
              cursor: pointer;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              background-color: ${isDark ? "#2a1b4e" : "#d8b4fe"};
              border: 1px solid ${isDark ? `rgba(${hexToRgb(accentColor)}, 0.3)` : `rgba(${hexToRgb(accentColor)}, 0.4)`};
              transition: 0.3s cubic-bezier(0.4, 0, 0.2, 1);
              border-radius: 30px;
            }
            .astra-switch-slider:before {
              position: absolute;
              content: "";
              height: 18px;
              width: 18px;
              border-radius: 50%;
              left: 3px;
              bottom: 3px;
              background-color: #ffffff;
              transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
              box-shadow: 0 1px 4px rgba(0,0,0,0.3);
            }
            .astra-switch-icon {
              opacity: 0;
              height: 10px;
              width: 10px;
              position: absolute;
              z-index: 10;
              stroke: ${accentColor};
              stroke-width: 4;
              left: 7px;
              top: 7px;
              transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s ease;
              pointer-events: none;
            }
            .astra-switch input:checked + .astra-switch-slider {
              background: linear-gradient(135deg, ${accentColor}, ${accentColor}cc);
              border-color: ${accentColor};
              box-shadow: 0 0 12px rgba(${hexToRgb(accentColor)}, 0.45);
            }
            .astra-switch input:checked + .astra-switch-slider .astra-switch-icon {
              opacity: 1;
              transform: translateX(22px);
            }
            .astra-switch input:checked + .astra-switch-slider:before {
              transform: translateX(22px);
            }

            /* Top-center slide-down animation */
            @keyframes bannerDrop {
              0% {
                opacity: 0;
                transform: translateY(-60px) scale(0.95);
              }
              65% {
                transform: translateY(6px) scale(1.02);
              }
              100% {
                opacity: 1;
                transform: translateY(0) scale(1);
              }
            }
            .astra-banner-drop {
              animation: bannerDrop 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
            }
          `
        }} />

        {/* 1. Header */}
        <div
          className={`flex items-center justify-between p-4 md:p-5 border-b shrink-0 ${
            isDark ? "border-purple-500/20 bg-purple-950/30" : "border-purple-100 bg-purple-50/50"
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              onMouseEnter={() => sliderIconRef.current?.startAnimation()}
              onMouseLeave={() => sliderIconRef.current?.stopAnimation()}
              className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border cursor-pointer transition-all duration-300"
              style={{
                backgroundColor: `${accentColor}18`,
                borderColor: `${accentColor}35`,
                boxShadow: `0 0 12px ${accentColor}25`,
              }}
            >
              <SlidersHorizontalIcon
                ref={sliderIconRef}
                size={20}
                duration={1}
                color={accentColor}
              />
            </div>
            <div>
              <h3 className="text-base font-semibold leading-tight">AI Response Settings</h3>
              <p className="text-xs opacity-70 mt-0.5">Configure tone, model creativity & system instructions</p>
            </div>
          </div>

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
              isDark ? "hover:bg-white/10 text-purple-300" : "hover:bg-purple-100 text-purple-700"
            }`}
            title="Close"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 2. Scrollable Body Content */}
        <div className="p-4 md:p-6 space-y-6 overflow-y-auto flex-1">

          {/* SECTION 1: Model Creativity / Temperature (Range Slider) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider opacity-75">
                  Creativity / Temperature
                </label>
                <p className="text-[11px] opacity-60">Controls randomness and variability in answers</p>
              </div>

              {/* Numerical Badge & Descriptor */}
              <div
                className={`flex items-center gap-2 px-2.5 py-1 rounded-xl border text-xs font-mono font-semibold transition-all duration-300 ${
                  tempInfo.badgeBg
                } ${tempInfo.badgeBorder} ${tempInfo.badgeText}`}
                style={{
                  boxShadow: tempInfo.badgeGlow,
                  ...(temperature > 0.35 && temperature <= 0.75
                    ? {
                        borderColor: `${accentColor}55`,
                        backgroundColor: `${accentColor}18`,
                        color: isDark ? "#ffffff" : "#0f172a",
                      }
                    : {}),
                }}
              >
                <span
                  style={
                    temperature > 0.35 && temperature <= 0.75
                      ? { color: accentColor }
                      : undefined
                  }
                  className={tempInfo.color}
                >
                  {tempInfo.label}
                </span>
                <span className="opacity-40">|</span>
                <span className="font-bold">{temperature.toFixed(2)}</span>
              </div>
            </div>

            {/* Slider with dynamic track gradient (from Range_slider) */}
            <div className="pt-2 pb-1 relative">
              <input
                type="range"
                min="0.0"
                max="1.0"
                step="0.05"
                value={temperature}
                onChange={(e) => handleSliderChange(parseFloat(e.target.value))}
                onPointerDown={() => setIsSliding(true)}
                onPointerUp={() => {
                  if (slidingTimeoutRef.current) clearTimeout(slidingTimeoutRef.current);
                  slidingTimeoutRef.current = setTimeout(() => setIsSliding(false), 500);
                }}
                className={`astra-range-slider ${isSliding ? "sliding" : ""}`}
                style={{
                  background: getTrackGradient(),
                  "--thumb-color": tempInfo.hex,
                  "--thumb-glow": `0 0 14px rgba(${tempInfo.rgb}, 0.65)`,
                  "--thumb-glow-sliding": `0 0 26px rgba(${tempInfo.rgb}, 0.95), 0 0 10px #ffffff`,
                } as React.CSSProperties}
              />
            </div>

            {/* 3 Quick Presets (Precise, Balanced, Creative) */}
            <div className="grid grid-cols-3 gap-2 pt-1">
              {[
                {
                  label: "Precise",
                  val: 0.2,
                  desc: "0.2 • Code & Math",
                  color: "#38bdf8",
                  rgb: "56, 189, 248",
                  isActive: temperature <= 0.35,
                  isAccent: false,
                  activeDark: "bg-gradient-to-br from-sky-500/25 via-sky-600/10 to-transparent border-sky-400 text-sky-100 ring-1 ring-sky-400/80",
                  activeLight: "bg-sky-50 border-sky-400 text-sky-950 ring-1 ring-sky-300",
                  inactiveDark: "bg-sky-950/15 border-sky-500/20 hover:bg-sky-900/25 text-sky-300/70 hover:text-sky-200 hover:border-sky-400/40",
                  inactiveLight: "bg-sky-50/40 border-sky-200 hover:bg-sky-100/60 text-sky-800/70 hover:text-sky-950",
                },
                {
                  label: "Balanced",
                  val: 0.7,
                  desc: "0.7 • General Tasks",
                  color: accentColor,
                  rgb: hexToRgb(accentColor),
                  isActive: temperature > 0.35 && temperature <= 0.75,
                  isAccent: true,
                  activeDark: "",
                  activeLight: "",
                  inactiveDark: "",
                  inactiveLight: "",
                },
                {
                  label: "Creative",
                  val: 1.0,
                  desc: "1.0 • Brainstorming",
                  color: "#f59e0b",
                  rgb: "245, 158, 11",
                  isActive: temperature > 0.75,
                  isAccent: false,
                  activeDark: "bg-gradient-to-br from-amber-500/25 via-amber-600/10 to-transparent border-amber-400 text-amber-100 ring-1 ring-amber-400/80",
                  activeLight: "bg-amber-50 border-amber-400 text-amber-950 ring-1 ring-amber-300",
                  inactiveDark: "bg-amber-950/15 border-amber-500/20 hover:bg-amber-900/25 text-amber-300/70 hover:text-amber-200 hover:border-amber-400/40",
                  inactiveLight: "bg-amber-50/40 border-amber-200 hover:bg-amber-100/60 text-amber-800/70 hover:text-amber-950",
                },
              ].map((p) => {
                const glowStyle = p.isActive
                  ? isSliding
                    ? `0 0 24px rgba(${p.rgb}, 0.65), 0 0 8px rgba(${p.rgb}, 0.4), inset 0 0 14px rgba(${p.rgb}, 0.25)`
                    : `0 0 14px rgba(${p.rgb}, 0.35)`
                  : undefined;

                return (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => handleSliderChange(p.val)}
                    className={`relative px-2.5 py-1.5 rounded-xl border text-left cursor-pointer select-none overflow-hidden transition-all duration-200 ${
                      p.isAccent
                        ? ""
                        : p.isActive
                        ? isDark
                          ? p.activeDark
                          : p.activeLight
                        : isDark
                        ? p.inactiveDark
                        : p.inactiveLight
                    } ${p.isActive && isSliding ? "scale-[1.03]" : ""}`}
                    style={{
                      boxShadow: glowStyle,
                      ...(p.isAccent
                        ? p.isActive
                          ? {
                              backgroundColor: `${accentColor}25`,
                              borderColor: `${accentColor}80`,
                              color: isDark ? "#ffffff" : "#0f172a",
                            }
                          : {
                              backgroundColor: isDark ? `${accentColor}0a` : `${accentColor}08`,
                              borderColor: `${accentColor}25`,
                              color: isDark ? "#d8b4fe" : "#581c87",
                            }
                        : {}),
                      transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-semibold leading-tight flex items-center gap-1.5">
                        <span
                          className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                            p.isActive ? "scale-125" : "opacity-40"
                          }`}
                          style={{
                            backgroundColor: p.color,
                            boxShadow: p.isActive
                              ? `0 0 ${isSliding ? "10px" : "6px"} ${p.color}`
                              : "none",
                          }}
                        />
                        <span>{p.label}</span>
                      </div>
                    </div>
                    <div
                      className={`text-[10px] leading-tight mt-1 transition-opacity ${
                        p.isActive ? "opacity-90 font-medium" : "opacity-55"
                      }`}
                    >
                      {p.desc}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className={`h-px ${isDark ? "bg-purple-500/20" : "bg-purple-100"}`} />

          {/* SECTION 2: Response Tone & Personality (Segmented Control) */}
          <div className="space-y-2.5">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider opacity-75">
                Response Tone & Personality
              </label>
              <p className="text-[11px] opacity-60">Adjust how Astra speaks and formats responses</p>
            </div>

            {/* Segmented Control Container */}
            <div
              className={`grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1.5 rounded-2xl border ${
                isDark ? "bg-purple-950/40 border-purple-500/25" : "bg-purple-50/70 border-purple-200"
              }`}
            >
              {[
                {
                  id: "concise" as ResponseTone,
                  name: "Concise",
                  desc: "Direct bullet points",
                  icon: (
                    <ListIcon
                      ref={conciseIconRef}
                      size={15}
                      duration={1}
                      color="#f59e0b"
                    />
                  ),
                  onHover: () => conciseIconRef.current?.startAnimation(),
                  onLeave: () => conciseIconRef.current?.stopAnimation(),
                  theme: {
                    btnActive: isDark
                      ? "bg-gradient-to-br from-amber-500/20 via-amber-600/10 to-transparent border-amber-400/80 text-white shadow-[0_0_20px_rgba(245,158,11,0.22)] ring-1 ring-amber-400/60"
                      : "bg-amber-50 border-amber-400 text-amber-950 shadow-sm ring-1 ring-amber-300",
                    btnInactive: isDark
                      ? "border-transparent text-purple-200/70 hover:bg-white/5 hover:border-amber-500/30 hover:text-white"
                      : "border-transparent text-purple-800/70 hover:bg-amber-50/60 hover:text-amber-950",
                    iconBoxActive: isDark
                      ? "bg-amber-500/25 border-amber-400 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.4)]"
                      : "bg-amber-100 border-amber-400 text-amber-800",
                    iconBoxInactive: isDark
                      ? "bg-amber-500/10 border-amber-500/30 text-amber-400 group-hover:bg-amber-500/20 group-hover:border-amber-400/50"
                      : "bg-amber-50 border-amber-300 text-amber-700",
                    descActive: isDark ? "text-amber-200/85 font-medium" : "text-amber-800/85 font-medium",
                  },
                },
                {
                  id: "professional" as ResponseTone,
                  name: "Professional",
                  desc: "Polished corporate",
                  icon: (
                    <SquareUserIcon
                      ref={professionalIconRef}
                      size={15}
                      duration={1}
                      color="#38bdf8"
                    />
                  ),
                  onHover: () => professionalIconRef.current?.startAnimation(),
                  onLeave: () => professionalIconRef.current?.stopAnimation(),
                  theme: {
                    btnActive: isDark
                      ? "bg-gradient-to-br from-sky-500/20 via-sky-600/10 to-transparent border-sky-400/80 text-white shadow-[0_0_20px_rgba(56,189,248,0.22)] ring-1 ring-sky-400/60"
                      : "bg-sky-50 border-sky-400 text-sky-950 shadow-sm ring-1 ring-sky-300",
                    btnInactive: isDark
                      ? "border-transparent text-purple-200/70 hover:bg-white/5 hover:border-sky-500/30 hover:text-white"
                      : "border-transparent text-purple-800/70 hover:bg-sky-50/60 hover:text-sky-950",
                    iconBoxActive: isDark
                      ? "bg-sky-500/25 border-sky-400 text-sky-300 shadow-[0_0_10px_rgba(56,189,248,0.4)]"
                      : "bg-sky-100 border-sky-400 text-sky-800",
                    iconBoxInactive: isDark
                      ? "bg-sky-500/10 border-sky-500/30 text-sky-400 group-hover:bg-sky-500/20 group-hover:border-sky-400/50"
                      : "bg-sky-50 border-sky-300 text-sky-700",
                    descActive: isDark ? "text-sky-200/85 font-medium" : "text-sky-800/85 font-medium",
                  },
                },
                {
                  id: "friendly" as ResponseTone,
                  name: "Friendly",
                  desc: "Warm & supportive",
                  icon: (
                    <BotIcon
                      ref={friendlyIconRef}
                      size={15}
                      duration={1}
                      color="#ad4189"
                    />
                  ),
                  onHover: () => friendlyIconRef.current?.startAnimation(),
                  onLeave: () => friendlyIconRef.current?.stopAnimation(),
                  theme: {
                    btnActive: isDark
                      ? "bg-gradient-to-br from-[#ad4189]/25 via-pink-600/15 to-transparent border-[#ad4189]/80 text-white shadow-[0_0_20px_rgba(173,65,137,0.25)] ring-1 ring-[#ad4189]/60"
                      : "bg-pink-50 border-[#ad4189] text-pink-950 shadow-sm ring-1 ring-pink-300",
                    btnInactive: isDark
                      ? "border-transparent text-purple-200/70 hover:bg-white/5 hover:border-[#ad4189]/40 hover:text-white"
                      : "border-transparent text-purple-800/70 hover:bg-pink-50/60 hover:text-pink-950",
                    iconBoxActive: isDark
                      ? "bg-[#ad4189]/25 border-[#ad4189] text-pink-300 shadow-[0_0_10px_rgba(173,65,137,0.4)]"
                      : "bg-pink-100 border-[#ad4189] text-[#ad4189]",
                    iconBoxInactive: isDark
                      ? "bg-[#ad4189]/15 border-[#ad4189]/30 text-pink-400 group-hover:bg-[#ad4189]/25 group-hover:border-[#ad4189]/50"
                      : "bg-pink-50 border-pink-300 text-[#ad4189]",
                    descActive: isDark ? "text-pink-200/85 font-medium" : "text-pink-800/85 font-medium",
                  },
                },
                {
                  id: "developer" as ResponseTone,
                  name: "Senior Dev",
                  desc: "Code-first architect",
                  icon: (
                    <CodeXmlIcon
                      ref={developerIconRef}
                      size={15}
                      duration={1}
                      color="#00d3f2"
                    />
                  ),
                  onHover: () => developerIconRef.current?.startAnimation(),
                  onLeave: () => developerIconRef.current?.stopAnimation(),
                  theme: {
                    btnActive: isDark
                      ? "bg-gradient-to-br from-[#00d3f2]/20 via-teal-600/10 to-transparent border-[#00d3f2]/80 text-white shadow-[0_0_20px_rgba(0,211,242,0.25)] ring-1 ring-[#00d3f2]/60"
                      : "bg-cyan-50 border-cyan-400 text-cyan-950 shadow-sm ring-1 ring-cyan-300",
                    btnInactive: isDark
                      ? "border-transparent text-purple-200/70 hover:bg-white/5 hover:border-[#00d3f2]/30 hover:text-white"
                      : "border-transparent text-purple-800/70 hover:bg-cyan-50/60 hover:text-cyan-950",
                    iconBoxActive: isDark
                      ? "bg-[#00d3f2]/25 border-[#00d3f2] text-cyan-300 shadow-[0_0_10px_rgba(0,211,242,0.4)]"
                      : "bg-cyan-100 border-cyan-400 text-cyan-800",
                    iconBoxInactive: isDark
                      ? "bg-[#00d3f2]/10 border-[#00d3f2]/30 text-cyan-400 group-hover:bg-[#00d3f2]/20 group-hover:border-[#00d3f2]/50"
                      : "bg-cyan-50 border-cyan-300 text-cyan-700",
                    descActive: isDark ? "text-cyan-200/85 font-medium" : "text-cyan-800/85 font-medium",
                  },
                },
              ].map((item) => {
                const isSelected = tone === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setTone(item.id);
                      item.onHover?.();
                    }}
                    onMouseEnter={() => item.onHover?.()}
                    onMouseLeave={() => item.onLeave?.()}
                    className={`group flex flex-col items-center justify-center p-2 rounded-xl text-center transition-all duration-200 cursor-pointer select-none border ${
                      isSelected ? item.theme.btnActive : item.theme.btnInactive
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <div
                        className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 border transition-all duration-200 group-hover:scale-105 ${
                          isSelected ? item.theme.iconBoxActive : item.theme.iconBoxInactive
                        }`}
                      >
                        {item.icon}
                      </div>
                      <span className="text-xs font-semibold leading-tight">{item.name}</span>
                    </div>
                    <span
                      className={`text-[10px] leading-tight transition-colors ${
                        isSelected ? item.theme.descActive : "opacity-60"
                      }`}
                    >
                      {item.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className={`h-px ${isDark ? "bg-purple-500/20" : "bg-purple-100"}`} />

          {/* SECTION 3: Custom System Instructions (Multiline Textarea + Badges/Chips) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider opacity-75">
                  Custom System Instructions
                </label>
                <p className="text-[11px] opacity-60">Persistent rules Astra will follow in every conversation</p>
              </div>

              {/* Character Counter */}
              <span
                style={
                  customInstructions.length <= 450
                    ? {
                        borderColor: `${accentColor}40`,
                        color: accentColor,
                        backgroundColor: `${accentColor}12`,
                      }
                    : undefined
                }
                className={`text-[10px] font-mono px-2 py-0.5 rounded-md border ${
                  customInstructions.length > 450
                    ? "bg-amber-500/20 border-amber-500/40 text-amber-300"
                    : ""
                }`}
              >
                {customInstructions.length} / 500
              </span>
            </div>

            {/* Textarea Container */}
            <div
              className={`relative rounded-xl border p-2 transition-all ${
                isDark
                  ? "bg-purple-950/30 border-purple-500/30 focus-within:border-purple-400 focus-within:ring-2 focus-within:ring-purple-500/20"
                  : "bg-purple-50/40 border-purple-200 focus-within:border-purple-400 focus-within:ring-2 focus-within:ring-purple-200"
              }`}
            >
              <textarea
                value={customInstructions}
                onChange={(e) => setCustomInstructions(e.target.value.slice(0, 500))}
                rows={3}
                placeholder="e.g. Always write clean TypeScript with interfaces, skip conversational fluff, prefer bullet points, and explain edge cases..."
                className="w-full bg-transparent text-xs leading-relaxed outline-none border-none resize-none placeholder:opacity-40"
              />

              {customInstructions && (
                <button
                  type="button"
                  onClick={() => setCustomInstructions("")}
                  className="absolute top-2 right-2 p-1 rounded opacity-50 hover:opacity-100 transition cursor-pointer"
                  title="Clear instructions"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {/* Quick-Add Chips (from Badges/Chips.jsx) */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[10px] uppercase font-semibold opacity-60 tracking-wider">
                Quick-add presets:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_CHIPS.map((chip) => (
                  <button
                    key={chip.label}
                    type="button"
                    onClick={() => handleAddChip(chip.text)}
                    style={{
                      borderColor: `${accentColor}30`,
                    }}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-all cursor-pointer ${
                      isDark
                        ? "bg-purple-950/40 text-purple-200 hover:bg-purple-900/60"
                        : "bg-purple-50 text-purple-900 hover:bg-purple-100"
                    }`}
                  >
                    <span style={{ color: accentColor }} className="font-bold">+</span>
                    <span>{chip.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className={`h-px ${isDark ? "bg-purple-500/20" : "bg-purple-100"}`} />

          {/* SECTION 4: Advanced Agent Controls (Toggle Switch) */}
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <label className="text-xs font-semibold leading-tight flex items-center gap-1.5">
                <span>Show Agent Reasoning & Chain-of-Thought</span>
                <span
                  style={{
                    borderColor: `${accentColor}40`,
                    color: accentColor,
                    backgroundColor: `${accentColor}15`,
                  }}
                  className="text-[9px] font-mono px-1.5 py-0.2 rounded border"
                >
                  Agentic
                </span>
              </label>
              <p className="text-[11px] opacity-60 leading-tight">
                Display routing decisions, tool execution thoughts, and multi-step agent actions
              </p>
            </div>

            {/* Toggle Switch Component (from Toggle Switch/toggle.html & switch.css) */}
            <label className="astra-switch">
              <input
                type="checkbox"
                checked={showReasoning}
                onChange={(e) => setShowReasoning(e.target.checked)}
              />
              <span className="astra-switch-slider">
                <svg
                  className="astra-switch-icon"
                  viewBox="0 0 32 32"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                  role="presentation"
                >
                  <path fill="none" d="m4 16.5 8 8 16-16" />
                </svg>
              </span>
            </label>
          </div>
        </div>

        {/* 3. Footer Action Controls (Action Buttons / Cancel) */}
        <div
          className={`px-5 py-3.5 border-t flex items-center justify-between text-xs shrink-0 ${
            isDark ? "border-purple-500/20 bg-purple-950/20" : "border-purple-100 bg-purple-50/40"
          }`}
        >
          {/* Reset to default (inspired by Action Buttons/cancel.jsx destructive styling) */}
          <button
            type="button"
            onClick={handleReset}
            className={`px-3 py-1.5 rounded-xl font-medium transition cursor-pointer text-xs ${
              isDark
                ? "hover:bg-red-500/20 text-red-300 border border-transparent hover:border-red-500/30"
                : "hover:bg-red-100 text-red-600 border border-transparent"
            }`}
            title="Restore default response parameters"
          >
            Reset to Default
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className={`px-3.5 py-1.5 rounded-xl font-medium transition cursor-pointer ${
                isDark
                  ? "bg-white/5 hover:bg-white/10 text-purple-200 border border-purple-500/20"
                  : "bg-white hover:bg-purple-50 text-purple-900 border border-purple-200"
              }`}
            >
              Cancel
            </button>

            {/* Save & Apply Button */}
            <button
              type="button"
              onClick={handleSave}
              disabled={savedSuccess}
              className={`px-5 py-2 rounded-xl font-bold text-white transition-all cursor-pointer flex items-center gap-1.5 ${
                savedSuccess ? "opacity-75 cursor-default" : "hover:scale-[1.02] active:scale-98"
              }`}
              style={{
                background: `linear-gradient(135deg, ${accentColor}, ${accentColor}dd)`,
                boxShadow: `0 6px 20px ${accentColor}45`,
              }}
            >
              <span>Save & Apply</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </>,
  document.body
);
}
