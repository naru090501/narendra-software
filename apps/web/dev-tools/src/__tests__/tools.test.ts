import { describe, expect, it } from "vitest";
import {
  JSON_LARGE_THRESHOLD_BYTES,
  analyzeText,
  cleanWhitespace,
  csvToJson,
  decodeBase64,
  encodeBase64,
  filterTools,
  formatJson,
  formatXml,
  jsonToCsv,
  minifyJson,
  minifyXml,
  removeAllSpaces,
  removeSpecialCharacters,
  toCamelCase,
  toKebabCase,
  toLowercase,
  toPascalCase,
  toSentenceCase,
  toSnakeCase,
  toTitleCase,
  toUppercase,
  transformText,
  validateJson,
  validateXml,
} from "../lib/tools";

describe("JSON Formatter", () => {
  it("formats and minifies valid JSON", () => {
    const formatted = formatJson('{"a":1,"b":[2,3]}', 2);
    expect(formatted.ok).toBe(true);
    if (formatted.ok) {
      expect(formatted.output).toBe('{\n  "a": 1,\n  "b": [\n    2,\n    3\n  ]\n}');
      expect(formatted.stats.lines).toBe(7);
    }

    const minified = minifyJson('{\n  "a": 1,\n  "b": [2, 3]\n}');
    expect(minified.ok).toBe(true);
    if (minified.ok) {
      expect(minified.output).toBe('{"a":1,"b":[2,3]}');
    }
  });

  it("reports clear errors for empty or malformed JSON", () => {
    const empty = validateJson("   ");
    expect(empty.ok).toBe(false);

    const invalid = validateJson('{"a": 1,\n  "b": }');
    expect(invalid.ok).toBe(false);
    if (!invalid.ok) {
      expect(invalid.error.length).toBeGreaterThan(0);
    }
  });

  it("flags large payloads gracefully", () => {
    const largeValue = "x".repeat(JSON_LARGE_THRESHOLD_BYTES);
    const result = formatJson(JSON.stringify({ payload: largeValue }), 2);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.stats.isLargeInput).toBe(true);
    }
  });
});

describe("XML Formatter", () => {
  it("formats and minifies valid XML using DOMParser", () => {
    const raw =
      '<?xml version="1.0" encoding="UTF-8"?><root><item id="1">Hello</item><empty/></root>';
    const formatted = formatXml(raw, 2);
    expect(formatted.ok).toBe(true);
    if (formatted.ok) {
      expect(formatted.output).toContain("<root>\n  <item");
      expect(formatted.output).toContain("<empty />");
    }

    const minified = minifyXml(raw);
    expect(minified.ok).toBe(true);
    if (minified.ok) {
      expect(minified.output).not.toContain("\n  ");
    }
  });

  it("reports errors on malformed XML", () => {
    const result = validateXml("<root><unclosed></root>");
    expect(result.ok).toBe(false);
  });
});

describe("CSV Converter", () => {
  it("converts CSV to JSON handling commas inside quotes", () => {
    const csv = 'name,city,notes\n"Sharma, Aarav","Mumbai","Likes local-first tools"';
    const result = csvToJson(csv, { delimiter: "," });
    expect(result.ok).toBe(true);
    if (result.ok) {
      const parsed = JSON.parse(result.output);
      expect(parsed).toHaveLength(1);
      expect(parsed[0].name).toBe("Sharma, Aarav");
      expect(parsed[0].city).toBe("Mumbai");
    }
  });

  it("converts JSON to CSV quoting strings that contain delimiters", () => {
    const data = [
      { id: 1, label: "Item 1, special", active: true },
      { id: 2, label: 'Quotes "inside"', active: false },
    ];
    const result = jsonToCsv(JSON.stringify(data), ",");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.output).toContain('"Item 1, special"');
      expect(result.output).toContain('"Quotes ""inside"""');
    }
  });

  it("rejects non-array JSON for CSV export", () => {
    const result = jsonToCsv('{"single": "object"}');
    expect(result.ok).toBe(false);
  });
});

