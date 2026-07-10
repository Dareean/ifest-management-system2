import { type HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-3 py-1 caption font-medium",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-on-primary",
        secondary: "border-transparent bg-surface-container text-on-surface",
        outline: "border-outline text-on-surface-variant",
        success: "border-transparent bg-block-mint text-on-surface",
        warning: "border-transparent bg-block-lime text-on-surface",
        danger: "border-transparent bg-error-container text-on-error-container",
        info: "border-transparent bg-block-lilac text-on-surface",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
