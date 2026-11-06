"use client";

import React, { useEffect, useState } from "react";

export interface AgentThinkingProps {
  variant?: "stars" | "wave" | "spin" | "infinity";
  label?: string;
  tone?: "accent" | "subtle" | "default";
  showTimer?: boolean;
  className?: string;
}

/**
 * 4-pointed Sparkle Star for the "stars" variant
 */
function SparkleStar({
  size = 14,
  delay = 0,
  duration = 1.6,
}: {
  size?: number;
  delay?: number;
  duration?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className="inline-block animate-[twinkle_ease-in-out_infinite]"
      style={{
        animationDuration: `${duration}s`,
        animationDelay: `${delay}s`,
      }}
    >
      <path d="M12 2C12 7.52 7.52 12 2 12C7.52 12 12 16.48 12 22C12 16.48 16.48 12 22 12C16.48 12 12 7.52 12 2Z" />
    </svg>
  );
}

/**
 * BoardUI AgentThinking Component
 * Displays agent thinking status with animated variants (stars, wave, spin, infinity),
 * shimmering label, and active elapsed time tracker.
 */
export function AgentThinking({
  variant = "stars",
  label = "Thinking",
  tone = "accent",
  showTimer = true,
  className = "",
}: AgentThinkingProps) {
  const [elapsedMs, setElapsedMs] = useState(0);

  useEffect(() => {
    const start = performance.now();
    const interval = setInterval(() => {
      setElapsedMs(Math.floor(performance.now() - start));
    }, 100);

    return () => clearInterval(interval);
  }, []);

  const elapsedSec = (elapsedMs / 1000).toFixed(1);

  // Tone colors
  const toneClasses = {
    accent: "text-purple-400 border-purple-500/25 bg-purple-950/30 shadow-[0_0_20px_rgba(168,85,247,0.15)]",
    subtle: "text-purple-200/70 border-white/10 bg-white/5",
    default: "text-zinc-300 border-zinc-700/50 bg-zinc-900/40",
  }[tone];

  return (
    <div
      role="status"
      aria-live="polite"
      className={`inline-flex items-center gap-3 px-3.5 py-2 rounded-2xl border backdrop-blur-md transition-all duration-300 select-none ${toneClasses} ${className}`}
    >
      {/* 1. Variant Visual Animation */}
      {variant === "stars" && (
        <div className="flex items-center gap-1.5 shrink-0 text-purple-400 filter drop-shadow-[0_0_8px_rgba(192,132,252,0.6)]">
          <SparkleStar size={12} delay={0} duration={1.5} />
          <SparkleStar size={16} delay={0.3} duration={1.5} />
          <SparkleStar size={10} delay={0.6} duration={1.5} />
          <SparkleStar size={14} delay={0.9} duration={1.5} />
          <SparkleStar size={11} delay={1.2} duration={1.5} />
        </div>
      )}

      {variant === "wave" && (
        <div className="grid grid-cols-3 gap-1 shrink-0 p-1">
          {[...Array(9)].map((_, i) => (
            <span
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-current animate-pulse"
              style={{
                animationDelay: `${((i % 3) + Math.floor(i / 3)) * 120}ms`,
              }}
            />
          ))}
        </div>
      )}

      {variant === "spin" && (
        <div className="relative w-4 h-4 shrink-0 animate-spin">
          <div className="w-full h-full rounded-full border-2 border-current border-t-transparent" />
        </div>
      )}

      {variant === "infinity" && (
        <svg
          className="w-5 h-3.5 shrink-0 stroke-current fill-none stroke-[2] animate-pulse"
          viewBox="0 0 24 16"
        >
          <path d="M7 8C7 5.79 5.21 4 3 4C0.79 4 -1 5.79 -1 8C-1 10.21 0.79 12 3 12C5.21 12 7 10.21 7 8ZM7 8C7 5.79 8.79 4 11 4C13.21 4 15 5.79 15 8C15 10.21 13.21 12 11 12C8.79 12 7 10.21 7 8Z" />
        </svg>
      )}

      {/* 2. Shimmering Label */}
      <div className="flex items-center gap-1 font-medium text-xs tracking-wide">
        <span className="bg-gradient-to-r from-purple-200 via-pink-100 to-purple-300 bg-clip-text text-transparent animate-pulse">
          {label}
        </span>
        <span className="flex gap-0.5 ml-0.5 text-purple-300/80">
          <span className="animate-bounce delay-100">.</span>
          <span className="animate-bounce delay-200">.</span>
          <span className="animate-bounce delay-300">.</span>
        </span>
      </div>

      {/* 3. Live Elapsed Timer */}
      {showTimer && (
        <div className="ml-1 pl-2 border-l border-white/10 flex items-center">
          <span className="text-[10px] font-mono tracking-tight text-purple-200/60 bg-white/5 px-1.5 py-0.5 rounded-md">
            {elapsedSec}s
          </span>
        </div>
      )}
    </div>
  );
}

export default AgentThinking;

