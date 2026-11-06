"use client";

import React from "react";
import { createAvatar } from "@bible-strong/avatar-react";
import "@bible-strong/avatar-react/styles.css";
import definition from "./astra.avatar.json";

const ExportedAvatar = createAvatar(definition);

export interface AstraAvatarInnerProps {
  size?: number | string;
  animation?:
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
  expression?:
    | "neutral"
    | "upward-side-glance"
    | "downward-gaze"
    | "skeptical-right"
    | "small-attentive";
  className?: string;
  onClick?: () => void;
}

export default function AstraAvatarInner({
  size = 28,
  animation = "idle",
  expression,
  className = "",
  onClick,
}: AstraAvatarInnerProps) {
  return (
    <div
      onClick={onClick}
      className={`relative inline-flex items-center justify-center flex-shrink-0 select-none ${className}`}
      style={{ width: size, height: size }}
      title="Astra AI"
    >
      <ExportedAvatar
        {...(expression ? { expression } : { animation })}
        size="100%"
        ariaLabel="Astra Avatar"
      />
    </div>
  );
}
