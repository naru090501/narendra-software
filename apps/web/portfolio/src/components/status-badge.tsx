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
    <Badge variant={variant} title={meta.description}>
      <span
        className="h-1.5 w-1.5 rounded-full bg-current opacity-85"
        aria-hidden="true"
      />
      {meta.label}
    </Badge>
  );
}
