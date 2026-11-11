import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/utils.js";

export const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium tracking-tight transition-colors",
  {
    variants: {
      variant: {
        default: "border-border bg-muted text-foreground",
        navy: "border-primary/25 bg-primary/10 text-primary dark:border-sky-400/25 dark:bg-sky-400/10 dark:text-sky-300",
        emerald:
          "border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
        amber:
          "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
        sky: "border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300",
        slate:
          "border-slate-500/25 bg-slate-500/10 text-slate-700 dark:text-slate-300",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}
