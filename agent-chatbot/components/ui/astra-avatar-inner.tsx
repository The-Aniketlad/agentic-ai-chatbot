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
    | "intro-face"
    | "upward-side-glance"
    | "downward-gaze"
    | "skeptical-right"
    | "small-attentive"
    | "wide-downward-gaze"
    | "surprised-left"
    | "sleepy-squint"
    | "angry-right"
    | "curious-left"
    | "asymmetric-down-right"
    | "attentive-left"
    | "joyful-wide"
    | "eyes-closed"
    | "joyful-down-right"
    | "skeptical-left"
    | "far-right-glance"
    | "angry-left"
    | "playful-right"
    | "asymmetric-up-left"
    | "gentle-downward-gaze"
    | "wide-down-left"
    | "surprised-wide-left"
    | "drowsy-closed"
    | "suspicious-right"
    | "shy-downward"
    | "angry-brows"
    | "uneasy-left";
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
