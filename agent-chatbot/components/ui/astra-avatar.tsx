"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";

const AstraAvatarInner = dynamic(() => import("./astra-avatar-inner"), {
  ssr: false,
  loading: () => (
    <div
      className="rounded-full bg-gradient-to-tr from-purple-500 via-indigo-500 to-pink-500 animate-pulse flex-shrink-0"
      style={{ width: 26, height: 26 }}
    />
  ),
});

export type AstraAvatarAnimation =
  | "idle"
  | "thinking"
  | "listening"
  | "waking"
  | "sleeping"
  | "searching"
  | "working"
  | "excited"
  | "happy"
  | "curious"
  | "confused";

export type AstraAvatarExpression =
  | "neutral"
  | "upward-side-glance"
  | "downward-gaze"
  | "skeptical-right"
  | "small-attentive";

export interface AstraAvatarProps {
  size?: number | string;
  animation?: AstraAvatarAnimation;
  expression?: AstraAvatarExpression;
  className?: string;
}

export function AstraAvatar({
  size = 28,
  animation = "idle",
  expression,
  className = "",
}: AstraAvatarProps) {
  return (
    <div className="inline-flex items-center justify-center flex-shrink-0 select-none">
      <AstraAvatarInner
        size={size}
        animation={animation}
        expression={expression}
        className={className}
      />
    </div>
  );
}

