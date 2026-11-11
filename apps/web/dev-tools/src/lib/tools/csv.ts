export interface CsvConvertSuccess {
  ok: true;
  output: string;
  rowCount: number;
  columnCount: number;
}

export interface CsvConvertError {
  ok: false;
  error: string;
}

export type CsvConvertResult = CsvConvertSuccess | CsvConvertError;

export interface CsvParseOptions {
  delimiter?: "," | ";" | "\t";
  hasHeader?: boolean;
}

interface ParsedCsvRows {
  ok: true;
  rows: string[][];
}

export function parseCsvRows(
  input: string,
  delimiter: "," | ";" | "\t" = ",",
): ParsedCsvRows | CsvConvertError {
  if (input.trim().length === 0) {
    return {
      ok: false,
      error: "Input is empty. Paste CSV rows to convert.",
    };
  }

  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = "";
  let inQuotes = false;
  let fieldStarted = false;
  let justClosedQuote = false;
  let lineNumber = 1;
  let quoteOpenLine = 1;

  for (let i = 0; i < input.length; i += 1) {
    const ch = input[i]!;

    if (inQuotes) {
      if (ch === '"') {
        const next = input[i + 1];
        if (next === '"') {
          currentField += '"';
          i += 1;
        } else {
          inQuotes = false;
          justClosedQuote = true;
        }
      } else {
        if (ch === "\n") {
          lineNumber += 1;
        } else if (ch === "\r" && input[i + 1] === "\n") {
          currentField += "\n";
          lineNumber += 1;
          i += 1;
          continue;
        }
        currentField += ch;
      }
      continue;
    }

    if (justClosedQuote) {
      if (ch === delimiter) {
        currentRow.push(currentField);
        currentField = "";
        fieldStarted = false;
        justClosedQuote = false;
        continue;
      }
      if (ch === "\r" || ch === "\n") {
        if (ch === "\r" && input[i + 1] === "\n") {
          i += 1;
        }
        currentRow.push(currentField);
        rows.push(currentRow);
        currentRow = [];
        currentField = "";
        fieldStarted = false;
        justClosedQuote = false;
        lineNumber += 1;
        continue;
      }
      return {
        ok: false,
        error: `Malformed CSV near line ${lineNumber}: unexpected character "${ch}" after closing quote.`,
      };
    }

    if (ch === '"') {
      if (!fieldStarted && currentField.length === 0) {
        inQuotes = true;
        fieldStarted = true;
        quoteOpenLine = lineNumber;
      } else {
        return {
          ok: false,
          error: `Malformed CSV near line ${lineNumber}: unescaped quote inside unquoted field.`,
        };
      }
      continue;
    }

    if (ch === delimiter) {
      currentRow.push(currentField);
      currentField = "";
      fieldStarted = false;
      continue;
    }

    if (ch === "\r" || ch === "\n") {
      if (ch === "\r" && input[i + 1] === "\n") {
        i += 1;
      }
      // Skip trailing blank line at EOF without producing a phantom empty row
      if (currentRow.length > 0 || currentField.length > 0 || fieldStarted) {
        currentRow.push(currentField);
        rows.push(currentRow);
      }
      currentRow = [];
      currentField = "";
      fieldStarted = false;
      lineNumber += 1;
      continue;
    }

    currentField += ch;
    fieldStarted = true;
  }

  if (inQuotes) {
    return {
      ok: false,
      error: `Malformed CSV: unclosed quoted field starting on line ${quoteOpenLine}.`,
    };
  }

  if (currentRow.length > 0 || currentField.length > 0 || fieldStarted) {
    currentRow.push(currentField);
    rows.push(currentRow);
  }

  if (rows.length === 0) {
    return {
      ok: false,
      error: "No CSV rows found.",
    };
  }

  return { ok: true, rows };
}

