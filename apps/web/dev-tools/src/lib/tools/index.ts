export type ToolId = "json" | "xml" | "csv" | "base64" | "text";

export interface ToolDefinition {
  id: ToolId;
  name: string;
  shortName: string;
  description: string;
  keywords: string[];
}

export const DEVELOPER_TOOLS: ToolDefinition[] = [
  {
    id: "json",
    name: "JSON Formatter",
    shortName: "JSON",
    description:
      "Format with custom indentation, minify, and validate JSON with line and column diagnostics.",
    keywords: ["json", "format", "pretty", "minify", "validate", "lint"],
  },
  {
    id: "xml",
    name: "XML Formatter",
    shortName: "XML",
    description:
      "Format, minify, and validate XML locally using safe browser-native DOMParser parsing.",
    keywords: ["xml", "format", "minify", "validate", "domparser", "soap", "svg"],
  },
  {
    id: "csv",
    name: "CSV Converter",
    shortName: "CSV",
    description:
      "Convert CSV to JSON and JSON to CSV with RFC 4180 quoted, escaped, and multiline fields.",
    keywords: ["csv", "json", "table", "spreadsheet", "tsv", "convert"],
  },
  {
    id: "base64",
    name: "Base64 Encoder / Decoder",
    shortName: "Base64",
    description:
      "Encode and decode UTF-8 and Unicode text safely with standard or URL-safe Base64 validation.",
    keywords: ["base64", "encode", "decode", "utf-8", "unicode", "url-safe"],
  },
  {
    id: "text",
    name: "Text Utilities",
    shortName: "Text",
    description:
      "Inspect character, code point, word, line, and byte counts and clean up messy whitespace.",
    keywords: ["text", "count", "words", "lines", "characters", "whitespace", "trim"],
  },
];

export function filterTools(query: string): ToolDefinition[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return DEVELOPER_TOOLS;
  }

  return DEVELOPER_TOOLS.filter((tool) => {
    const haystack = `${tool.name} ${tool.description} ${tool.keywords.join(" ")}`.toLowerCase();
    return haystack.includes(normalized);
  });
}

export * from "./base64";
export * from "./csv";
export * from "./json";
export * from "./text";
export * from "./xml";