describe("Base64 Encoder / Decoder", () => {
  it("encodes and decodes UTF-8 strings predictably", () => {
    const sample = "Narendra Software — 2026 🇮🇳";
    const encoded = encodeBase64(sample);
    expect(encoded.ok).toBe(true);
    if (encoded.ok) {
      const decoded = decodeBase64(encoded.output);
      expect(decoded.ok).toBe(true);
      if (decoded.ok) {
        expect(decoded.output).toBe(sample);
      }
    }
  });

  it("supports URL-safe Base64 without + or / or padding", () => {
    const sample = "test+data/with?special=chars";
    const encoded = encodeBase64(sample, { urlSafe: true });
    expect(encoded.ok).toBe(true);
    if (encoded.ok) {
      expect(encoded.output).not.toContain("+");
      expect(encoded.output).not.toContain("/");
      expect(encoded.output).not.toContain("=");
      const decoded = decodeBase64(encoded.output, { urlSafe: true });
      expect(decoded.ok).toBe(true);
      if (decoded.ok) {
        expect(decoded.output).toBe(sample);
      }
    }

    const badChars = decodeBase64("not@valid!base64");
    expect(badChars.ok).toBe(false);

    const badLength = decodeBase64("abcde");
    expect(badLength.ok).toBe(false);

    // Invalid UTF-8 byte sequence (0xFF encoded as /w==)
    const invalidUtf8 = decodeBase64("/w==");
    expect(invalidUtf8.ok).toBe(false);
  });
});

