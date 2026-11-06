import { NextRequest, NextResponse } from "next/server";
import {
  extractTextFromPdfBuffer,
  determineFileKind,
} from "@/lib/document-parser";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const name = file.name;
    const size = file.size;
    const type = file.type || "application/octet-stream";
    const kind = determineFileKind(name, type);
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let text = "";

    if (kind === "pdf") {
      text = extractTextFromPdfBuffer(buffer);
    } else if (kind === "image") {
      // For images, generate base64 data URL for preview
      const base64 = buffer.toString("base64");
      const dataUrl = `data:${type};base64,${base64}`;
      return NextResponse.json({
        success: true,
        name,
        size,
        type,
        kind,
        dataUrl,
        text: `[Image Attachment: "${name}" (${(size / 1024).toFixed(1)} KB)]`,
      });
    } else {
      // Text, code, document, csv
      try {
        text = buffer.toString("utf-8");
      } catch {
        text = buffer.toString("latin1");
      }
    }

    // Limit text to first 30,000 characters to prevent prompt token blowout
    const truncatedText = text.length > 30000 ? text.substring(0, 30000) + "\n\n[... Truncated for token limit ...]" : text;

    return NextResponse.json({
      success: true,
      name,
      size,
      type,
      kind,
      text: truncatedText,
      charCount: truncatedText.length,
    });
  } catch (err: unknown) {
    const error = err as { message?: string };
    console.error("Document parsing error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to parse document" },
      { status: 500 }
    );
  }
}

