"use client";

import React, { useState } from "react";
import { createPortal } from "react-dom";

export interface MessageAttachmentMeta {
  id?: string;
  name: string;
  size: number;
  type?: string;
  kind: "pdf" | "image" | "document" | "spreadsheet" | "code" | "other";
  dataUrl?: string;
  extractedText?: string;
}

interface MessageAttachmentsProps {
  attachments: MessageAttachmentMeta[];
  isDark: boolean;
  accentColor?: string;
}

export function MessageAttachments({
  attachments,
  isDark,
  accentColor = "#a855f7",
}: MessageAttachmentsProps) {
  const [activeImage, setActiveImage] = useState<string | null>(null);

  if (!attachments || attachments.length === 0) return null;

  return (
    <>
      <div className="flex flex-wrap gap-2.5 my-2">
        {attachments.map((att, idx) => {
          const isImage = att.kind === "image" || att.type?.startsWith("image/");
          const isPdf = att.kind === "pdf" || att.name.endsWith(".pdf");
          const isCode = att.kind === "code";
          const isSpreadsheet = att.kind === "spreadsheet";

          const formattedSize =
            att.size < 1024
              ? `${att.size} B`
              : att.size < 1024 * 1024
              ? `${(att.size / 1024).toFixed(1)} KB`
              : `${(att.size / (1024 * 1024)).toFixed(1)} MB`;

          if (isImage && att.dataUrl) {
            return (
              <div
                key={idx}
                className="group relative rounded-2xl overflow-hidden border border-white/15 shadow-md max-w-xs cursor-pointer transition-transform hover:scale-[1.02]"
                onClick={() => setActiveImage(att.dataUrl || null)}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={att.dataUrl}
                  alt={att.name}
                  className="max-h-48 w-auto object-cover rounded-2xl"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-2 text-white text-[11px] truncate">
                  <p className="font-semibold truncate">{att.name}</p>
                  <p className="text-[10px] opacity-75 font-mono">{formattedSize}</p>
                </div>
              </div>
            );
          }

          return (
            <div
              key={idx}
              className={`flex items-center gap-3 p-2.5 rounded-2xl border transition-all select-none shadow-xs max-w-sm ${
                isDark
                  ? "bg-purple-950/40 border-purple-500/25 text-purple-100 hover:border-purple-500/40"
                  : "bg-white/90 border-purple-200 text-purple-950 hover:border-purple-300"
              }`}
            >
              {/* Kind Badge Icon */}
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 border ${
                  isPdf
                    ? "bg-rose-500/20 text-rose-400 border-rose-500/30"
                    : isCode
                    ? "bg-purple-500/20 text-purple-300 border-purple-500/30"
                    : isSpreadsheet
                    ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                    : "bg-sky-500/20 text-sky-400 border-sky-500/30"
                }`}
              >
                {isPdf ? "PDF" : isCode ? "</>" : isSpreadsheet ? "XLS" : "DOC"}
              </div>

              {/* File Info */}
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold truncate leading-tight">{att.name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] opacity-60 font-mono">{formattedSize}</span>
                  <span className="text-[9px] uppercase px-1.5 py-0.2 rounded-md bg-white/10 font-medium">
                    Attached
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Image Lightbox Portal */}
      {activeImage &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999999] bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setActiveImage(null)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={activeImage}
              alt="Attachment full view"
              className="max-h-[90vh] max-w-[90vw] object-contain rounded-2xl shadow-2xl"
            />
            <button
              type="button"
              onClick={() => setActiveImage(null)}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center text-sm font-bold cursor-pointer"
            >
              ✕
            </button>
          </div>,
          document.body
        )}
    </>
  );
}

