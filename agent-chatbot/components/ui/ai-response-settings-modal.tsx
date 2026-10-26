"use client";

import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { SlidersHorizontalIcon } from "@animateicons/react/lucide";
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
  onSettingsSaved?: (settings: AiResponseSettings) => void;
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
    if (val <= 0.35) return { label: "Precise", desc: "Deterministic & factual", color: "text-blue-400" };
    if (val <= 0.75) return { label: "Balanced", desc: "Natural & conversational", color: "text-purple-400" };
    return { label: "Creative", desc: "Imaginative & exploratory", color: "text-amber-400" };
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
          className={`relative w-full max-w-xl rounded-2xl overflow-hidden shadow-2xl border transition-all duration-200 animate-in zoom-in-95 fade-in-0 flex flex-col max-h-[92vh] ${
            isDark
              ? "bg-[#130b24]/95 border-purple-500/35 text-white shadow-[0_24px_70px_rgba(0,0,0,0.9),0_0_35px_rgba(168,85,247,0.25)] backdrop-blur-2xl"
              : "bg-white/95 border-purple-200 text-purple-950 shadow-[0_24px_70px_rgba(85,45,145,0.2)] backdrop-blur-2xl"
          }`}
        >
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
              background: #9333ea;
              border: 3px solid #ffffff;
              cursor: pointer;
              box-shadow: 0 0 12px rgba(168, 85, 247, 0.6);
              transition: transform 0.15s ease, background 0.15s ease;
            }
            .astra-range-slider::-webkit-slider-thumb:hover {
              transform: scale(1.15);
              background: #a855f7;
            }
            .astra-range-slider::-moz-range-thumb {
              width: 20px;
              height: 20px;
              border-radius: 50%;
              background: #9333ea;
              border: 3px solid #ffffff;
              cursor: pointer;
              box-shadow: 0 0 12px rgba(168, 85, 247, 0.6);
              transition: transform 0.15s ease;
            }
            .astra-range-slider::-moz-range-thumb:hover {
              transform: scale(1.15);
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
              border: 1px solid ${isDark ? "rgba(168, 85, 247, 0.3)" : "rgba(168, 85, 247, 0.4)"};
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
              stroke: #7c3aed;
              stroke-width: 4;
              left: 7px;
              top: 7px;
              transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s ease;
              pointer-events: none;
            }
            .astra-switch input:checked + .astra-switch-slider {
              background: linear-gradient(135deg, #9333ea, #6366f1);
              border-color: #a855f7;
              box-shadow: 0 0 12px rgba(168, 85, 247, 0.4);
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
              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm cursor-pointer ${
                isDark
                  ? "bg-purple-500/20 text-purple-300 border border-purple-500/30 shadow-[0_0_12px_rgba(168,85,247,0.2)]"
                  : "bg-purple-100 text-purple-700 border border-purple-200"
              }`}
            >
              <SlidersHorizontalIcon
                ref={sliderIconRef}
                size={20}
                duration={1}
                color={isDark ? "#c084fc" : "#7c3aed"}
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
                className={`flex items-center gap-2 px-2.5 py-1 rounded-xl border text-xs font-mono font-semibold ${
                  isDark
                    ? "bg-purple-950/50 border-purple-500/30"
                    : "bg-purple-50 border-purple-200"
                }`}
              >
                <span className={tempInfo.color}>{tempInfo.label}</span>
                <span className="opacity-40">|</span>
                <span className="text-white dark:text-white text-purple-950 font-bold">{temperature.toFixed(2)}</span>
              </div>
            </div>

            {/* Slider with dynamic track gradient (from Range_slider) */}
            <div className="pt-2 pb-1">
              <input
                type="range"
                min="0.0"
                max="1.0"
                step="0.05"
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                className="astra-range-slider"
                style={{
                  background: `linear-gradient(to right, #9333ea 0%, #c084fc ${tempPercent}%, ${
                    isDark ? "#261647" : "#e9d5ff"
                  } ${tempPercent}%, ${isDark ? "#261647" : "#e9d5ff"} 100%)`,
                }}
              />
            </div>

            {/* 3 Quick Presets (Precise, Balanced, Creative) */}
            <div className="grid grid-cols-3 gap-2 pt-1">
              {[
                { label: "Precise", val: 0.2, desc: "0.2 • Code & Math" },
                { label: "Balanced", val: 0.7, desc: "0.7 • General Tasks" },
                { label: "Creative", val: 1.0, desc: "1.0 • Brainstorming" },
              ].map((p) => {
                const isActive = Math.abs(temperature - p.val) < 0.04;
                return (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => setTemperature(p.val)}
                    className={`px-2.5 py-1.5 rounded-xl border text-left transition-all cursor-pointer ${
                      isActive
                        ? isDark
                          ? "bg-purple-600/30 border-purple-400 text-purple-200 shadow-[0_0_12px_rgba(168,85,247,0.3)] ring-1 ring-purple-400"
                          : "bg-purple-100 border-purple-400 text-purple-950 ring-1 ring-purple-300"
                        : isDark
                        ? "bg-purple-950/20 border-purple-500/20 hover:bg-purple-900/30 text-purple-300 opacity-70 hover:opacity-100"
                        : "bg-purple-50/50 border-purple-200 hover:bg-purple-100/60 text-purple-800 opacity-70 hover:opacity-100"
                    }`}
                  >
                    <div className="text-xs font-semibold leading-tight">{p.label}</div>
                    <div className="text-[10px] opacity-60 leading-tight mt-0.5">{p.desc}</div>
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
                    <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h10M4 18h7" />
                    </svg>
                  ),
                },
                {
                  id: "professional" as ResponseTone,
                  name: "Professional",
                  desc: "Polished corporate",
                  icon: (
                    <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  ),
                },
                {
                  id: "friendly" as ResponseTone,
                  name: "Friendly",
                  desc: "Warm & supportive",
                  icon: (
                    <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ),
                },
                {
                  id: "developer" as ResponseTone,
                  name: "Senior Dev",
                  desc: "Code-first architect",
                  icon: (
                    <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                  ),
                },
              ].map((item) => {
                const isSelected = tone === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setTone(item.id)}
                    className={`flex flex-col items-center justify-center p-2 rounded-xl text-center transition-all cursor-pointer select-none border ${
                      isSelected
                        ? isDark
                          ? "bg-gradient-to-br from-purple-600/40 to-indigo-600/40 border-purple-400 text-white shadow-md shadow-purple-950/40 ring-1 ring-purple-400/50"
                          : "bg-white border-purple-300 text-purple-950 shadow-sm ring-1 ring-purple-200"
                        : isDark
                        ? "border-transparent text-purple-300 hover:bg-white/5 opacity-70 hover:opacity-100"
                        : "border-transparent text-purple-800 hover:bg-purple-100/60 opacity-70 hover:opacity-100"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className={isSelected ? "text-purple-300 dark:text-purple-300" : "opacity-60"}>
                        {item.icon}
                      </span>
                      <span className="text-xs font-semibold">{item.name}</span>
                    </div>
                    <span className="text-[10px] opacity-60 leading-tight">{item.desc}</span>
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
                className={`text-[10px] font-mono px-2 py-0.5 rounded-md border ${
                  customInstructions.length > 450
                    ? "bg-amber-500/20 border-amber-500/40 text-amber-300"
                    : isDark
                    ? "bg-purple-950/40 border-purple-500/25 text-purple-300"
                    : "bg-purple-50 border-purple-200 text-purple-800"
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
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-all cursor-pointer ${
                      isDark
                        ? "bg-purple-950/40 border-purple-500/30 text-purple-200 hover:bg-purple-900/60 hover:border-purple-400"
                        : "bg-purple-50 border-purple-200 text-purple-900 hover:bg-purple-100"
                    }`}
                  >
                    <span className="text-purple-400 font-bold">+</span>
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
                  className={`text-[9px] font-mono px-1.5 py-0.2 rounded border ${
                    isDark
                      ? "bg-purple-500/20 text-purple-300 border-purple-500/30"
                      : "bg-purple-100 text-purple-800 border-purple-200"
                  }`}
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
              className={`px-4 py-1.5 rounded-xl font-medium text-white transition-all shadow-lg shadow-purple-900/40 cursor-pointer flex items-center gap-1.5 ${
                savedSuccess ? "opacity-75 cursor-default" : "hover:scale-[1.02]"
              }`}
              style={{
                background: "linear-gradient(315deg, #9f4ac9 0%, #7e4cc9 100%)",
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
