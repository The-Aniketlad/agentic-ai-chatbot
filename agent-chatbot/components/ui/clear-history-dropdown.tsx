"use client";

import React, { useState, useRef, useEffect } from "react";
import { EllipsisVerticalIcon } from "@animateicons/react/lucide";

interface ClearHistoryDropdownProps {
  onClearAll: () => void;
  isDark: boolean;
}

export function ClearHistoryDropdown({
  onClearAll,
  isDark,
}: ClearHistoryDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<{ startAnimation: () => void; stopAnimation: () => void } | null>(null);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Escape key listener
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div ref={containerRef} className="relative inline-flex items-center">
      {/* Animated 3 Dots Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        onMouseEnter={() => iconRef.current?.startAnimation()}
        onMouseLeave={() => iconRef.current?.stopAnimation()}
        className={`p-1 rounded-md transition-all duration-200 cursor-pointer flex items-center justify-center ${
          isDark
            ? "hover:bg-purple-900/40 text-purple-300 hover:text-white"
            : "hover:bg-purple-100 text-purple-700 hover:text-purple-950"
        } ${isOpen ? (isDark ? "bg-purple-900/50 text-white" : "bg-purple-100 text-purple-950") : ""}`}
        title="Session options"
      >
        <EllipsisVerticalIcon
          ref={iconRef}
          size={14}
          duration={1}
          color={isDark ? "#a78bfa" : "#7c3aed"}
        />
      </button>

      {/* Downward Small Dropdown Popover */}
      {isOpen && (
        <div
          className={`absolute right-0 top-full mt-1 w-44 rounded-xl p-1 shadow-2xl border origin-top-right animate-in fade-in-0 zoom-in-95 duration-150 z-50 ${
            isDark
              ? "bg-[#130b24]/95 border-purple-500/35 text-white shadow-[0_16px_40px_rgba(0,0,0,0.85)] backdrop-blur-2xl"
              : "bg-white/95 border-purple-200 text-purple-950 shadow-[0_16px_40px_rgba(85,45,145,0.2)] backdrop-blur-2xl"
          }`}
        >
          {/* Only option: Clear all chats */}
          <button
            type="button"
            onClick={() => {
              onClearAll();
              setIsOpen(false);
            }}
            className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-medium transition-all text-left cursor-pointer group ${
              isDark
                ? "hover:bg-red-500/15 text-red-300 hover:text-red-200"
                : "hover:bg-red-50 text-red-600 hover:text-red-700"
            }`}
          >
            <div
              className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                isDark ? "bg-red-500/15 text-red-300" : "bg-red-100 text-red-600"
              }`}
            >
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.8"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </div>
            <span className="truncate">Clear all chats</span>
          </button>
        </div>
      )}
    </div>
  );
}
