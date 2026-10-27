"use client";

import React, { useState, useRef, useEffect, useLayoutEffect } from "react";
import { createPortal } from "react-dom";

const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

export interface UploadedFile {
  id: string;
  file: File;
  progress: number;
  status: "uploading" | "completed" | "error";
}

interface FileUploadCardProps {
  isOpen: boolean;
  onClose: () => void;
  files: UploadedFile[];
  onFilesChange: (files: File[]) => void;
  onFileRemove: (id: string) => void;
  triggerRef: React.RefObject<HTMLElement | null>;
  isDark: boolean;
}

export function FileUploadCard({
  isOpen,
  onClose,
  files,
  onFilesChange,
  onFileRemove,
  triggerRef,
  isDark,
}: FileUploadCardProps) {
  const [mounted, setMounted] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const [coords, setCoords] = useState<{ top: number; left: number; width: number } | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Update position to open UPWARDS above the paperclip button
  const updatePosition = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const cardWidth = Math.min(440, window.innerWidth - 24);
    // Align left with trigger, clamped inside screen
    const left = Math.max(12, Math.min(rect.left, window.innerWidth - cardWidth - 12));

    setCoords({
      top: rect.top - 10, // Places bottom 10px above trigger via translateY(-100%)
      left,
      width: cardWidth,
    });
  };

  useIsomorphicLayoutEffect(() => {
    if (isOpen) {
      updatePosition();
      window.addEventListener("scroll", updatePosition, true);
      window.addEventListener("resize", updatePosition);
      return () => {
        window.removeEventListener("scroll", updatePosition, true);
        window.removeEventListener("resize", updatePosition);
      };
    } else {
      setCoords(null);
    }
  }, [isOpen, triggerRef]);

  // Click outside listener (safe across portal)
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (
        triggerRef.current &&
        !triggerRef.current.contains(target) &&
        cardRef.current &&
        !cardRef.current.contains(target)
      ) {
        onClose();
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose, triggerRef]);

  // Escape key listener
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
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

  // Drag and drop handlers
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFilesChange(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFilesChange(Array.from(e.target.files));
      e.target.value = ""; // Reset so same file can be selected again
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 KB";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const getExtensionBadge = (filename: string) => {
    const parts = filename.split(".");
    if (parts.length > 1) {
      return parts.pop()?.toUpperCase().substring(0, 4) || "FILE";
    }
    return "FILE";
  };

  if (!mounted || !isOpen || !coords) return null;

  return createPortal(
    <div
      ref={cardRef}
      style={{
        position: "fixed",
        top: `${coords.top}px`,
        left: `${coords.left}px`,
        width: `${coords.width}px`,
        transform: "translateY(-100%)",
        transformOrigin: "bottom left",
        zIndex: 999999,
      }}
      className={`rounded-2xl overflow-hidden shadow-2xl border origin-bottom-left animate-in fade-in-0 zoom-in-95 duration-200 ease-out ${
        isDark
          ? "bg-[#130b24]/95 border-purple-500/35 text-white shadow-[0_24px_60px_rgba(0,0,0,0.85),0_0_30px_rgba(168,85,247,0.22)] backdrop-blur-2xl"
          : "bg-white/95 border-purple-200 text-purple-950 shadow-[0_24px_60px_rgba(85,45,145,0.2)] backdrop-blur-2xl"
      }`}
    >
      {/* 1. Header */}
      <div
        className={`flex items-center justify-between p-4 border-b ${
          isDark ? "border-purple-500/20 bg-purple-950/25" : "border-purple-100 bg-purple-50/40"
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
              isDark
                ? "bg-purple-500/20 text-purple-300 border border-purple-500/30 shadow-[0_0_12px_rgba(168,85,247,0.2)]"
                : "bg-purple-100 text-purple-700 border border-purple-200"
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.8"
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-semibold">Attach & Upload Files</h3>
            <p className="text-[11px] opacity-70">Files are read locally for AI document analysis</p>
          </div>
        </div>

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
            isDark ? "hover:bg-white/10 text-purple-300" : "hover:bg-purple-100 text-purple-700"
          }`}
          title="Close upload card"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* 2. Drag and Drop Zone */}
      <div className="p-4">
        <div
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-5 flex flex-col items-center justify-center text-center transition-all duration-200 cursor-pointer ${
            isDragging
              ? isDark
                ? "border-purple-400 bg-purple-500/20 shadow-[0_0_20px_rgba(168,85,247,0.3)]"
                : "border-purple-600 bg-purple-100/70"
              : isDark
              ? "border-purple-500/30 hover:border-purple-400/60 bg-purple-950/20 hover:bg-purple-950/40"
              : "border-purple-200 hover:border-purple-400 bg-purple-50/30 hover:bg-purple-50/70"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={handleFileSelect}
          />

          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center mb-2.5 ${
              isDark ? "bg-purple-500/15 text-purple-300" : "bg-purple-100 text-purple-600"
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.8"
                d="M12 4v16m8-8H4"
              />
            </svg>
          </div>

          <p className="text-xs font-semibold">
            Choose a file or <span className="text-purple-400 underline underline-offset-2">browse</span>
          </p>
          <p className="text-[10px] opacity-60 mt-1">
            PDF, CSV, JSON, TXT, MD, images up to 50 MB
          </p>
        </div>
      </div>

      {/* 3. Uploaded Files List */}
      {files.length > 0 && (
        <div
          className={`px-4 pb-4 pt-2 border-t max-h-48 overflow-y-auto ${
            isDark ? "border-purple-500/20" : "border-purple-100"
          }`}
        >
          <div className="flex items-center justify-between pb-2">
            <span className="text-[11px] font-semibold opacity-70">
              Attached ({files.length})
            </span>
          </div>

          <div className="space-y-2.5">
            {files.map((item) => (
              <div
                key={item.id}
                className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                  isDark
                    ? "bg-purple-950/30 border-purple-500/25"
                    : "bg-purple-50/50 border-purple-200"
                }`}
              >
                {/* File Badge & Info */}
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold shrink-0 ${
                      isDark
                        ? "bg-purple-600/30 text-purple-200 border border-purple-400/30"
                        : "bg-purple-200 text-purple-900 border border-purple-300"
                    }`}
                  >
                    {getExtensionBadge(item.file.name)}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium truncate">{item.file.name}</p>
                    <div className="flex items-center gap-1.5 text-[10px] opacity-70 mt-0.5">
                      <span>{formatFileSize(item.file.size)}</span>
                      <span>•</span>
                      {item.status === "uploading" ? (
                        <span className="text-purple-400 font-medium">Reading {item.progress}%</span>
                      ) : (
                        <span className="text-emerald-400 font-medium flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                          </svg>
                          Ready for prompt
                        </span>
                      )}
                    </div>

                    {/* Progress Bar Animation */}
                    {item.status === "uploading" && (
                      <div className="w-full bg-purple-950/60 rounded-full h-1 mt-1.5 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-purple-500 to-indigo-400 h-full rounded-full transition-all duration-300"
                          style={{ width: `${item.progress}%` }}
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Remove File Button */}
                <button
                  type="button"
                  onClick={() => onFileRemove(item.id)}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer shrink-0 ${
                    isDark ? "hover:bg-red-500/20 text-red-300" : "hover:bg-red-100 text-red-600"
                  }`}
                  title="Remove file"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>,
    document.body
  );
}
