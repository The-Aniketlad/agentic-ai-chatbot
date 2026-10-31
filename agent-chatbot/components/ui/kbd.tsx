"use client";

import React, { ReactNode } from "react";

export interface KbdProps extends React.HTMLAttributes<HTMLElement> {
  children: ReactNode;
  className?: string;
  size?: "xs" | "sm" | "md" | "lg";
  variant?: "default" | "subtle" | "accent";
  isPressed?: boolean;
}

export function Kbd({
  children,
  className = "",
  size = "sm",
  variant = "default",
  isPressed = false,
  style,
  ...props
}: KbdProps) {
  const sizeClasses = {
    xs: "min-w-[18px] h-[18px] text-[10px] px-1",
    sm: "min-w-[22px] h-[22px] text-[11px] px-1.5",
    md: "min-w-[26px] h-[26px] text-xs px-2",
    lg: "min-w-[32px] h-[32px] text-sm px-2.5",
  }[size];

  const variantClasses = {
    default:
      "bg-white/[0.08] dark:bg-white/[0.07] border-white/20 dark:border-white/15 text-zinc-800 dark:text-zinc-200 shadow-[0_2px_0_0_rgba(0,0,0,0.08)] dark:shadow-[0_2px_0_0_rgba(255,255,255,0.08),0_1px_3px_rgba(0,0,0,0.4)]",
    subtle:
      "bg-zinc-100 dark:bg-zinc-800/60 border-zinc-200 dark:border-zinc-700/60 text-zinc-600 dark:text-zinc-300 shadow-none",
    accent:
      "bg-purple-500/15 border-purple-400/40 text-purple-600 dark:text-purple-300 shadow-[0_2px_0_0_rgba(168,85,247,0.2)]",
  }[variant];

  return (
    <kbd
      {...props}
      style={style}
      className={`inline-flex items-center justify-center font-mono font-semibold tracking-tight rounded-md border select-none transition-all duration-150 ${sizeClasses} ${variantClasses} ${
        isPressed ? "translate-y-[1px] shadow-none scale-95" : ""
      } ${className}`}
    >
      {children}
    </kbd>
  );
}

export interface KbdGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
  separator?: ReactNode;
}

export function KbdGroup({
  children,
  className = "",
  separator = <span className="opacity-40 text-[10px] font-mono select-none">+</span>,
  ...props
}: KbdGroupProps) {
  const childrenArray = React.Children.toArray(children);

  return (
    <div
      {...props}
      className={`inline-flex items-center gap-1 p-0.5 rounded-lg select-none ${className}`}
    >
      {childrenArray.map((child, index) => (
        <React.Fragment key={index}>
          {child}
          {index < childrenArray.length - 1 && separator && (
            <span className="flex items-center justify-center px-0.5">{separator}</span>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

