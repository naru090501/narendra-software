export interface TextStats {
  characters: number;
  codePoints: number;
  charactersNoSpaces: number;
  words: number;
  lines: number;
  nonEmptyLines: number;
  bytes: number;
}

export interface WhitespaceCleanupOptions {
  trimLines?: boolean;
  collapseSpaces?: boolean;
  collapseBlankLines?: boolean;
  removeBlankLines?: boolean;
  normalizeLineEndings?: boolean;
}

export function analyzeText(input: string): TextStats {
  const bytes = new TextEncoder().encode(input).byteLength;
  const characters = input.length;
  const codePoints = Array.from(input).length;
  const charactersNoSpaces = Array.from(input.replace(/\s+/g, "")).length;
  const trimmed = input.trim();
  const words = trimmed.length === 0 ? 0 : trimmed.split(/\s+/).length;

  if (input.length === 0) {
    return {
      characters: 0,
      codePoints: 0,
      charactersNoSpaces: 0,
      words: 0,
      lines: 0,
      nonEmptyLines: 0,
      bytes: 0,
    };
  }

  const splitLines = input.split(/\r\n|\r|\n/);
  const nonEmptyLines = splitLines.filter(
    (line) => line.trim().length > 0,
  ).length;

  return {
    characters,
    codePoints,
    charactersNoSpaces,
    words,
    lines: splitLines.length,
    nonEmptyLines,
    bytes,
  };
}

export function cleanWhitespace(
  input: string,
  options: WhitespaceCleanupOptions = {},
): string {
  const {
    trimLines = true,
    collapseSpaces = true,
    collapseBlankLines = true,
    removeBlankLines = false,
    normalizeLineEndings = true,
  } = options;

  let lines = normalizeLineEndings
    ? input.replace(/\r\n|\r/g, "\n").split("\n")
    : input.split("\n");

  if (collapseSpaces) {
    lines = lines.map((line) => line.replace(/[ \t]+/g, " "));
  }

  if (trimLines) {
    lines = lines.map((line) => line.trim());
  }

  if (removeBlankLines) {
    lines = lines.filter((line) => line.trim().length > 0);
  } else if (collapseBlankLines) {
    const collapsed: string[] = [];
    let previousBlank = false;
    for (const line of lines) {
      const isBlank = line.trim().length === 0;
      if (isBlank && previousBlank) {
        continue;
      }
      collapsed.push(line);
      previousBlank = isBlank;
    }
    lines = collapsed;
  }

  return lines.join("\n").trim();
}