describe("Text Utilities", () => {
  it("computes character, code point, word, line, and byte metrics", () => {
    const stats = analyzeText("Hello 🚀\nWorld  test");
    expect(stats.words).toBe(4);
    expect(stats.lines).toBe(2);
    expect(stats.nonEmptyLines).toBe(2);
    expect(stats.codePoints).toBe(19);
    expect(stats.characters).toBe(20); // surrogate pair for 🚀
    expect(stats.charactersNoSpaces).toBe(15);
    expect(stats.bytes).toBeGreaterThan(20);

    const empty = analyzeText("");
    expect(empty.words).toBe(0);
    expect(empty.lines).toBe(0);
  });

  it("cleans whitespace predictably", () => {
    const messy = "  alpha   beta  \r\n\r\n\r\n  gamma\t\tdelta  ";
    const cleaned = cleanWhitespace(messy, {
      trimLines: true,
      collapseSpaces: true,
      collapseBlankLines: true,
    });
    expect(cleaned).toBe("alpha beta\n\ngamma delta");

    const noBlankLines = cleanWhitespace(messy, {
      trimLines: true,
      collapseSpaces: true,
      removeBlankLines: true,
    });
    expect(noBlankLines).toBe("alpha beta\ngamma delta");
  });

  it("executes case transformations", () => {
    expect(toUppercase("hello world")).toBe("HELLO WORLD");
    expect(toLowercase("HELLO WORLD")).toBe("hello world");
    expect(toTitleCase("narendra software developer toolbox")).toBe(
      "Narendra Software Developer Toolbox",
    );
    expect(toSentenceCase("hello world! how are you? fine.")).toBe(
      "Hello world! How are you? Fine.",
    );
    expect(toCamelCase("hello-world_test case")).toBe("helloWorldTestCase");
    expect(toPascalCase("hello-world_test case")).toBe("HelloWorldTestCase");
    expect(toKebabCase("Hello World TestCase")).toBe("hello-world-test-case");
    expect(toSnakeCase("Hello World TestCase")).toBe("hello_world_test_case");
  });

  it("removes special characters and whitespace", () => {
    expect(removeSpecialCharacters("Hello, @World #123!")).toBe("Hello World 123");
    expect(removeAllSpaces("  hello   world  \n test  ")).toBe("helloworldtest");
  });

  it("executes multi-task combined pipeline at the same time", () => {
    // User requirement: remove special characters + remove spaces + uppercase at the same time!
    const input = "  Hello,   @World! #123  ";
    const result = transformText(input, {
      removeSpecialChars: true,
      spaceHandling: "removeAll",
      caseTransform: "uppercase",
    });
    expect(result).toBe("HELLOWORLD123");

    // Combine remove special characters + camelCase
    const camelResult = transformText("user name @profile#id!", {
      removeSpecialChars: true,
      caseTransform: "camelcase",
    });
    expect(camelResult).toBe("userNameProfileId");

    // User requirement: Title case (capitalization) + remove special characters + remove all spaces at the same time
    const titleResult = transformText("hello @world! how are you?", {
      removeSpecialChars: true,
      spaceHandling: "removeAll",
      caseTransform: "titlecase",
    });
    expect(titleResult).toBe("HelloWorldHowAreYou");

    // User requirement: Sentence case + remove special characters + collapse spaces at the same time
    const sentenceResult = transformText("hello world! how are you? fine.", {
      removeSpecialChars: true,
      spaceHandling: "collapse",
      caseTransform: "sentencecase",
    });
    expect(sentenceResult).toBe("Hello world How are you Fine");

    // Line operations: deduplication + sorting (asc) + Uppercase
    const multilineInput = "zebra\napple\nzebra\nbanana\napple";
    const lineOpResult = transformText(multilineInput, {
      caseTransform: "uppercase",
      removeDuplicateLines: true,
      sortLines: "asc",
    });
    expect(lineOpResult).toBe("APPLE\nBANANA\nZEBRA");

    // Line sorting (desc) + Sentence case
    const descSorted = transformText("orange fruit\napple fruit\ngrape fruit", {
      caseTransform: "sentencecase",
      sortLines: "desc",
    });
    expect(descSorted).toBe("Orange fruit\nGrape fruit\nApple fruit");

    // Numbers removal + Punctuation removal + Whitespace collapsing + Title Case
    const cleanNumbersPunct = transformText("123 hello, 456 world! 789 testing...", {
      removeNumbers: true,
      removePunctuation: true,
      spaceHandling: "collapse",
      caseTransform: "titlecase",
    });
    expect(cleanNumbersPunct).toBe("Hello World Testing");

    // PascalCase + special characters + numbers removal
    const pascalResult = transformText("api_v2_user-account#99", {
      removeNumbers: true,
      removeSpecialChars: true,
      caseTransform: "pascalcase",
    });
    expect(pascalResult).toBe("ApiVUserAccount");

    // Kebab-case + numbers removal
    const kebabResult = transformText("My New Product 2026", {
      removeNumbers: true,
      caseTransform: "kebabcase",
    });
    expect(kebabResult).toBe("my-new-product");

    // CONSTANT_CASE + numbers removal
    const constantResult = transformText("database connection pool 5", {
      removeNumbers: true,
      caseTransform: "constantcase",
    });
    expect(constantResult).toBe("DATABASE_CONNECTION_POOL");

    // Reversal combinations: reverse text + remove all spaces + uppercase
    const reversedResult = transformText("hello world", {
      caseTransform: "uppercase",
      spaceHandling: "removeAll",
      reverseText: true,
    });
    expect(reversedResult).toBe("DLROWOLLEH");

    // Reverse lines + Title Case
    const reversedLinesResult = transformText("first line\nsecond line", {
      caseTransform: "titlecase",
      reverseLines: true,
    });
    expect(reversedLinesResult).toBe("Second Line\nFirst Line");
  });

  it("filters tools by keyword search", () => {
    expect(filterTools("unicode")).toHaveLength(1);
    expect(filterTools("unicode")[0]?.id).toBe("base64");
    expect(filterTools("")).toHaveLength(5);
  });
});
