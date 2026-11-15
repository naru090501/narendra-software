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

export type CaseTransformType =
  | "none"
  | "uppercase"
  | "lowercase"
  | "titlecase"
  | "sentencecase"
  | "camelcase"
  | "pascalcase"
  | "kebabcase"
  | "snakecase"
  | "constantcase";

export interface TextTransformOptions {
  caseTransform?: CaseTransformType;
  removeSpecialChars?: boolean;
  removeNumbers?: boolean;
  removePunctuation?: boolean;
  spaceHandling?: "preserve" | "collapse" | "removeAll";
  trimLines?: boolean;
  removeBlankLines?: boolean;
  collapseBlankLines?: boolean;
  removeDuplicateLines?: boolean;
  sortLines?: "none" | "asc" | "desc";
  reverseText?: boolean;
  reverseLines?: boolean;
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

// ----------------------------------------------------------------------------
// Case Transformations
// ----------------------------------------------------------------------------

export function toUppercase(text: string): string {
  return text.toUpperCase();
}

export function toLowercase(text: string): string {
  return text.toLowerCase();
}

export function toTitleCase(text: string): string {
  return text.replace(/\b\w+/g, (match) => {
    return match.charAt(0).toUpperCase() + match.slice(1).toLowerCase();
  });
}

export function toSentenceCase(text: string): string {
  const lower = text.toLowerCase();
  return lower.replace(
    /(^\s*|[.!?]\s+|\n\s*)([a-z\u00E0-\u00FC])/g,
    (_, boundary, char) => boundary + char.toUpperCase(),
  );
}

function extractWords(text: string): string[] {
  // Split on spaces, underscores, dashes, and transitions from lowercase to uppercase
  return text
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0);
}

