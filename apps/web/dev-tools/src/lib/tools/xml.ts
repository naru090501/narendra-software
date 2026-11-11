export interface XmlSuccessResult {
  ok: true;
  output: string;
  rootTagName: string;
  nodeCount: number;
}

export interface XmlErrorResult {
  ok: false;
  error: string;
}

export type XmlProcessResult = XmlSuccessResult | XmlErrorResult;

function escapeXmlText(text: string): string {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function escapeXmlAttr(value: string): string {
  return escapeXmlText(value)
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function extractXmlDeclaration(input: string): string | null {
  const match = /^\s*(<\?xml\s+[^?]*\?>)/i.exec(input);
  return match?.[1] ?? null;
}

function extractParserErrorMessage(doc: Document): string | null {
  const parserErrors = doc.getElementsByTagName("parsererror");
  if (parserErrors.length > 0) {
    const rawText = parserErrors[0]?.textContent?.trim() ?? "";
    const cleaned = rawText
      .replace(/This page contains the following errors:/i, "")
      .replace(/Below is a rendering of the page up to the first error\./i, "")
      .replace(/\s+/g, " ")
      .trim();
    return cleaned.length > 0
      ? `Malformed XML: ${cleaned}`
      : "Malformed XML document.";
  }

  if (!doc.documentElement) {
    return "Malformed XML: No root element found.";
  }

  return null;
}

function parseXmlDocument(input: string):
  | { ok: true; doc: Document; declaration: string | null }
  | XmlErrorResult {
  if (input.trim().length === 0) {
    return {
      ok: false,
      error: "Input is empty. Paste an XML document to format, minify, or validate.",
    };
  }

  if (typeof DOMParser === "undefined") {
    return {
      ok: false,
      error: "Browser-native DOMParser is unavailable in this environment.",
    };
  }

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(input, "application/xml");
    const errorMessage = extractParserErrorMessage(doc);
    if (errorMessage) {
      return { ok: false, error: errorMessage };
    }

    return {
      ok: true,
      doc,
      declaration: extractXmlDeclaration(input),
    };
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error
          ? `Malformed XML: ${error.message}`
          : "Malformed XML document.",
    };
  }
}

function serializeAttributes(element: Element): string {
  if (element.attributes.length === 0) {
    return "";
  }
  const attrs: string[] = [];
  for (let i = 0; i < element.attributes.length; i += 1) {
    const attr = element.attributes[i];
    if (attr) {
      attrs.push(`${attr.name}="${escapeXmlAttr(attr.value)}"`);
    }
  }
  return attrs.length > 0 ? ` ${attrs.join(" ")}` : "";
}

function serializeFormattedNode(
  node: Node,
  depth: number,
  indentUnit: string,
): string {
  const indent = indentUnit.repeat(depth);

  switch (node.nodeType) {
    case 1: {
      // ELEMENT_NODE
      const element = node as Element;
      const attrs = serializeAttributes(element);
      const meaningfulChildren = Array.from(element.childNodes).filter(
        (child) =>
          !(
            child.nodeType === 3 &&
            (child.textContent ?? "").trim().length === 0
          ),
      );

      if (meaningfulChildren.length === 0) {
        return `${indent}<${element.tagName}${attrs} />`;
      }

      if (
        meaningfulChildren.length === 1 &&
        (meaningfulChildren[0]?.nodeType === 3 ||
          meaningfulChildren[0]?.nodeType === 4)
      ) {
        const onlyChild = meaningfulChildren[0];
        const inner =
          onlyChild.nodeType === 4
            ? `<![CDATA[${onlyChild.textContent ?? ""}]]>`
            : escapeXmlText((onlyChild.textContent ?? "").trim());
        return `${indent}<${element.tagName}${attrs}>${inner}</${element.tagName}>`;
      }

      const renderedChildren = meaningfulChildren
        .map((child) => serializeFormattedNode(child, depth + 1, indentUnit))
        .join("\n");
      return `${indent}<${element.tagName}${attrs}>\n${renderedChildren}\n${indent}</${element.tagName}>`;
    }
    case 3: {
      // TEXT_NODE
      const trimmed = (node.textContent ?? "").trim();
      return trimmed.length > 0 ? `${indent}${escapeXmlText(trimmed)}` : "";
    }
    case 4: {
      // CDATA_SECTION_NODE
      return `${indent}<![CDATA[${node.textContent ?? ""}]]>`;
    }
    case 7: {
      // PROCESSING_INSTRUCTION_NODE
      const pi = node as ProcessingInstruction;
      return `${indent}<?${pi.target} ${pi.data}?>`;
    }
    case 8: {
      // COMMENT_NODE
      return `${indent}<!--${node.textContent ?? ""}-->`;
    }
    default:
      return "";
  }
}

function serializeMinifiedNode(node: Node): string {
  switch (node.nodeType) {
    case 1: {
      const element = node as Element;
      const attrs = serializeAttributes(element);
      const meaningfulChildren = Array.from(element.childNodes).filter(
        (child) =>
          !(
            child.nodeType === 3 &&
            (child.textContent ?? "").trim().length === 0
          ),
      );
      if (meaningfulChildren.length === 0) {
        return `<${element.tagName}${attrs}/>`;
      }
      const inner = meaningfulChildren.map(serializeMinifiedNode).join("");
      return `<${element.tagName}${attrs}>${inner}</${element.tagName}>`;
    }
    case 3:
      return escapeXmlText((node.textContent ?? "").trim());
    case 4:
      return `<![CDATA[${node.textContent ?? ""}]]>`;
    case 7: {
      const pi = node as ProcessingInstruction;
      return `<?${pi.target} ${pi.data}?>`;
    }
    case 8:
      return `<!--${node.textContent ?? ""}-->`;
    default:
      return "";
  }
}

function countElements(root: Element): number {
  return 1 + root.getElementsByTagName("*").length;
}

export function formatXml(
  input: string,
  indentSize: 2 | 4 = 2,
): XmlProcessResult {
  const parsed = parseXmlDocument(input);
  if (!parsed.ok) {
    return parsed;
  }

  const indentUnit = " ".repeat(indentSize);
  const topNodes = Array.from(parsed.doc.childNodes)
    .map((node) => serializeFormattedNode(node, 0, indentUnit))
    .filter((line) => line.length > 0);

  const body = topNodes.join("\n");
  const output = parsed.declaration ? `${parsed.declaration}\n${body}` : body;

  return {
    ok: true,
    output,
    rootTagName: parsed.doc.documentElement.tagName,
    nodeCount: countElements(parsed.doc.documentElement),
  };
}

export function minifyXml(input: string): XmlProcessResult {
  const parsed = parseXmlDocument(input);
  if (!parsed.ok) {
    return parsed;
  }

  const body = Array.from(parsed.doc.childNodes)
    .map(serializeMinifiedNode)
    .join("");
  const output = parsed.declaration ? `${parsed.declaration}${body}` : body;

  return {
    ok: true,
    output,
    rootTagName: parsed.doc.documentElement.tagName,
    nodeCount: countElements(parsed.doc.documentElement),
  };
}

export function validateXml(input: string): XmlProcessResult {
  return formatXml(input, 2);
}
