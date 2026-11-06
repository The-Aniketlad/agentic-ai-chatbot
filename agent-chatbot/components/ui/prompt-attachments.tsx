"use client";

import React from "react";
import type { UploadedFile } from "./file-upload-card";

interface PromptAttachmentsProps {
  files: UploadedFile[];
  onRemove: (id: string) => void;
  isDark: boolean;
  accentColor?: string;
}

export function PromptAttachments({
  files,
  onRemove,
  isDark,
  accentColor = "#a855f7",
}: PromptAttachmentsProps) {
  if (files.length === 0) return null;

  return (
    <div className="flex items-center gap-2 flex-wrap px-2 pt-2 pb-1 overflow-x-auto max-h-32">
      {files.map((fileItem) => {
        const file = fileItem.file;
        const isImage = file.type.startsWith("image/") || fileItem.kind === "image";
        const isPdf = file.type === "application/pdf" || file.name.endsWith(".pdf") || fileItem.kind === "pdf";
        const isCode = fileItem.kind === "code" || /\.(js|jsx|ts|tsx|py|html|css|json|sql|cpp)$/i.test(file.name);
        const isSpreadsheet = fileItem.kind === "spreadsheet" || /\.(csv|xlsx|xls)$/i.test(file.name);

        const formattedSize =
          file.size < 1024
            ? `${file.size} B`
            : file.size < 1024 * 1024
            ? `${(file.size / 1024).toFixed(1)} KB`
            : `${(file.size / (1024 * 1024)).toFixed(1)} MB`;

        return (
          <div
            key={fileItem.id}
            className={`group relative flex items-center gap-2 px-2.5 py-1.5 rounded-xl border text-xs transition-all duration-200 select-none shadow-xs ${
              isDark
                ? "bg-zinc-900/80 border-white/10 hover:border-white/20 text-zinc-200"
                : "bg-white/90 border-purple-200 hover:border-purple-300 text-purple-950"
            }`}
          >
            {/* Visual Icon or Thumbnail */}
            {isImage && fileItem.dataUrl ? (
              <div className="w-6 h-6 rounded-md overflow-hidden bg-black/20 shrink-0 border border-white/10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={fileItem.dataUrl}
                  alt={file.name}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : isPdf ? (
              <div className="w-6 h-6 rounded-md bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold text-[9px] shrink-0 border border-rose-500/30">
                PDF
              </div>
            ) : isCode ? (
              <div className="w-6 h-6 rounded-md bg-purple-500/20 text-purple-300 flex items-center justify-center text-xs shrink-0 border border-purple-500/30">
                &lt;/&gt;
              </div>
            ) : isSpreadsheet ? (
              <div className="w-6 h-6 rounded-md bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[9px] shrink-0 border border-emerald-500/30">
                XLS
              </div>
            ) : (
              <div className="w-6 h-6 rounded-md bg-sky-500/20 text-sky-400 flex items-center justify-center text-xs shrink-0 border border-sky-500/30">
                📄
              </div>
            )}

            {/* Name & Size */}
            <div className="flex flex-col min-w-0 max-w-[140px] sm:max-w-[180px]">
              <span className="font-semibold truncate text-[11px] leading-tight">
                {file.name}
              </span>
              <span className="text-[9px] opacity-60 font-mono leading-tight">
                {formattedSize}
              </span>
            </div>

            {/* Progress Bar (if still processing) */}
            {fileItem.progress < 100 && (
              <div className="absolute inset-x-0 bottom-0 h-0.5 bg-purple-500/30 overflow-hidden rounded-b-xl">
                <div
                  className="h-full bg-purple-500 transition-all duration-300"
                  style={{ width: `${fileItem.progress}%` }}
                />
              </div>
            )}

            {/* Remove Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onRemove(fileItem.id);
              }}
              className="p-1 rounded-full opacity-60 hover:opacity-100 hover:bg-white/10 transition-colors cursor-pointer text-xs leading-none shrink-0"
              title="Remove attachment"
            >
              ✕
            </button>
          </div>
        );
      })}
    </div>
  );
}

