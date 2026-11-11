export interface JsonResult {
  ok: true;
  output: string;
  stats: {
    inputBytes: number;
    outputBytes: number;
    lines: number;
    isLargeInput: boolean;
  };
}

export interface JsonErrorResult {
  ok: false;
  error: string;
  location?: {
    line: number;
    column: number;
  };
}

export type JsonProcessResult = JsonResult | JsonErrorResult;

export const JSON_LARGE_THRESHOLD_BYTES = 512 * 1024;
export const JSON_MAX_INPUT_BYTES = 10 * 1024 * 1024;

function utf8ByteLength(text: string): number {
  return new TextEncoder().encode(text).byteLength;
}

function getLineAndColumn(
  source: string,
  offset: number,
): { line: number; column: number } {
  const clamped = Math.max(0, Math.min(offset, source.length));
  const slice = source.slice(0, clamped);
  const lines = slice.split("\n");
  const line = lines.length;
  const column = (lines[lines.length - 1]?.length ?? 0) + 1;
  return { line, column };
}

function parseJsonSyntaxError(source: string, error: unknown): JsonErrorResult {
  const message =
    error instanceof Error ? error.message : "Invalid JSON syntax.";

  const posMatch = /position\s+(\d+)/i.exec(message);
  if (posMatch?.[1]) {
    const offset = Number.parseInt(posMatch[1], 10);
    if (Number.isFinite(offset)) {
      const location = getLineAndColumn(source, offset);
      return {
        ok: false,
        error: `${message} (line ${location.line}, column ${location.column}).`,
        location,
      };
    }
  }

  const lineColMatch = /line\s+(\d+)\s+column\s+(\d+)/i.exec(message);
  if (lineColMatch?.[1] && lineColMatch[2]) {
    return {
      ok: false,
      error: message,
      location: {
        line: Number.parseInt(lineColMatch[1], 10),
        column: Number.parseInt(lineColMatch[2], 10),
      },
    };
  }

  return { ok: false, error: message };
}

function processJson(
  input: string,
  space: 2 | 4 | "\t" | 0,
): JsonProcessResult {
  if (input.trim().length === 0) {
    return {
      ok: false,
      error: "Input is empty. Paste JSON to format, minify, or validate.",
    };
  }

  const inputBytes = utf8ByteLength(input);
  if (inputBytes > JSON_MAX_INPUT_BYTES) {
    return {
      ok: false,
      error: `Input exceeds the 10 MB browser safety limit (${(inputBytes / (1024 * 1024)).toFixed(1)} MB).`,
    };
  }

  try {
    const parsed: unknown = JSON.parse(input);
    const output =
      space === 0 ? JSON.stringify(parsed) : JSON.stringify(parsed, null, space);
    const outputBytes = utf8ByteLength(output);
    const lines = output.length === 0 ? 0 : output.split("\n").length;

    return {
      ok: true,
      output,
      stats: {
        inputBytes,
        outputBytes,
        lines,
        isLargeInput: inputBytes >= JSON_LARGE_THRESHOLD_BYTES,
      },
    };
  } catch (error) {
    return parseJsonSyntaxError(input, error);
  }
}

export function formatJson(
  input: string,
  indent: 2 | 4 | "\t" = 2,
): JsonProcessResult {
  return processJson(input, indent);
}

export function minifyJson(input: string): JsonProcessResult {
  return processJson(input, 0);
}

export function validateJson(input: string): JsonProcessResult {
  return processJson(input, 2);
}
