"use client";

import React from "react";

export interface TokenUsageBadgeProps {
  percentage?: number;
  totalTokensUsed: number;
  dailyQuota: number;
  isDark: boolean;
  accentColor?: string;
  onClick?: () => void;
  className?: string;
}

export function TokenUsageBadge({
  percentage = 100,
  totalTokensUsed = 0,
  dailyQuota = 100000,
  isDark,
  accentColor = "#a855f7",
  onClick,
  className = "",
}: TokenUsageBadgeProps) {
  // Clamped percentage 0 - 100 (Represents Remaining Available Quota)
  const clamped = Math.min(100, Math.max(0, Math.round(percentage)));

  // SVG Circle calculations for 14x14 radius 5.5
  const radius = 5.5;
  const circumference = 2 * Math.PI * radius; // ~34.55
  const strokeDashoffset = circumference - (clamped / 100) * circumference;

  // Status color logic based on remaining quota:
  // > 30% remaining: Active theme accent (Healthy)
  // 15% - 30% remaining: Amber warning
  // <= 15% remaining: Rose red critical
  const statusColor =
    clamped <= 15
      ? "#f43f5e" // Rose
      : clamped <= 30
      ? "#f59e0b" // Amber
      : accentColor; // Accent (Purple, Emerald, etc.)

  const remainingTokens = Math.max(0, dailyQuota - totalTokensUsed);

  return (
    <button
      type="button"
      onClick={onClick}
      title={`AI Token Quota: ${remainingTokens.toLocaleString()} / ${dailyQuota.toLocaleString()} tokens remaining (${clamped}% available). ${totalTokensUsed.toLocaleString()} tokens used. Click to view agent telemetry.`}
      className={`group relative inline-flex items-center gap-1.5 h-7 px-2.5 rounded-full border transition-all duration-200 cursor-pointer select-none ${
        isDark
          ? "bg-zinc-900/60 hover:bg-zinc-800/80 border-white/10 hover:border-white/20 text-zinc-300 hover:text-white"
          : "bg-white/80 hover:bg-white border-purple-200 hover:border-purple-300 text-purple-950 shadow-xs"
      } ${className}`}
      style={{
        boxShadow: isDark
          ? `0 0 10px ${statusColor}18`
          : undefined,
      }}
    >
      {/* Mini Circular Progress Ring (Full 100% when untouched) */}
      <div className="relative w-3.5 h-3.5 flex items-center justify-center shrink-0">
        <svg className="w-3.5 h-3.5 -rotate-90 transform" viewBox="0 0 14 14">
          {/* Track */}
          <circle
            cx="7"
            cy="7"
            r={radius}
            fill="none"
            stroke={isDark ? "rgba(255, 255, 255, 0.15)" : "rgba(0, 0, 0, 0.1)"}
            strokeWidth="1.8"
          />
          {/* Range Progress */}
          <circle
            cx="7"
            cy="7"
            r={radius}
            fill="none"
            stroke={statusColor}
            strokeWidth="1.8"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-500 ease-out"
          />
        </svg>
      </div>

      {/* Percentage Text */}
      <span className="text-[11px] font-mono font-semibold tracking-tight leading-none group-hover:scale-105 transition-transform">
        {clamped}%
      </span>

      {/* Subtle indicator dot when critical limit (<= 15% remaining) */}
      {clamped <= 15 && (
        <span
          className="w-1.5 h-1.5 rounded-full animate-pulse shrink-0"
          style={{ backgroundColor: statusColor }}
        />
      )}
    </button>
  );
}
