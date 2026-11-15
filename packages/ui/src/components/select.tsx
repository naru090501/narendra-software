import * as React from "react";
import { cn } from "../lib/utils.js";

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  containerClassName?: string;
  iconClassName?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      className,
      containerClassName,
      iconClassName,
      children,
      ...props
    },
    ref,
  ) => {
    return (
      <div
        className={cn(
          "relative inline-flex items-center",
          containerClassName,
        )}
      >
        <select
          ref={ref}
          className={cn(
            "h-8 appearance-none rounded-lg border border-border bg-background pl-2.5 pr-7 py-1 text-xs font-medium text-foreground leading-normal transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",
            className,
          )}
          {...props}
        >
          {children}
        </select>
        <svg
          className={cn(
            "pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground opacity-75",
            iconClassName,
          )}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </div>
    );
  },
);
Select.displayName = "Select";
