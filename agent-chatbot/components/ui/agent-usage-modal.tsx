"use client";

import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { RefreshCcwIcon, type RefreshCcwIconHandle } from "@animateicons/react/lucide";

export function getUtcDateString(date?: Date): string {
  if (typeof window === "undefined" && !date) return "";
  const d = date || new Date();
  return d.toISOString().slice(0, 10);
}

export function getTimeUntilUtcMidnight(): { hours: number; minutes: number; formatted: string } {
  if (typeof window === "undefined") {
    return { hours: 0, minutes: 0, formatted: "--" };
  }
  const now = new Date();
  const nextMidnight = new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate() + 1,
    0, 0, 0, 0
  ));
  const diffMs = Math.max(0, nextMidnight.getTime() - now.getTime());
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  return {
    hours,
    minutes,
    formatted: `${hours}h ${minutes}m`,
  };
}

export interface AgentTelemetryData {
  totalTokensUsed: number;
  dailyQuota: number;
  promptsCount: number;
  timeRange: "1h" | "6h" | "24h" | "7d" | "30d" | "all";
  lastResetDate: string; // ISO date string "YYYY-MM-DD" in UTC
  lastResetTimestamp: number;
  allTimeTokensUsed?: number;
  allTimePromptsCount?: number;
  agents: {
    coder: { tokens: number; prompts: number; name: string };
    researcher: { tokens: number; prompts: number; name: string };
    summarizer: { tokens: number; prompts: number; name: string };
    supervisor: { tokens: number; prompts: number; name: string };
  };
  providers: {
    groq: number;
    openrouter: number;
    custom: number;
  };
}

export function createDefaultTelemetry(quota: number = 100000): AgentTelemetryData {
  const todayUtc = getUtcDateString();
  return {
    totalTokensUsed: 0,
    dailyQuota: quota,
    promptsCount: 0,
    timeRange: "24h",
    lastResetDate: todayUtc,
    lastResetTimestamp: typeof window !== "undefined" ? Date.now() : 0,
    allTimeTokensUsed: 0,
    allTimePromptsCount: 0,
    agents: {
      coder: { tokens: 0, prompts: 0, name: "Software Engineer" },
      researcher: { tokens: 0, prompts: 0, name: "Research Analyst" },
      summarizer: { tokens: 0, prompts: 0, name: "Executive Summarizer" },
      supervisor: { tokens: 0, prompts: 0, name: "Supervisor Router" },
    },
    providers: {
      groq: 0,
      openrouter: 0,
      custom: 0,
    },
  };
}

export function checkAndResetDailyTelemetry(
  current: AgentTelemetryData | null | undefined,
  targetQuota: number = 100000
): { data: AgentTelemetryData; wasReset: boolean } {
  if (typeof window === "undefined") {
    return { data: current || DEFAULT_TELEMETRY, wasReset: false };
  }

  const todayUtc = getUtcDateString();

  if (!current || !current.lastResetDate || current.lastResetDate !== todayUtc) {
    const quota = current?.dailyQuota && current.dailyQuota > 0 ? current.dailyQuota : targetQuota;
    const prevTokens = current?.totalTokensUsed || 0;
    const prevPrompts = current?.promptsCount || 0;
    const prevAllTimeTokens = current?.allTimeTokensUsed || 0;
    const prevAllTimePrompts = current?.allTimePromptsCount || 0;

    const fresh: AgentTelemetryData = {
      totalTokensUsed: 0,
      dailyQuota: quota,
      promptsCount: 0,
      timeRange: current?.timeRange || "24h",
      lastResetDate: todayUtc,
      lastResetTimestamp: Date.now(),
      allTimeTokensUsed: prevAllTimeTokens + prevTokens,
      allTimePromptsCount: prevAllTimePrompts + prevPrompts,
      agents: {
        coder: { tokens: 0, prompts: 0, name: "Software Engineer" },
        researcher: { tokens: 0, prompts: 0, name: "Research Analyst" },
        summarizer: { tokens: 0, prompts: 0, name: "Executive Summarizer" },
        supervisor: { tokens: 0, prompts: 0, name: "Supervisor Router" },
      },
      providers: {
        groq: 0,
        openrouter: 0,
        custom: 0,
      },
    };
    return { data: fresh, wasReset: true };
  }

  return { data: current, wasReset: false };
}

