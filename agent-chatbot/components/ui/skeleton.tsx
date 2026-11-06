"use client";

import React from "react";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  isLoaded?: boolean;
  children?: React.ReactNode;
}

/**
 * High-performance HeroUI-style Skeleton component
 * Features a hardware-accelerated fluid shimmer sweep animation
 */
export function Skeleton({
  className = "",
  isLoaded = false,
  children,
  ...props
}: SkeletonProps) {
  if (isLoaded) return <>{children}</>;

  return (
    <div
      role="status"
      aria-busy="true"
      className={`relative overflow-hidden rounded-lg bg-white/[0.07] dark:bg-white/[0.06] border border-white/[0.05] before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.8s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/[0.12] dark:before:via-white/[0.08] before:to-transparent ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

/**
 * Text Content Skeleton matching skeleton.jsx
 */
export function TextContent() {
  return (
    <div className="w-full max-w-md space-y-2.5">
      <Skeleton className="h-4 w-full rounded-md" />
      <Skeleton className="h-4 w-5/6 rounded-md" />
      <Skeleton className="h-4 w-4/6 rounded-md" />
      <Skeleton className="h-4 w-full rounded-md" />
      <Skeleton className="h-4 w-3/6 rounded-md" />
    </div>
  );
}

/**
 * Industry-standard Conversational Chat Stream Skeleton
 * Renders realistic staggered user and agent dialogue bubbles while thread hydrates
 */
export function ChatHistorySkeleton({ isDark = true }: { isDark?: boolean }) {
  return (
    <div className="w-full max-w-3xl mx-auto py-6 space-y-6 animate-in fade-in-0 duration-300">
      {/* 1. User Query Turn */}
      <div className="flex flex-col items-end">
        <div
          className={`max-w-[75%] md:max-w-[55%] w-72 p-3.5 rounded-2xl rounded-br-sm border space-y-2 shadow-sm ${
            isDark
              ? "bg-purple-900/30 border-purple-500/20"
              : "bg-purple-200/50 border-purple-300/60"
          }`}
        >
          <Skeleton className="h-3.5 w-full rounded-md" />
          <Skeleton className="h-3.5 w-2/3 rounded-md" />
        </div>
      </div>

      {/* 2. Agent Response Turn */}
      <div className="flex flex-col items-start w-full">
        {/* Agent badge skeleton */}
        <div className="flex items-center gap-2 mb-2 ml-1">
          <Skeleton className="w-2.5 h-2.5 rounded-full" />
          <Skeleton className="h-3 w-32 rounded-full" />
        </div>

        {/* Message bubble */}
        <div
          className={`max-w-[88%] md:max-w-[80%] w-full p-4 rounded-2xl rounded-bl-sm border space-y-3 shadow-md ${
            isDark
              ? "bg-[#140e24]/70 border-purple-500/20"
              : "bg-white/80 border-purple-200/80"
          }`}
        >
          <Skeleton className="h-4 w-full rounded-md" />
          <Skeleton className="h-4 w-[92%] rounded-md" />
          <Skeleton className="h-4 w-4/5 rounded-md" />
          <div className="pt-1 space-y-2">
            <Skeleton className="h-3.5 w-[85%] rounded-md" />
            <Skeleton className="h-3.5 w-3/5 rounded-md" />
          </div>
        </div>
      </div>

      {/* 3. Second User Query Turn */}
      <div className="flex flex-col items-end">
        <div
          className={`max-w-[70%] md:max-w-[50%] w-60 p-3.5 rounded-2xl rounded-br-sm border space-y-2 shadow-sm ${
            isDark
              ? "bg-purple-900/30 border-purple-500/20"
              : "bg-purple-200/50 border-purple-300/60"
          }`}
        >
          <Skeleton className="h-3.5 w-full rounded-md" />
          <Skeleton className="h-3.5 w-4/5 rounded-md" />
        </div>
      </div>

      {/* 4. Second Agent Response Turn */}
      <div className="flex flex-col items-start w-full">
        <div className="flex items-center gap-2 mb-2 ml-1">
          <Skeleton className="w-2.5 h-2.5 rounded-full" />
          <Skeleton className="h-3 w-28 rounded-full" />
        </div>
        <div
          className={`max-w-[88%] md:max-w-[75%] w-full p-4 rounded-2xl rounded-bl-sm border space-y-2.5 shadow-md ${
            isDark
              ? "bg-[#140e24]/70 border-purple-500/20"
              : "bg-white/80 border-purple-200/80"
          }`}
        >
          <Skeleton className="h-4 w-full rounded-md" />
          <Skeleton className="h-4 w-5/6 rounded-md" />
          <Skeleton className="h-4 w-2/3 rounded-md" />
        </div>
      </div>
    </div>
  );
}

/**
 * Sidebar Recent Sessions Skeleton for instant hydration feedback
 */
export function SidebarSessionSkeleton() {
  return (
    <div className="space-y-1.5 px-1 py-1">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="flex items-center gap-2.5 px-3 py-2 rounded-xl border border-transparent bg-white/[0.03]"
        >
          <Skeleton className="w-3.5 h-3.5 rounded-md shrink-0" />
          <Skeleton
            className="h-3 rounded-md"
            style={{ width: i === 1 ? "75%" : i === 2 ? "60%" : "85%" }}
          />
        </div>
      ))}
    </div>
  );
}

export default Skeleton;

