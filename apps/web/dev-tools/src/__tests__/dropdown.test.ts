import { describe, expect, it } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Select } from "@narendra/ui";

describe("Select & Dropdown production verification", () => {
  it("renders with appearance-none inline reset, generous spacing, and single ChevronDown icon", () => {
    const html = renderToStaticMarkup(
      React.createElement(
        Select,
        {
          "aria-label": "Indentation",
          defaultValue: "2",
        },
        React.createElement("option", { value: "2" }, "2 spaces"),
        React.createElement("option", { value: "4" }, "4 spaces"),
        React.createElement("option", { value: "\t" }, "Tab"),
      ),
    );

    // 1. Must contain native select with appearance resets
    expect(html).toContain("<select");
    expect(html).toContain("-webkit-appearance:none");
    expect(html).toContain("appearance:none");

    // 2. Must contain generous left padding and right padding to prevent text overlap
    expect(html).toContain("pl-3.5");
    expect(html).toContain("pr-9");
    expect(html).toContain("h-9");
    expect(html).toContain("min-w-[7.5rem]");

    // 3. Must contain exactly ONE svg icon (Lucide ChevronDown)
    const svgMatches = html.match(/<svg/g);
    expect(svgMatches).toHaveLength(1);

    // 4. Must NOT contain polygon/triangle or multiple arrows
    expect(html).not.toContain("<polygon");
    expect(html).not.toContain("&#x25BC;"); // no ▼ triangle
    expect(html).not.toContain("&#9660;"); // no black down-pointing triangle

    // 5. Must contain lucide chevron-down svg path
    expect(html).toContain("lucide-chevron-down");
  });

  it("verifies accessibility attributes on select controls", () => {
    const html = renderToStaticMarkup(
      React.createElement(
        Select,
        {
          id: "toolbox-select-test",
          "aria-label": "CSV delimiter",
          name: "delimiter",
          defaultValue: ",",
        },
        React.createElement("option", { value: "," }, "Comma (,)"),
        React.createElement("option", { value: ";" }, "Semicolon (;)"),
      ),
    );

    expect(html).toContain('id="toolbox-select-test"');
    expect(html).toContain('aria-label="CSV delimiter"');
    expect(html).toContain('aria-hidden="true"'); // icon is hidden from assistive tech
  });

  it("renders consistently with containerClassName across responsive layouts (320px, 375px, 768px, desktop)", () => {
    // 320px ultra-compact mobile viewport representation (w-full container)
    const mobile320Html = renderToStaticMarkup(
      React.createElement(
        Select,
        {
          containerClassName: "w-full max-w-[320px]",
          className: "w-full h-9 text-xs",
          "aria-label": "Indentation at 320px",
        },
        React.createElement("option", { value: "2" }, "2 spaces"),
      ),
    );
    expect(mobile320Html).toContain("w-full");
    expect(mobile320Html).toContain("padding-left:0.875rem");
    expect(mobile320Html).toContain("padding-right:2.25rem");
    expect(mobile320Html).toContain("pr-9");

    // 375px standard mobile viewport representation
    const mobile375Html = renderToStaticMarkup(
      React.createElement(
        Select,
        {
          containerClassName: "w-full sm:w-auto",
          className: "w-full sm:w-auto h-9 text-xs",
          "aria-label": "Indentation at 375px",
        },
        React.createElement("option", { value: "2" }, "2 spaces"),
      ),
    );
    expect(mobile375Html).toContain("sm:w-auto");
    expect(mobile375Html).toContain("padding-left:0.875rem");

    // 768px tablet toolbar representation
    const tablet768Html = renderToStaticMarkup(
      React.createElement(
        Select,
        {
          containerClassName: "inline-flex md:w-auto",
          className: "min-w-[7.5rem] h-9 text-xs",
          "aria-label": "Indentation at 768px",
        },
        React.createElement("option", { value: "4" }, "4 spaces"),
      ),
    );
    expect(tablet768Html).toContain("min-w-[7.5rem]");
    expect(tablet768Html).toContain("h-9");

    // Desktop toolbar representation (inline comfortable)
    const desktopHtml = renderToStaticMarkup(
      React.createElement(
        Select,
        {
          "aria-label": "Indentation",
        },
        React.createElement("option", { value: "2" }, "2 spaces"),
      ),
    );
    expect(desktopHtml).toContain("h-9");
    expect(desktopHtml).toContain("pr-9");
    expect(desktopHtml).toContain("pl-3.5");
    expect(desktopHtml).toContain("min-w-[7.5rem]");
  });

  it("verifies focus ring, keyboard navigation attributes, and disabled states", () => {
    // Enabled interactive select with keyboard focus classes
    const enabledHtml = renderToStaticMarkup(
      React.createElement(
        Select,
        {
          id: "keyboard-focus-select",
          "aria-label": "Focusable select",
          defaultValue: "1",
        },
        React.createElement("option", { value: "1" }, "Option 1"),
      ),
    );
    expect(enabledHtml).toContain("focus-visible:ring-2");
    expect(enabledHtml).toContain("focus-visible:ring-ring");
    expect(enabledHtml).toContain("focus-visible:ring-offset-1");
    expect(enabledHtml).toContain("cursor-pointer");
    expect(enabledHtml).not.toContain('disabled=""');

    // Disabled select state
    const disabledHtml = renderToStaticMarkup(
      React.createElement(
        Select,
        {
          id: "disabled-select",
          "aria-label": "Disabled select",
          disabled: true,
          defaultValue: "disabled-val",
        },
        React.createElement("option", { value: "disabled-val" }, "Disabled Option"),
      ),
    );
    expect(disabledHtml).toContain('disabled=""');
    expect(disabledHtml).toContain("disabled:cursor-not-allowed");
    expect(disabledHtml).toContain("disabled:opacity-50");
  });
});
