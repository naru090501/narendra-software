import { PRODUCT_STATUS_META } from "@narendra/core";
import type { ProductStatus } from "@narendra/types";
import { Badge } from "@narendra/ui";

const TONE_TO_VARIANT = {
  emerald: "emerald",
  amber: "amber",
  sky: "sky",
  slate: "slate",
  neutral: "default",
} as const;

export function StatusBadge({ status }: { status: ProductStatus }) {
  const meta = PRODUCT_STATUS_META[status];
  const variant = TONE_TO_VARIANT[meta.tone];

  return (
    <Badge variant={variant} title={meta.description} className="min-h-7 px-3 py-1 text-xs">
      <span
        className="h-2 w-2 rounded-full bg-current opacity-90"
        aria-hidden="true"
      />
      <span>{meta.label}</span>
    </Badge>
  );
}
