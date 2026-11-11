export interface Base64Success {
  ok: true;
  output: string;
  inputBytes: number;
  outputBytes: number;
}

export interface Base64Error {
  ok: false;
  error: string;
}

export type Base64Result = Base64Success | Base64Error;

function bytesToBase64(bytes: Uint8Array): string {
  const CHUNK_SIZE = 0x8000;
  let binary = "";
  for (let i = 0; i < bytes.length; i += CHUNK_SIZE) {
    const chunk = bytes.subarray(i, i + CHUNK_SIZE);
    binary += String.fromCharCode(...chunk);
  }
  return btoa(binary);
}

function base64ToBytes(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export function encodeBase64(
  input: string,
  options: { urlSafe?: boolean } = {},
): Base64Result {
  if (input.length === 0) {
    return {
      ok: false,
      error: "Input is empty. Enter text to encode to Base64.",
    };
  }

  const encoder = new TextEncoder();
  const bytes = encoder.encode(input);
  let encoded = bytesToBase64(bytes);

  if (options.urlSafe) {
    encoded = encoded
      .replaceAll("+", "-")
      .replaceAll("/", "_")
      .replace(/=+$/, "");
  }

  return {
    ok: true,
    output: encoded,
    inputBytes: bytes.byteLength,
    outputBytes: encoder.encode(encoded).byteLength,
  };
}

export function decodeBase64(
  input: string,
  options: { urlSafe?: boolean } = {},
): Base64Result {
  const compact = input.replace(/\s+/g, "");
  if (compact.length === 0) {
    return {
      ok: false,
      error: "Input is empty. Paste a Base64 string to decode.",
    };
  }

  const normalized = options.urlSafe
    ? compact.replaceAll("-", "+").replaceAll("_", "/")
    : compact;

  if (!/^[A-Za-z0-9+/]*={0,2}$/.test(normalized)) {
    return {
      ok: false,
      error:
        "Invalid Base64 input: contains characters outside the valid Base64 alphabet.",
    };
  }

  const unpaddedLength = normalized.replace(/=+$/, "").length;
  if (unpaddedLength % 4 === 1) {
    return {
      ok: false,
      error: "Invalid Base64 length: truncated quartet.",
    };
  }

  const padded =
    normalized.length % 4 === 0
      ? normalized
      : normalized + "=".repeat(4 - (normalized.length % 4));

  try {
    const bytes = base64ToBytes(padded);
    const decoded = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
    const encoder = new TextEncoder();

    return {
      ok: true,
      output: decoded,
      inputBytes: encoder.encode(compact).byteLength,
      outputBytes: bytes.byteLength,
    };
  } catch {
    return {
      ok: false,
      error:
        "Invalid Base64 or malformed UTF-8 byte sequence that cannot be decoded as text.",
    };
  }
}