export function csvToJson(
  input: string,
  options: CsvParseOptions = {},
): CsvConvertResult {
  const delimiter = options.delimiter ?? ",";
  const hasHeader = options.hasHeader ?? true;

  const parsed = parseCsvRows(input, delimiter);
  if (!parsed.ok) {
    return parsed;
  }

  const { rows } = parsed;

  if (!hasHeader) {
    const maxCols = rows.reduce((max, row) => Math.max(max, row.length), 0);
    return {
      ok: true,
      output: JSON.stringify(rows, null, 2),
      rowCount: rows.length,
      columnCount: maxCols,
    };
  }

  const headerRow = rows[0];
  if (!headerRow || headerRow.length === 0) {
    return { ok: false, error: "CSV header row is empty." };
  }

  const normalizedHeaders = headerRow.map((header) => header.trim());
  if (normalizedHeaders.some((h) => h.length === 0)) {
    return {
      ok: false,
      error: "CSV header row contains an empty column name.",
    };
  }

  const seenHeaders = new Set<string>();
  for (const header of normalizedHeaders) {
    if (seenHeaders.has(header)) {
      return {
        ok: false,
        error: `Duplicate CSV header column "${header}". Rename duplicate headers or disable header mode.`,
      };
    }
    seenHeaders.add(header);
  }

  const dataRows = rows.slice(1);
  const objects: Record<string, string>[] = [];

  for (let rowIndex = 0; rowIndex < dataRows.length; rowIndex += 1) {
    const row = dataRows[rowIndex]!;
    if (row.length !== normalizedHeaders.length) {
      return {
        ok: false,
        error: `Row ${rowIndex + 2} has ${row.length} column(s), expected ${normalizedHeaders.length} to match the header.`,
      };
    }

    const record: Record<string, string> = {};
    for (let col = 0; col < normalizedHeaders.length; col += 1) {
      record[normalizedHeaders[col]!] = row[col] ?? "";
    }
    objects.push(record);
  }

  return {
    ok: true,
    output: JSON.stringify(objects, null, 2),
    rowCount: objects.length,
    columnCount: normalizedHeaders.length,
  };
}

function escapeCsvCell(value: unknown, delimiter: string): string {
  let str: string;
  if (value === null || value === undefined) {
    str = "";
  } else if (typeof value === "object") {
    str = JSON.stringify(value);
  } else {
    str = String(value);
  }

  if (
    str.includes(delimiter) ||
    str.includes('"') ||
    str.includes("\n") ||
    str.includes("\r")
  ) {
    return `"${str.replaceAll('"', '""')}"`;
  }

  return str;
}

export function jsonToCsv(
  input: string,
  delimiter: "," | ";" | "\t" = ",",
): CsvConvertResult {
  if (input.trim().length === 0) {
    return {
      ok: false,
      error: "Input is empty. Paste a JSON array of objects or arrays to convert to CSV.",
    };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(input);
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error
          ? `Invalid JSON input: ${error.message}`
          : "Invalid JSON input.",
    };
  }

  if (!Array.isArray(parsed)) {
    return {
      ok: false,
      error: "JSON input must be an array of objects or an array of row arrays.",
    };
  }

  if (parsed.length === 0) {
    return {
      ok: false,
      error: "JSON array is empty; provide at least one item to generate CSV.",
    };
  }

  if (Array.isArray(parsed[0])) {
    const csvLines = parsed.map((row, index) => {
      if (!Array.isArray(row)) {
        throw new Error(`Mixed row types at index ${index}.`);
      }
      return row.map((cell) => escapeCsvCell(cell, delimiter)).join(delimiter);
    });
    const maxCols = parsed.reduce(
      (max, row) => Math.max(max, Array.isArray(row) ? row.length : 0),
      0,
    );
    return {
      ok: true,
      output: csvLines.join("\n"),
      rowCount: parsed.length,
      columnCount: maxCols,
    };
  }

  const headers: string[] = [];
  const headerSet = new Set<string>();

  for (let i = 0; i < parsed.length; i += 1) {
    const item = parsed[i];
    if (typeof item !== "object" || item === null || Array.isArray(item)) {
      return {
        ok: false,
        error: `Item at index ${i} must be a JSON object when converting object arrays to CSV.`,
      };
    }
    for (const key of Object.keys(item)) {
      if (!headerSet.has(key)) {
        headerSet.add(key);
        headers.push(key);
      }
    }
  }

  if (headers.length === 0) {
    return {
      ok: false,
      error: "JSON objects contain no properties to serialize as CSV columns.",
    };
  }

  const lines: string[] = [
    headers.map((header) => escapeCsvCell(header, delimiter)).join(delimiter),
  ];

  for (const item of parsed as Record<string, unknown>[]) {
    const rowCells = headers.map((header) =>
      escapeCsvCell(item[header], delimiter),
    );
    lines.push(rowCells.join(delimiter));
  }

  return {
    ok: true,
    output: lines.join("\n"),
    rowCount: parsed.length,
    columnCount: headers.length,
  };
}
