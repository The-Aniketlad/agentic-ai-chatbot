"use client";

import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

export interface ChatContextMenuProps {
  isOpen: boolean;
  position: { x: number; y: number } | null;
  isPinned: boolean;
  onPin: () => void;
  onRename: () => void;
  onDelete: () => void;
  onClose: () => void;
  isDark?: boolean;
  accentColor?: string;
}

export function ChatContextMenu({
  isOpen,
  position,
  isPinned,
  onPin,
  onRename,
  onDelete,
  onClose,
  isDark = true,
  accentColor = "#a855f7",
}: ChatContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
      }
    }

    // Capture click outside
    window.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("scroll", onClose, true);
    window.addEventListener("resize", onClose);

    return () => {
      window.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("scroll", onClose, true);
      window.removeEventListener("resize", onClose);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !position) return null;

  // Keep menu within viewport boundaries
  const menuWidth = 170;
  const menuHeight = 125;
  const viewportWidth = typeof window !== "undefined" ? window.innerWidth : 1000;
  const viewportHeight = typeof window !== "undefined" ? window.innerHeight : 800;

  const left = Math.min(position.x, viewportWidth - menuWidth - 12);
  const top = Math.min(position.y, viewportHeight - menuHeight - 12);

  const menuContent = (
    <div
      ref={menuRef}
      style={{ left: `${left}px`, top: `${top}px` }}
      className={`fixed z-50 w-44 rounded-2xl p-1.5 shadow-2xl backdrop-blur-xl border select-none animate-in fade-in-0 zoom-in-95 duration-150 ${
        isDark
          ? "bg-[#140e24]/90 border-purple-500/30 text-purple-100 shadow-[0_12px_40px_rgba(0,0,0,0.6)]"
          : "bg-white/95 border-purple-200 text-purple-950 shadow-[0_12px_36px_rgba(147,51,234,0.18)]"
      }`}
      onClick={(e) => e.stopPropagation()}
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* 1. Pin / Unpin Action */}
      <button
        type="button"
        onClick={() => {
          onPin();
          onClose();
        }}
        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
          isDark
            ? "hover:bg-purple-500/20 hover:text-white"
            : "hover:bg-purple-100/70 hover:text-purple-950"
        }`}
      >
        <svg
          className="w-3.5 h-3.5 shrink-0"
          style={{ color: isPinned ? accentColor : "currentColor" }}
          fill={isPinned ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 5a2 2 0 012-2h10a2 2 0 012 2v2a2 2 0 01-.586 1.414L16 11v6l2 2v1H6v-1l2-2v-6L5.586 8.414A2 2 0 015 7V5z"
          />
        </svg>
        <span>{isPinned ? "Unpin chat" : "Pin to top"}</span>
      </button>

      {/* 2. Rename Action */}
      <button
        type="button"
        onClick={() => {
          onRename();
          onClose();
        }}
        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
          isDark
            ? "hover:bg-purple-500/20 hover:text-white"
            : "hover:bg-purple-100/70 hover:text-purple-950"
        }`}
      >
        <svg
          className="w-3.5 h-3.5 shrink-0 opacity-70"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
          />
        </svg>
        <span>Rename</span>
      </button>

      <div className={`my-1 h-px ${isDark ? "bg-white/10" : "bg-purple-200/60"}`} />

      {/* 3. Delete Action */}
      <button
        type="button"
        onClick={() => {
          onDelete();
          onClose();
        }}
        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
          isDark
            ? "text-red-400 hover:bg-red-500/20 hover:text-red-300"
            : "text-red-600 hover:bg-red-50 hover:text-red-700"
        }`}
      >
        <svg
          className="w-3.5 h-3.5 shrink-0"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
          />
        </svg>
        <span>Delete chat</span>
      </button>
    </div>
  );

  return typeof document !== "undefined" ? createPortal(menuContent, document.body) : null;
}

export default ChatContextMenu;