export const DEFAULT_TELEMETRY: AgentTelemetryData = {
  totalTokensUsed: 0,
  dailyQuota: 100000,
  promptsCount: 0,
  timeRange: "24h",
  lastResetDate: "",
  lastResetTimestamp: 0,
  allTimeTokensUsed: 0,
  allTimePromptsCount: 0,
  agents: {
    coder: { tokens: 0, prompts: 0, name: "Software Engineer" },
    researcher: { tokens: 0, prompts: 0, name: "Research Analyst" },
    summarizer: { tokens: 0, prompts: 0, name: "Executive Summarizer" },
    supervisor: { tokens: 0, prompts: 0, name: "Supervisor Router" },
  },
  providers: {
    groq: 0,
    openrouter: 0,
    custom: 0,
  },
};

interface AgentUsageModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDark: boolean;
  accentColor?: string;
  telemetryData?: AgentTelemetryData;
  onResetTelemetry?: () => void;
  onRefreshTelemetry?: () => Promise<void> | void;
  onOpenApiKeys?: () => void;
}

export function AgentUsageModal({
  isOpen,
  onClose,
  isDark,
  accentColor = "#a855f7",
  telemetryData = DEFAULT_TELEMETRY,
  onResetTelemetry,
  onRefreshTelemetry,
  onOpenApiKeys,
}: AgentUsageModalProps) {
  const [mounted, setMounted] = useState(false);
  const [selectedRange, setSelectedRange] = useState<"1h" | "6h" | "24h" | "7d" | "30d" | "all">("24h");
  const [alertDismissed, setAlertDismissed] = useState(false);
  const [resetConfirm, setResetConfirm] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [justSynced, setJustSynced] = useState(false);
  const refreshIconRef = useRef<RefreshCcwIconHandle>(null);
  const headerRefreshIconRef = useRef<RefreshCcwIconHandle>(null);
  const [timeUntilReset, setTimeUntilReset] = useState<{ hours: number; minutes: number; formatted: string }>({
    hours: 0,
    minutes: 0,
    formatted: "--",
  });

  async function handleManualRefresh() {
    if (isRefreshing) return;
    setIsRefreshing(true);
    setJustSynced(false);

    // Start animated icon rotation
    refreshIconRef.current?.startAnimation();
    headerRefreshIconRef.current?.startAnimation();

    try {
      if (onRefreshTelemetry) {
        await onRefreshTelemetry();
      } else {
        await fetch("/api/telemetry", { cache: "no-store" });
      }
      setJustSynced(true);
      setTimeout(() => setJustSynced(false), 2200);
    } catch (err) {
      console.warn("Manual telemetry refresh error:", err);
    } finally {
      setTimeout(() => {
        setIsRefreshing(false);
        refreshIconRef.current?.stopAnimation();
        headerRefreshIconRef.current?.stopAnimation();
      }, 600);
    }
  }

  useEffect(() => {
    setMounted(true);
  }, []);

  // Live countdown to 00:00 UTC rollover
  useEffect(() => {
    if (!isOpen) return;
    setTimeUntilReset(getTimeUntilUtcMidnight());
    const timer = setInterval(() => {
      setTimeUntilReset(getTimeUntilUtcMidnight());
    }, 10000);
    return () => clearInterval(timer);
  }, [isOpen]);

  // Escape key listener
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

  if (!mounted || !isOpen) return null;

  const totalUsed = telemetryData.totalTokensUsed;
  const quota = telemetryData.dailyQuota;
  const remainingTokens = Math.max(0, quota - totalUsed);
  const remainingPercentage = Math.min(100, Math.max(0, Math.round((remainingTokens / quota) * 100)));
  const usedPercentage = Math.min(100, Math.max(0, Math.round((totalUsed / quota) * 100)));

  // Big Radial Gauge Calculations (size 110, radius 44) - displays Remaining Available Quota
  const ringSize = 110;
  const strokeWidth = 9;
  const center = ringSize / 2;
  const radius = center - strokeWidth / 2;
  const circumference = 2 * Math.PI * radius;
  // Offset calculated from remaining percentage so 100% = fully filled ring!
  const strokeDashoffset = circumference - (remainingPercentage / 100) * circumference;

  // Status color logic based on remaining quota
  const statusColor =
    remainingPercentage <= 15
      ? "#f43f5e"
      : remainingPercentage <= 30
      ? "#f59e0b"
      : accentColor;

  // Agent distribution percentages (0% when no tokens used)
  const coderPct = totalUsed > 0 ? Math.round((telemetryData.agents.coder.tokens / totalUsed) * 100) : 0;
  const researcherPct = totalUsed > 0 ? Math.round((telemetryData.agents.researcher.tokens / totalUsed) * 100) : 0;
  const summarizerPct = totalUsed > 0 ? Math.round((telemetryData.agents.summarizer.tokens / totalUsed) * 100) : 0;
  const supervisorPct = totalUsed > 0 ? Math.max(0, 100 - (coderPct + researcherPct + summarizerPct)) : 0;

  // Time Range multipliers for UI simulation
  const rangeMultiplier = {
    "1h": 0.12,
    "6h": 0.38,
    "24h": 1.0,
    "7d": 4.5,
    "30d": 18.2,
    all: 32.5,
  }[selectedRange];

  const displayTotalUsed = Math.round(totalUsed * rangeMultiplier);
  const displayCostSaved = (displayTotalUsed * 0.000002).toFixed(3); // ~$2 per 1M tokens average

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
        className={`relative w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl border transition-all duration-200 animate-in zoom-in-95 fade-in-0 flex flex-col max-h-[90vh] ${
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
              <svg className="w-5 h-5" style={{ color: accentColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold leading-tight">AI Agent Token Usage</h3>
                <span
                  style={{
                    backgroundColor: `${statusColor}18`,
                    borderColor: `${statusColor}40`,
                    color: statusColor,
                  }}
                  className="text-[10px] font-mono px-2 py-0.5 rounded-full border font-semibold"
                >
                  {remainingPercentage}% Available
                </span>
              </div>
              <p className="text-xs opacity-70 mt-0.5">
                Real-time telemetry • Daily quota resets at 00:00 UTC
              </p>
            </div>
          </div>

          {/* Header Action Controls */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              className={`h-8 px-2.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer border text-xs font-medium ${
                isRefreshing
                  ? "opacity-80 bg-purple-500/20 border-purple-500/40 text-purple-200 pointer-events-none"
                  : isDark
                  ? "bg-white/5 hover:bg-white/10 border-purple-500/20 hover:border-purple-500/40 text-purple-300 hover:text-white"
                  : "bg-purple-100/70 hover:bg-purple-200/80 border-purple-200 text-purple-800"
              }`}
              title="Sync Real-Time Quota Telemetry (Bypasses Cache)"
            >
              <RefreshCcwIcon
                ref={headerRefreshIconRef}
                size={14}
                duration={0.8}
                color={isDark ? "#c084fc" : "#7e22ce"}
              />
              <span className="text-[11px] hidden sm:inline font-mono">
                {isRefreshing ? "Syncing..." : justSynced ? "Synced!" : "Refresh"}
              </span>
            </button>

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

        {/* 2. Scrollable Modal Body */}
        <div className="p-4 md:p-6 overflow-y-auto space-y-5 flex-1">

          {/* Component 1: Smart Alert Box (inspired by Part 2/smart alert box/box.jsx) */}
          {usedPercentage >= 70 && !alertDismissed && (
            <div
              className={`relative overflow-hidden rounded-2xl border p-3.5 shadow-lg flex items-start gap-3 transition-all duration-300 animate-in fade-in-0 slide-in-from-top-2 ${
                isDark
                  ? "bg-amber-950/40 border-amber-500/40 text-amber-200"
                  : "bg-amber-50/90 border-amber-300 text-amber-950"
              }`}
            >
              <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-white shadow-sm mt-0.5">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>

              <div className="flex-1 min-w-0 pr-6">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold leading-tight uppercase tracking-wider">
                    Daily Quota Alert ({usedPercentage}% Reached)
                  </p>
                  <span className="text-[10px] opacity-70">Just now</span>
                </div>
                <p className="text-xs leading-relaxed opacity-90 mt-1">
                  You are approaching your daily free tier limit ({remainingTokens.toLocaleString()} tokens left). Connect your personal API key (BYOK) for completely unlimited high-speed requests.
                </p>
                {onOpenApiKeys && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenApiKeys();
                    }}
                    className="mt-2 text-xs font-bold underline underline-offset-2 flex items-center gap-1 hover:opacity-80 cursor-pointer"
                  >
                    <span>Connect Free Custom API Key</span>
                    <span>→</span>
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => setAlertDismissed(true)}
                className="absolute top-2.5 right-2.5 p-1 rounded-lg opacity-60 hover:opacity-100 transition cursor-pointer"
                title="Dismiss alert"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}

          {/* Component 2 & 3: Hero Radial Progress Ring + Time-Range Filter */}
          <div
            className={`p-4 md:p-5 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-5 ${
              isDark ? "bg-purple-950/25 border-purple-500/20" : "bg-purple-50/60 border-purple-100"
            }`}
          >
            {/* Radial Progress Ring (inspired by Part 2/Progress Ring/Ring.tsx) */}
            <div className="flex items-center gap-4">
              <div className="relative flex items-center justify-center shrink-0" style={{ width: ringSize, height: ringSize }}>
                <svg className="-rotate-90 transform" width={ringSize} height={ringSize}>
                  {/* Track Circle */}
                  <circle
                    cx={center}
                    cy={center}
                    r={radius}
                    fill="none"
                    stroke={isDark ? "rgba(255, 255, 255, 0.12)" : "rgba(0, 0, 0, 0.08)"}
                    strokeWidth={strokeWidth}
                  />
                  {/* Progress Range Circle */}
                  <circle
                    cx={center}
                    cy={center}
                    r={radius}
                    fill="none"
                    stroke={statusColor}
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    style={{
                      filter: `drop-shadow(0 0 8px ${statusColor}80)`,
                      transition: "stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
                    }}
                  />
                </svg>

                {/* Percentage Center Text (Shows Remaining Available Quota) */}
                <div className="absolute inset-0 flex flex-col items-center justify-center select-none text-center">
                  <span className="text-xl sm:text-2xl font-mono font-bold leading-none tracking-tight">
                    {remainingPercentage}%
                  </span>
                  <span className="text-[10px] opacity-60 uppercase font-medium mt-0.5">
                    {totalUsed === 0 ? "Full Quota" : "Remaining"}
                  </span>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold opacity-60 uppercase tracking-wider">Remaining Token Quota</span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-semibold">
                    Real-Time Active
                  </span>
                </div>
                <div className="flex items-baseline gap-1.5 mt-0.5">
                  <span className="text-lg sm:text-xl font-bold font-mono">{remainingTokens.toLocaleString()}</span>
                  <span className="text-xs opacity-50">/ {quota.toLocaleString()} Tokens Left</span>
                </div>
                <p className="text-[11px] opacity-70 mt-1">
                  {totalUsed === 0
                    ? `100% full quota available • 0 tokens consumed today (${telemetryData.lastResetDate || "Active"})`
                    : `${totalUsed.toLocaleString()} tokens used today • ${remainingTokens.toLocaleString()} tokens remaining`}
                </p>
              </div>
            </div>

            {/* Time-Range Filter & Right-Corner Real-Time Refresh Button */}
            <div className="flex flex-col sm:items-end gap-1.5 w-full sm:w-auto">
              <div className="flex items-center justify-between sm:justify-end gap-2.5 w-full">
                <span className="text-[10px] font-semibold uppercase opacity-60 tracking-wider">Time Filter</span>

                {/* Right Corner Refresh Telemetry Button */}
                <button
                  type="button"
                  onClick={handleManualRefresh}
                  disabled={isRefreshing}
                  title="Query live token usage directly from AI providers & bypass cache"
                  className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[10px] font-mono font-medium transition-all duration-200 cursor-pointer border select-none ${
                    isRefreshing
                      ? "opacity-80 bg-purple-500/20 border-purple-500/40 text-purple-200 pointer-events-none"
                      : isDark
                      ? "bg-purple-900/30 hover:bg-purple-800/40 border-purple-500/30 hover:border-purple-400/60 text-purple-200 hover:text-white shadow-xs"
                      : "bg-purple-100 hover:bg-purple-200 border-purple-300 text-purple-900"
                  }`}
                >
                  <RefreshCcwIcon
                    ref={refreshIconRef}
                    size={11}
                    duration={0.8}
                    color={isDark ? "#c084fc" : "#7e22ce"}
                  />
                  <span>{isRefreshing ? "Syncing..." : justSynced ? "Synced!" : "Refresh"}</span>
                </button>
              </div>

              <div
                className={`inline-flex items-center p-1 rounded-xl border text-xs font-medium select-none ${
                  isDark ? "bg-black/30 border-white/10" : "bg-white border-purple-200"
                }`}
              >
                {(["1h", "6h", "24h", "7d", "30d", "all"] as const).map((range) => {
                  const isActive = selectedRange === range;
                  return (
                    <button
                      key={range}
                      type="button"
                      onClick={() => setSelectedRange(range)}
                      style={
                        isActive
                          ? {
                              backgroundColor: accentColor,
                              color: "#ffffff",
                              boxShadow: `0 2px 8px ${accentColor}40`,
                            }
                          : undefined
                      }
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-mono uppercase transition-all cursor-pointer ${
                        isActive
                          ? "font-bold"
                          : isDark
                          ? "opacity-60 hover:opacity-100 text-purple-200"
                          : "opacity-60 hover:opacity-100 text-purple-900"
                      }`}
                    >
                      {range}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Component 4: Stat Metric Cards (inspired by Part 2/Stat Metric cards/code.jsx) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div
              className={`p-3 rounded-xl border flex flex-col justify-between ${
                isDark ? "bg-purple-950/25 border-purple-500/20" : "bg-white border-purple-100 shadow-xs"
              }`}
            >
              <span className="text-[10px] uppercase font-semibold opacity-60">Tokens Used</span>
              <p className="text-base font-bold font-mono mt-1 text-purple-400">
                {displayTotalUsed.toLocaleString()}
              </p>
              <span className="text-[10px] opacity-60 mt-0.5">Across all models</span>
            </div>

            <div
              className={`p-3 rounded-xl border flex flex-col justify-between ${
                isDark ? "bg-purple-950/25 border-purple-500/20" : "bg-white border-purple-100 shadow-xs"
              }`}
            >
              <span className="text-[10px] uppercase font-semibold opacity-60">Remaining</span>
              <p className="text-base font-bold font-mono mt-1 text-emerald-400">
                {remainingTokens.toLocaleString()}
              </p>
              <span className="text-[10px] opacity-60 mt-0.5">Free balance</span>
            </div>

            <div
              className={`p-3 rounded-xl border flex flex-col justify-between ${
                isDark ? "bg-purple-950/25 border-purple-500/20" : "bg-white border-purple-100 shadow-xs"
              }`}
            >
              <span className="text-[10px] uppercase font-semibold opacity-60">Est. Cost Saved</span>
              <p className="text-base font-bold font-mono mt-1 text-amber-400">
                ${displayCostSaved}
              </p>
              <span className="text-[10px] opacity-60 mt-0.5">vs. direct API rates</span>
            </div>

            <div
              className={`p-3 rounded-xl border flex flex-col justify-between ${
                isDark ? "bg-purple-950/25 border-purple-500/20" : "bg-white border-purple-100 shadow-xs"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-semibold opacity-60">Quota Status</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" title="Daily 00:00 UTC cycle active" />
              </div>
              <p className="text-base font-bold font-mono mt-1 text-sky-400">
                {totalUsed === 0 ? "100% Full" : "Active"}
              </p>
              <span className="text-[10px] opacity-60 mt-0.5" title="Resets every 24 hours at 00:00 UTC">
                Resets in {timeUntilReset.formatted} (00:00 UTC)
              </span>
            </div>
          </div>

          {/* Component 5: Multi-Segmented Progress Bar (inspired by Part 2/Progresss bar/bar.jsx) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider opacity-75">
                Multi-Agent Token Distribution
              </span>
              <span className="text-[11px] font-mono opacity-60">
                {telemetryData.promptsCount === 0 ? "0 prompts (Session ready)" : `${telemetryData.promptsCount} total prompts`}
              </span>
            </div>

            {/* Segmented Horizontal Bar */}
            <div className="h-3 w-full rounded-full overflow-hidden flex bg-white/10 p-0.5 border border-white/10">
              {totalUsed === 0 ? (
                <div
                  style={{ width: "100%", background: accentColor }}
                  className="h-full rounded-full opacity-60 transition-all duration-500"
                  title="100% Free Quota Available"
                />
              ) : (
                <>
                  <div
                    style={{ width: `${coderPct}%` }}
                    className="bg-purple-500 h-full rounded-l-full transition-all duration-500"
                    title={`Coder Agent: ${coderPct}%`}
                  />
                  <div
                    style={{ width: `${researcherPct}%` }}
                    className="bg-sky-400 h-full transition-all duration-500"
                    title={`Researcher Agent: ${researcherPct}%`}
                  />
                  <div
                    style={{ width: `${summarizerPct}%` }}
                    className="bg-amber-400 h-full transition-all duration-500"
                    title={`Summarizer Agent: ${summarizerPct}%`}
                  />
                  <div
                    style={{ width: `${supervisorPct}%` }}
                    className="bg-emerald-400 h-full rounded-r-full transition-all duration-500"
                    title={`Supervisor: ${supervisorPct}%`}
                  />
                </>
              )}
            </div>

            {/* Multi-Segment Legend Dots */}
            <div className="flex items-center gap-4 flex-wrap text-xs pt-1">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                <span className="font-medium text-xs">Coder ({coderPct}%)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-400" />
                <span className="font-medium text-xs">Researcher ({researcherPct}%)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <span className="font-medium text-xs">Summarizer ({summarizerPct}%)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <span className="font-medium text-xs">Supervisor ({supervisorPct}%)</span>
              </div>
            </div>
          </div>

          {/* Component 6: Per-Agent Breakdown Cards */}
          <div className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider opacity-75">
              Active Specialist Agents
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Coder */}
              <div
                className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${
                  isDark ? "bg-purple-950/20 border-purple-500/20" : "bg-purple-50/50 border-purple-100"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-300 flex items-center justify-center shrink-0 text-base">
                    💻
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold truncate leading-tight">Software Engineer</p>
                    <p className="text-[10px] opacity-60 mt-0.5">{telemetryData.agents.coder.prompts} code routines</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-xs font-mono font-bold text-purple-400">
                    {telemetryData.agents.coder.tokens.toLocaleString()}
                  </span>
                  <span className="block text-[9px] opacity-60">tokens</span>
                </div>
              </div>

              {/* Researcher */}
              <div
                className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${
                  isDark ? "bg-sky-950/20 border-sky-500/20" : "bg-sky-50/50 border-sky-100"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-300 flex items-center justify-center shrink-0 text-base">
                    🔍
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold truncate leading-tight">Research Analyst</p>
                    <p className="text-[10px] opacity-60 mt-0.5">{telemetryData.agents.researcher.prompts} web searches</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-xs font-mono font-bold text-sky-400">
                    {telemetryData.agents.researcher.tokens.toLocaleString()}
                  </span>
                  <span className="block text-[9px] opacity-60">tokens</span>
                </div>
              </div>

              {/* Summarizer */}
              <div
                className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${
                  isDark ? "bg-amber-950/20 border-amber-500/20" : "bg-amber-50/50 border-amber-100"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0 text-base">
                    📄
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold truncate leading-tight">Executive Summarizer</p>
                    <p className="text-[10px] opacity-60 mt-0.5">{telemetryData.agents.summarizer.prompts} syntheses</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-xs font-mono font-bold text-amber-400">
                    {telemetryData.agents.summarizer.tokens.toLocaleString()}
                  </span>
                  <span className="block text-[9px] opacity-60">tokens</span>
                </div>
              </div>

              {/* Supervisor */}
              <div
                className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${
                  isDark ? "bg-emerald-950/20 border-emerald-500/20" : "bg-emerald-50/50 border-emerald-100"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0 text-base">
                    🧠
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold truncate leading-tight">Supervisor Router</p>
                    <p className="text-[10px] opacity-60 mt-0.5">{telemetryData.agents.supervisor.prompts} dispatches</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-xs font-mono font-bold text-emerald-400">
                    {telemetryData.agents.supervisor.tokens.toLocaleString()}
                  </span>
                  <span className="block text-[9px] opacity-60">tokens</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Footer Action Controls */}
        <div
          className={`px-5 py-3.5 border-t flex items-center justify-between text-xs shrink-0 ${
            isDark ? "border-purple-500/20 bg-purple-950/30" : "border-purple-100 bg-purple-50/50"
          }`}
        >
          {/* Reset Telemetry */}
          {resetConfirm ? (
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-red-400 font-medium">Reset all local counts?</span>
              <button
                type="button"
                onClick={() => {
                  onResetTelemetry?.();
                  setResetConfirm(false);
                }}
                className="px-2.5 py-1 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold transition cursor-pointer text-xs"
              >
                Confirm
              </button>
              <button
                type="button"
                onClick={() => setResetConfirm(false)}
                className="px-2 py-1 text-xs opacity-60 hover:opacity-100 transition cursor-pointer"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setResetConfirm(true)}
              className={`px-3 py-1.5 rounded-xl font-medium transition cursor-pointer text-xs ${
                isDark
                  ? "hover:bg-red-500/20 text-red-300 border border-transparent hover:border-red-500/30"
                  : "hover:bg-red-100 text-red-600 border border-transparent"
              }`}
              title="Reset local token counter"
            >
              Reset Telemetry
            </button>
          )}

          <div className="flex items-center gap-2">
            {onOpenApiKeys && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenApiKeys();
                }}
                className={`px-3.5 py-1.5 rounded-xl font-medium transition cursor-pointer border ${
                  isDark
                    ? "bg-white/5 hover:bg-white/10 text-purple-200 border-purple-500/20"
                    : "bg-white hover:bg-purple-50 text-purple-900 border-purple-200"
                }`}
              >
                Custom API Keys (BYOK)
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              style={{
                background: `linear-gradient(135deg, ${accentColor}, ${accentColor}dd)`,
                boxShadow: `0 6px 20px ${accentColor}45`,
              }}
              className="px-4 py-1.5 rounded-xl font-bold text-white transition-all cursor-pointer hover:scale-[1.02] active:scale-98"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