export function toCamelCase(text: string): string {
  const words = extractWords(text);
  if (words.length === 0) return "";
  return words
    .map((word, index) => {
      const lower = word.toLowerCase();
      if (index === 0) return lower;
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join("");
}

export function toPascalCase(text: string): string {
  const words = extractWords(text);
  if (words.length === 0) return "";
  return words
    .map((word) => {
      const lower = word.toLowerCase();
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join("");
}

export function toKebabCase(text: string): string {
  const words = extractWords(text);
  return words.map((w) => w.toLowerCase()).join("-");
}

export function toSnakeCase(text: string): string {
  const words = extractWords(text);
  return words.map((w) => w.toLowerCase()).join("_");
}

export function toConstantCase(text: string): string {
  const words = extractWords(text);
  return words.map((w) => w.toUpperCase()).join("_");
}

// ----------------------------------------------------------------------------
// Character & Punctuation Cleanup
// ----------------------------------------------------------------------------

export function removeSpecialCharacters(
  text: string,
  options: { keepWhitespace?: boolean; keepNumbers?: boolean } = {},
): string {
  const { keepWhitespace = true, keepNumbers = true } = options;
  if (keepWhitespace && keepNumbers) {
    return text.replace(/[^a-zA-Z0-9\s]/g, "");
  }
  if (keepWhitespace && !keepNumbers) {
    return text.replace(/[^a-zA-Z\s]/g, "");
  }
  if (!keepWhitespace && keepNumbers) {
    return text.replace(/[^a-zA-Z0-9]/g, "");
  }
  return text.replace(/[^a-zA-Z]/g, "");
}

export function removeAllSpaces(text: string): string {
  return text.replace(/\s+/g, "");
}

export function removeNumbers(text: string): string {
  return text.replace(/[0-9]/g, "");
}

export function removePunctuation(text: string): string {
  return text.replace(/[.,/#!$%^&*;:{}=\-_`~()?"'<>@[\]\\|]/g, "");
}

export function sortLines(text: string, direction: "asc" | "desc" = "asc"): string {
  const lines = text.split(/\r\n|\r|\n/);
  lines.sort((a, b) => {
    return direction === "asc" ? a.localeCompare(b) : b.localeCompare(a);
  });
  return lines.join("\n");
}

export function removeDuplicateLines(text: string): string {
  const lines = text.split(/\r\n|\r|\n/);
  const seen = new Set<string>();
  const unique: string[] = [];
  for (const line of lines) {
    if (!seen.has(line)) {
      seen.add(line);
      unique.push(line);
    }
  }
  return unique.join("\n");
}

export function reverseText(text: string): string {
  return Array.from(text).reverse().join("");
}

export function reverseLines(text: string): string {
  const lines = text.split(/\r\n|\r|\n/);
  return lines.reverse().join("\n");
}

// ----------------------------------------------------------------------------
// Whitespace Utilities
// ----------------------------------------------------------------------------

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

// ----------------------------------------------------------------------------
// Combined Multi-Task Pipeline Executor
// ----------------------------------------------------------------------------

export function transformText(
  input: string,
  options: TextTransformOptions = {},
): string {
  let result = input;

  // 1. Remove numbers first if requested, so that word boundaries and case conversions
  // (e.g. kebab-case, snake_case) don't leave trailing/dangling delimiters.
  if (options.removeNumbers) {
    result = removeNumbers(result);
  }

  // 2. Run case transformations so word boundaries, letter cases, and sentences
  // are properly detected and transformed before spaces or punctuation are stripped.
  if (options.caseTransform && options.caseTransform !== "none") {
    switch (options.caseTransform) {
      case "camelcase":
        result = toCamelCase(result);
        break;
      case "pascalcase":
        result = toPascalCase(result);
        break;
      case "kebabcase":
        result = toKebabCase(result);
        break;
      case "snakecase":
        result = toSnakeCase(result);
        break;
      case "constantcase":
        result = toConstantCase(result);
        break;
      case "uppercase":
        result = toUppercase(result);
        break;
      case "lowercase":
        result = toLowercase(result);
        break;
      case "titlecase":
        result = toTitleCase(result);
        break;
      case "sentencecase":
        result = toSentenceCase(result);
        break;
    }
  }

  // 3. Line operations (deduplication and sorting while line structures exist)
  if (options.removeDuplicateLines) {
    result = removeDuplicateLines(result);
  }

  if (options.sortLines && options.sortLines !== "none") {
    result = sortLines(result, options.sortLines);
  }

  // 4. Remove punctuation / special characters
  if (options.removeSpecialChars) {
    result = removeSpecialCharacters(result, {
      keepWhitespace: options.spaceHandling !== "removeAll",
      keepNumbers: !options.removeNumbers,
    });
  } else if (options.removePunctuation) {
    result = removePunctuation(result);
  }

  // Clean any trailing/duplicate delimiters for delimiter-based case transforms
  if (options.caseTransform === "kebabcase") {
    result = result.replace(/-+/g, "-").replace(/^-|-$/g, "");
  } else if (options.caseTransform === "snakecase" || options.caseTransform === "constantcase") {
    result = result.replace(/_+/g, "_").replace(/^_+|_+$/g, "");
  }

  // 5. Space handling (remove all spaces, collapse multiple spaces, or line trimming)
  if (options.spaceHandling === "removeAll") {
    result = removeAllSpaces(result);
  } else if (options.spaceHandling === "collapse") {
    result = cleanWhitespace(result, {
      collapseSpaces: true,
      trimLines: Boolean(options.trimLines),
      removeBlankLines: Boolean(options.removeBlankLines),
      collapseBlankLines: Boolean(options.collapseBlankLines),
    });
  } else if (options.trimLines || options.removeBlankLines || options.collapseBlankLines) {
    result = cleanWhitespace(result, {
      collapseSpaces: false,
      trimLines: Boolean(options.trimLines),
      removeBlankLines: Boolean(options.removeBlankLines),
      collapseBlankLines: Boolean(options.collapseBlankLines),
    });
  }

  // 6. Reversals
  if (options.reverseLines) {
    result = reverseLines(result);
  }

  if (options.reverseText) {
    result = reverseText(result);
  }

  return result;
}
