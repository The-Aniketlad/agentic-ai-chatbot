"use client";

import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { KeyRoundIcon } from "@animateicons/react/lucide";
import {
  CheckmarkCircle01Icon,
  type CheckmarkCircle01IconHandle,
} from "@animateicons/react/huge";

interface ApiKeysModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDark: boolean;
  onKeysSaved?: (keys: { groqKey: string; openRouterKey: string; customAgentKey?: string }) => void;
}

export function ApiKeysModal({
  isOpen,
  onClose,
  isDark,
  onKeysSaved,
}: ApiKeysModalProps) {
  const [mounted, setMounted] = useState(false);
  const [groqKey, setGroqKey] = useState("");
  const [openRouterKey, setOpenRouterKey] = useState("");
  const [customAgentKey, setCustomAgentKey] = useState("");
  const [showGroq, setShowGroq] = useState(false);
  const [showOpenRouter, setShowOpenRouter] = useState(false);
  const [showCustomAgent, setShowCustomAgent] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const bannerIconRef = useRef<CheckmarkCircle01IconHandle>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Hydrate keys from localStorage on mount or when opening
  useEffect(() => {
    if (isOpen) {
      const storedGroq = localStorage.getItem("astra_custom_groq_key") || "";
      const storedOpenRouter = localStorage.getItem("astra_custom_openrouter_key") || "";
      const storedAgent = localStorage.getItem("astra_custom_agent_key") || "";
      setGroqKey(storedGroq);
      setOpenRouterKey(storedOpenRouter);
      setCustomAgentKey(storedAgent);
      setSavedSuccess(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (savedSuccess) {
      bannerIconRef.current?.startAnimation();
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
    const cleanGroq = groqKey.trim();
    const cleanOpenRouter = openRouterKey.trim();
    const cleanAgent = customAgentKey.trim();

    if (cleanGroq) {
      localStorage.setItem("astra_custom_groq_key", cleanGroq);
    } else {
      localStorage.removeItem("astra_custom_groq_key");
    }

    if (cleanOpenRouter) {
      localStorage.setItem("astra_custom_openrouter_key", cleanOpenRouter);
    } else {
      localStorage.removeItem("astra_custom_openrouter_key");
    }

    if (cleanAgent) {
      localStorage.setItem("astra_custom_agent_key", cleanAgent);
    } else {
      localStorage.removeItem("astra_custom_agent_key");
    }

    if (onKeysSaved) {
      onKeysSaved({ groqKey: cleanGroq, openRouterKey: cleanOpenRouter, customAgentKey: cleanAgent });
    }

    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1500);
  };

  const handleReset = () => {
    localStorage.removeItem("astra_custom_groq_key");
    localStorage.removeItem("astra_custom_openrouter_key");
    localStorage.removeItem("astra_custom_agent_key");
    setGroqKey("");
    setOpenRouterKey("");
    setCustomAgentKey("");
    if (onKeysSaved) {
      onKeysSaved({ groqKey: "", openRouterKey: "", customAgentKey: "" });
    }
  };

  const handlePaste = async (field: "groq" | "openrouter" | "agent") => {
    try {
      const text = await navigator.clipboard.readText();
      if (field === "groq") setGroqKey(text);
      if (field === "openrouter") setOpenRouterKey(text);
      if (field === "agent") setCustomAgentKey(text);
    } catch {
      // Clipboard access denied or unsupported
    }
  };


  const isGroqValid = groqKey.trim().startsWith("gsk_") || groqKey.trim().length > 20;
  const isOpenRouterValid = openRouterKey.trim().startsWith("sk-or-") || openRouterKey.trim().length > 20;

  return createPortal(
    <>
      {/* Scoped CSS for top-center slide-down animation */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes apiBannerDrop {
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
          .astra-api-banner-drop {
            animation: apiBannerDrop 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
        `
      }} />

      {/* Top Center Dropdown Banner (Independent of modal, exactly in screen center) */}
      {savedSuccess && (
        <div
          role="alert"
          onMouseEnter={() => bannerIconRef.current?.startAnimation()}
          onMouseLeave={() => bannerIconRef.current?.stopAnimation()}
          className="fixed top-6 z-[1000005] pointer-events-auto astra-api-banner-drop flex items-center gap-3 px-5 py-3 rounded-2xl border-l-4 shadow-2xl backdrop-blur-2xl border border-emerald-500/30"
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
            Success — Your API keys have been saved & applied!
          </div>
        </div>
      )}

      {/* Main Modal Overlay */}
      <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-black/65 backdrop-blur-md animate-in fade-in-0 duration-200">
        {/* Click outside backdrop */}
        <div className="fixed inset-0" onClick={onClose} />

        {/* Main Modal Card */}
        <div
          className={`relative w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl border transition-all duration-200 animate-in zoom-in-95 fade-in-0 ${
            isDark
              ? "bg-[#130b24]/95 border-purple-500/35 text-white shadow-[0_24px_70px_rgba(0,0,0,0.9),0_0_35px_rgba(168,85,247,0.25)] backdrop-blur-2xl"
              : "bg-white/95 border-purple-200 text-purple-950 shadow-[0_24px_70px_rgba(85,45,145,0.2)] backdrop-blur-2xl"
          }`}
        >
        {/* 1. Header */}
        <div
          className={`flex items-center justify-between p-4 md:p-5 border-b ${
            isDark ? "border-purple-500/20 bg-purple-950/30" : "border-purple-100 bg-purple-50/50"
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
                isDark
                  ? "bg-purple-500/20 text-purple-300 border border-purple-500/30 shadow-[0_0_12px_rgba(168,85,247,0.2)]"
                  : "bg-purple-100 text-purple-700 border border-purple-200"
              }`}
            >
              <KeyRoundIcon size={20} duration={1} color={isDark ? "#c084fc" : "#7c3aed"} />
            </div>
            <div>
              <h3 className="text-base font-semibold leading-tight">Custom API Keys</h3>
              <p className="text-xs opacity-70 mt-0.5">Bring Your Own Key (BYOK) for unlimited requests</p>
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

        {/* 2. Body Content */}
        <div className="p-4 md:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Security & Privacy Banner */}
          <div
            className={`flex items-start gap-2.5 p-3 rounded-xl border text-xs leading-relaxed ${
              isDark
                ? "bg-purple-950/20 border-purple-500/25 text-purple-200/90"
                : "bg-purple-50/60 border-purple-200/80 text-purple-900"
            }`}
          >
            <div className="mt-0.5 shrink-0 text-emerald-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <div>
              <span className="font-semibold">Local Storage Only: </span>
              Your keys are saved securely in your browser and used only to authenticate API requests. They are never logged or stored on our servers.
            </div>
          </div>

          {/* Input Section 1: Groq API Key */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="shrink-0 flex items-center justify-center cursor-pointer transition-transform hover:scale-110" title="Groq API Key">
                  <KeyRoundIcon size={15} duration={1} color="#ff6900" />
                </span>
                <label className="text-xs font-semibold">Groq API Key</label>
                {/* Tooltip trigger */}
                <div
                  className="group relative cursor-pointer text-purple-400 opacity-60 hover:opacity-100"
                  title="Used for ultra-fast LPU inference (GPT-OSS 20B, Llama 3.3). Starts with 'gsk_'."
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" strokeWidth="2" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 16v-4m0-4h.01" />
                  </svg>
                </div>
              </div>

              {/* Status Badge */}
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                  groqKey.trim()
                    ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400 font-semibold"
                    : isDark
                    ? "bg-purple-950/40 border-purple-500/25 text-purple-300"
                    : "bg-purple-100 border-purple-200 text-purple-800"
                }`}
              >
                {groqKey.trim() ? "● Personal Key Active" : "○ Default Astra Key"}
              </span>
            </div>

            {/* Input Box with Trailing Addons */}
            <div
              className={`flex items-center rounded-xl border px-3 py-1.5 transition-all ${
                isDark
                  ? "bg-purple-950/30 border-purple-500/30 focus-within:border-purple-400 focus-within:ring-2 focus-within:ring-purple-500/20"
                  : "bg-purple-50/40 border-purple-200 focus-within:border-purple-400 focus-within:ring-2 focus-within:ring-purple-200"
              }`}
            >
              {/* Left Lock Icon */}
              <svg className="w-4 h-4 opacity-50 shrink-0 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.8"
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>

              {/* Input field */}
              <input
                type={showGroq ? "text" : "password"}
                value={groqKey}
                onChange={(e) => setGroqKey(e.target.value)}
                placeholder="gsk_••••••••••••••••••••••••••••••••"
                className="w-full bg-transparent text-xs font-mono outline-none border-none placeholder:opacity-40"
              />

              {/* Trailing Buttons */}
              <div className="flex items-center gap-1 shrink-0 ml-1">
                {/* Clear Button if has value */}
                {groqKey && (
                  <button
                    type="button"
                    onClick={() => setGroqKey("")}
                    className="p-1 rounded opacity-50 hover:opacity-100 transition"
                    title="Clear"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}

                {/* Paste Button if empty */}
                {!groqKey && (
                  <button
                    type="button"
                    onClick={() => handlePaste("groq")}
                    className={`text-[10px] px-2 py-0.5 rounded-md font-medium border transition ${
                      isDark ? "bg-purple-900/40 border-purple-500/30 hover:bg-purple-900/70" : "bg-purple-100 border-purple-200 hover:bg-purple-200"
                    }`}
                  >
                    Paste
                  </button>
                )}

                {/* Eye Toggle Show/Hide */}
                <button
                  type="button"
                  onClick={() => setShowGroq(!showGroq)}
                  className="p-1 rounded opacity-60 hover:opacity-100 transition"
                  title={showGroq ? "Hide Key" : "Show Key"}
                >
                  {showGroq ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Hint & Get Key Link */}
            <div className="flex items-center justify-between text-[11px] pt-0.5">
              <span className={`flex items-center gap-1 ${isGroqValid ? "text-emerald-400 font-medium" : "opacity-60"}`}>
                {isGroqValid && (
                  <svg className="w-3 h-3 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                )}
                {groqKey ? (isGroqValid ? "Valid format (starts with gsk_)" : "Should start with gsk_") : "Leave empty to use Astra's free tier"}
              </span>

              <a
                href="https://console.groq.com/keys"
                target="_blank"
                rel="noreferrer"
                className="text-purple-400 hover:text-purple-300 underline underline-offset-2 flex items-center gap-0.5"
              >
                <span>Get free key</span>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>

          {/* Input Section 2: OpenRouter API Key */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="shrink-0 flex items-center justify-center cursor-pointer transition-transform hover:scale-110" title="OpenRouter API Key">
                  <KeyRoundIcon size={15} duration={1} color="#615fff" />
                </span>
                <label className="text-xs font-semibold">OpenRouter API Key</label>
                {/* Tooltip trigger */}
                <div
                  className="group relative cursor-pointer text-purple-400 opacity-60 hover:opacity-100"
                  title="Used for multi-agent reasoning, Claude, DeepSeek, and fallback cascade. Starts with 'sk-or-v1-'."
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" strokeWidth="2" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 16v-4m0-4h.01" />
                  </svg>
                </div>
              </div>

              {/* Status Badge */}
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                  openRouterKey.trim()
                    ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400 font-semibold"
                    : isDark
                    ? "bg-purple-950/40 border-purple-500/25 text-purple-300"
                    : "bg-purple-100 border-purple-200 text-purple-800"
                }`}
              >
                {openRouterKey.trim() ? "● Personal Key Active" : "○ Default Astra Key"}
              </span>
            </div>

            {/* Input Box with Trailing Addons */}
            <div
              className={`flex items-center rounded-xl border px-3 py-1.5 transition-all ${
                isDark
                  ? "bg-purple-950/30 border-purple-500/30 focus-within:border-purple-400 focus-within:ring-2 focus-within:ring-purple-500/20"
                  : "bg-purple-50/40 border-purple-200 focus-within:border-purple-400 focus-within:ring-2 focus-within:ring-purple-200"
              }`}
            >
              {/* Left Lock Icon */}
              <svg className="w-4 h-4 opacity-50 shrink-0 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.8"
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>

              {/* Input field */}
              <input
                type={showOpenRouter ? "text" : "password"}
                value={openRouterKey}
                onChange={(e) => setOpenRouterKey(e.target.value)}
                placeholder="sk-or-v1-••••••••••••••••••••••••••••"
                className="w-full bg-transparent text-xs font-mono outline-none border-none placeholder:opacity-40"
              />

              {/* Trailing Buttons */}
              <div className="flex items-center gap-1 shrink-0 ml-1">
                {/* Clear Button if has value */}
                {openRouterKey && (
                  <button
                    type="button"
                    onClick={() => setOpenRouterKey("")}
                    className="p-1 rounded opacity-50 hover:opacity-100 transition"
                    title="Clear"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}

                {/* Paste Button if empty */}
                {!openRouterKey && (
                  <button
                    type="button"
                    onClick={() => handlePaste("openrouter")}
                    className={`text-[10px] px-2 py-0.5 rounded-md font-medium border transition ${
                      isDark ? "bg-purple-900/40 border-purple-500/30 hover:bg-purple-900/70" : "bg-purple-100 border-purple-200 hover:bg-purple-200"
                    }`}
                  >
                    Paste
                  </button>
                )}

                {/* Eye Toggle Show/Hide */}
                <button
                  type="button"
                  onClick={() => setShowOpenRouter(!showOpenRouter)}
                  className="p-1 rounded opacity-60 hover:opacity-100 transition"
                  title={showOpenRouter ? "Hide Key" : "Show Key"}
                >
                  {showOpenRouter ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Hint & Get Key Link */}
            <div className="flex items-center justify-between text-[11px] pt-0.5">
              <span className={`flex items-center gap-1 ${isOpenRouterValid ? "text-emerald-400 font-medium" : "opacity-60"}`}>
                {isOpenRouterValid && (
                  <svg className="w-3 h-3 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                )}
                {openRouterKey ? (isOpenRouterValid ? "Valid format (starts with sk-or-)" : "Should start with sk-or-") : "Leave empty to use Astra's free tier"}
              </span>

              <a
                href="https://openrouter.ai/keys"
                target="_blank"
                rel="noreferrer"
                className="text-purple-400 hover:text-purple-300 underline underline-offset-2 flex items-center gap-0.5"
              >
                <span>Get key</span>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>

          {/* Input Section 3: Custom Agent API Key */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="shrink-0 flex items-center justify-center cursor-pointer transition-transform hover:scale-110" title="Custom Agent API Key">
                  <KeyRoundIcon size={15} duration={1} color="#00bc7d" />
                </span>
                <label className="text-xs font-semibold">Custom Agent API Key</label>
                {/* Tooltip trigger */}
                <div
                  className="group relative cursor-pointer text-purple-400 opacity-60 hover:opacity-100"
                  title="For your own custom specialist agent, private model endpoints, or self-hosted LLMs."
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" strokeWidth="2" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 16v-4m0-4h.01" />
                  </svg>
                </div>
              </div>

              {/* Status Badge */}
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                  customAgentKey.trim()
                    ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400 font-semibold"
                    : isDark
                    ? "bg-purple-950/40 border-purple-500/25 text-purple-300"
                    : "bg-purple-100 border-purple-200 text-purple-800"
                }`}
              >
                {customAgentKey.trim() ? "● Personal Key Active" : "○ Optional (Custom Agent)"}
              </span>
            </div>

            {/* Input Box with Trailing Addons */}
            <div
              className={`flex items-center rounded-xl border px-3 py-1.5 transition-all ${
                isDark
                  ? "bg-purple-950/30 border-purple-500/30 focus-within:border-purple-400 focus-within:ring-2 focus-within:ring-purple-500/20"
                  : "bg-purple-50/40 border-purple-200 focus-within:border-purple-400 focus-within:ring-2 focus-within:ring-purple-200"
              }`}
            >
              {/* Left Lock Icon */}
              <svg className="w-4 h-4 opacity-50 shrink-0 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.8"
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>

              {/* Input field */}
              <input
                type={showCustomAgent ? "text" : "password"}
                value={customAgentKey}
                onChange={(e) => setCustomAgentKey(e.target.value)}
                placeholder="sk-••••••••••••••••••••••••••••••••••••"
                className="w-full bg-transparent text-xs font-mono outline-none border-none placeholder:opacity-40"
              />

              {/* Trailing Buttons */}
              <div className="flex items-center gap-1 shrink-0 ml-1">
                {/* Clear Button if has value */}
                {customAgentKey && (
                  <button
                    type="button"
                    onClick={() => setCustomAgentKey("")}
                    className="p-1 rounded opacity-50 hover:opacity-100 transition"
                    title="Clear"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}

                {/* Paste Button if empty */}
                {!customAgentKey && (
                  <button
                    type="button"
                    onClick={() => handlePaste("agent")}
                    className={`text-[10px] px-2 py-0.5 rounded-md font-medium border transition ${
                      isDark ? "bg-purple-900/40 border-purple-500/30 hover:bg-purple-900/70" : "bg-purple-100 border-purple-200 hover:bg-purple-200"
                    }`}
                  >
                    Paste
                  </button>
                )}

                {/* Eye Toggle Show/Hide */}
                <button
                  type="button"
                  onClick={() => setShowCustomAgent(!showCustomAgent)}
                  className="p-1 rounded opacity-60 hover:opacity-100 transition"
                  title={showCustomAgent ? "Hide Key" : "Show Key"}
                >
                  {showCustomAgent ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Hint */}
            <div className="flex items-center justify-between text-[11px] pt-0.5">
              <span className={`flex items-center gap-1 ${customAgentKey.trim() ? "text-emerald-400 font-medium" : "opacity-60"}`}>
                {customAgentKey.trim() ? "Personal agent key active" : "Optional: for specialized autonomous agents or private models"}
              </span>
            </div>
          </div>
        </div>

        {/* 3. Footer Action Controls */}
        <div
          className={`px-5 py-3.5 border-t flex items-center justify-between text-xs ${
            isDark ? "border-purple-500/20 bg-purple-950/20" : "border-purple-100 bg-purple-50/40"
          }`}
        >
          <button
            type="button"
            onClick={handleReset}
            className={`px-3 py-1.5 rounded-xl font-medium transition cursor-pointer text-xs ${
              isDark
                ? "hover:bg-red-500/20 text-red-300 border border-transparent hover:border-red-500/30"
                : "hover:bg-red-100 text-red-600 border border-transparent"
            }`}
            title="Remove custom keys and restore Astra free tier"
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
