import zlib from "zlib";

export interface ParsedDocument {
  name: string;
  size: number;
  type: string;
  text: string;
  kind: "pdf" | "image" | "document" | "spreadsheet" | "code" | "other";
  previewUrl?: string;
}

/**
 * Robust zero-dependency PDF text extractor using Node.js built-in zlib
 * Decompresses PDF FlateDecode streams and extracts text operators (Tj and TJ)
 */
export function extractTextFromPdfBuffer(buf: Buffer): string {
  try {
    let extractedText = "";
    let pos = 0;

    while (pos < buf.length) {
      const streamStart = buf.indexOf("stream", pos);
      if (streamStart === -1) break;

      let dataStart = streamStart + 6;
      if (buf[dataStart] === 0x0d && buf[dataStart + 1] === 0x0a) {
        dataStart += 2;
      } else if (buf[dataStart] === 0x0a || buf[dataStart] === 0x0d) {
        dataStart += 1;
      }

      const streamEnd = buf.indexOf("endstream", dataStart);
      if (streamEnd === -1) break;

      const rawData = buf.subarray(dataStart, streamEnd);
      let decompressed = "";

      try {
        decompressed = zlib.inflateSync(rawData).toString("latin1");
      } catch {
        // Fallback for uncompressed or alternate streams
        decompressed = rawData.toString("latin1");
      }

      // Extract text inside BT (Begin Text) ... ET (End Text) blocks
      const btRegex = /BT[\s\S]*?ET/g;
      let btMatch: RegExpExecArray | null;

      while ((btMatch = btRegex.exec(decompressed)) !== null) {
        const block = btMatch[0];

        // 1. Match (text) Tj
        const tjRegex = /\(([^)]*)\)\s*Tj/g;
        let tjMatch: RegExpExecArray | null;
        while ((tjMatch = tjRegex.exec(block)) !== null) {
          extractedText += cleanPdfString(tjMatch[1]) + " ";
        }

        // 2. Match [(text)-10(more)] TJ
        const tjArrayRegex = /\[(.*?)\]\s*TJ/g;
        let arrMatch: RegExpExecArray | null;
        while ((arrMatch = tjArrayRegex.exec(block)) !== null) {
          const inner = arrMatch[1];
          const innerTj = /\(([^)]*)\)/g;
          let im: RegExpExecArray | null;
          while ((im = innerTj.exec(inner)) !== null) {
            extractedText += cleanPdfString(im[1]);
          }
          extractedText += " ";
        }
      }

      pos = streamEnd + 9;
    }

    const cleaned = extractedText
      .replace(/\\r/g, "\n")
      .replace(/\\n/g, "\n")
      .replace(/[ \t]+/g, " ")
      .replace(/\n\s*\n/g, "\n\n")
      .trim();

    return cleaned || "PDF loaded. (Document contains mostly scanned images or non-standard glyph encoding).";
  } catch (err) {
    console.warn("Failed to extract PDF text:", err);
    return "PDF document attached. Unable to extract raw text stream.";
  }
}

function cleanPdfString(str: string): string {
  return str
    .replace(/\\([()\\])/g, "$1")
    .replace(/\\n/g, "\n")
    .replace(/\\r/g, "\r")
    .replace(/\\t/g, "\t");
}

export function determineFileKind(
  fileName: string,
  mimeType: string
): "pdf" | "image" | "document" | "spreadsheet" | "code" | "other" {
  const ext = fileName.split(".").pop()?.toLowerCase() || "";

  if (mimeType.startsWith("image/") || ["png", "jpg", "jpeg", "webp", "gif", "svg"].includes(ext)) {
    return "image";
  }
  if (mimeType === "application/pdf" || ext === "pdf") {
    return "pdf";
  }
  if (
    ["csv", "xlsx", "xls", "tsv"].includes(ext) ||
    mimeType.includes("spreadsheet") ||
    mimeType.includes("excel")
  ) {
    return "spreadsheet";
  }
  if (
    [
      "js",
      "jsx",
      "ts",
      "tsx",
      "py",
      "html",
      "css",
      "json",
      "sql",
      "cpp",
      "c",
      "java",
      "rs",
      "go",
      "php",
      "rb",
      "sh",
      "yaml",
      "yml",
      "xml",
    ].includes(ext)
  ) {
    return "code";
  }
  if (["doc", "docx", "txt", "md", "rtf", "odt"].includes(ext)) {
    return "document";
  }
  return "other";
}

