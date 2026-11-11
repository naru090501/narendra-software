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
      expect(formatted.rootTagName).toBe("root");
      expect(formatted.output).toContain('<?xml version="1.0" encoding="UTF-8"?>');
      expect(formatted.output).toContain('  <item id="1">Hello</item>');
      expect(formatted.output).toContain("  <empty />");
    }

    const minified = minifyXml(raw);
    expect(minified.ok).toBe(true);
    if (minified.ok) {
      expect(minified.output).toBe(
        '<?xml version="1.0" encoding="UTF-8"?><root><item id="1">Hello</item><empty/></root>',
      );
    }
  });

  it("rejects malformed XML with understandable error messages", () => {
    const unclosed = validateXml("<root><child>text</root>");
    expect(unclosed.ok).toBe(false);
    if (!unclosed.ok) {
      expect(unclosed.error).toMatch(/Malformed XML/i);
    }

    const empty = validateXml("");
    expect(empty.ok).toBe(false);
  });
});

describe("CSV Converter", () => {
  it("parses quoted fields, commas, escaped quotes, and multiline fields", () => {
    const csv = [
      "name,company,notes",
      '"Aarav","Narendra, Inc.","Line 1\nLine ""2"" here"',
      '"Meera","Labs","Simple note"',
    ].join("\n");

    const result = csvToJson(csv, { hasHeader: true });
    expect(result.ok).toBe(true);
    if (result.ok) {
      const parsed = JSON.parse(result.output) as Array<Record<string, string>>;
      expect(parsed).toHaveLength(2);
      expect(parsed[0]).toEqual({
        name: "Aarav",
        company: "Narendra, Inc.",
        notes: 'Line 1\nLine "2" here',
      });
    }
  });

  it("generates RFC 4180 CSV from JSON arrays with proper escaping", () => {
    const json = JSON.stringify([
      {
        product: "Dev Tools",
        summary: 'Has "quotes", commas, and\nnewlines',
      },
    ]);

    const csvResult = jsonToCsv(json);
    expect(csvResult.ok).toBe(true);
    if (csvResult.ok) {
      expect(csvResult.output).toBe(
        'product,summary\nDev Tools,"Has ""quotes"", commas, and\nnewlines"',
      );

      // Round-trip back to JSON
      const roundTrip = csvToJson(csvResult.output);
      expect(roundTrip.ok).toBe(true);
      if (roundTrip.ok) {
        expect(JSON.parse(roundTrip.output)).toEqual(JSON.parse(json));
      }
    }
  });

  it("reports malformed CSV inputs clearly", () => {
    const unclosedQuote = csvToJson('a,b\n"unclosed,2');
    expect(unclosedQuote.ok).toBe(false);
    if (!unclosedQuote.ok) {
      expect(unclosedQuote.error).toMatch(/unclosed quoted field/i);
    }

    const columnMismatch = csvToJson("a,b\n1,2,3");
    expect(columnMismatch.ok).toBe(false);
    if (!columnMismatch.ok) {
      expect(columnMismatch.error).toMatch(/expected 2/i);
    }
  });
});

describe("Base64 Encoder / Decoder", () => {
  it("encodes and decodes UTF-8 and Unicode strings accurately", () => {
    const sample = "Narendra Software 🚀 नमस्ते café";
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

  it("supports URL-safe Base64 and rejects invalid Base64", () => {
    const sample = "subjects?_d=1&x=🚀";
    const encoded = encodeBase64(sample, { urlSafe: true });
    expect(encoded.ok).toBe(true);
    if (encoded.ok) {
      expect(encoded.output).not.toMatch(/[+/=]/);
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

  it("filters tools by keyword search", () => {
    expect(filterTools("unicode")).toHaveLength(1);
    expect(filterTools("unicode")[0]?.id).toBe("base64");
    expect(filterTools("")).toHaveLength(5);
  });
});
