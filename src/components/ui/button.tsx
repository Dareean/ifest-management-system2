import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-sans text-sm font-bold leading-none transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50 select-none group",
  {
    variants: {
      variant: {
        primary: "bg-[#04000D] text-white hover:bg-[#FF3D8B] hover:text-white shadow-sm",
        secondary: "bg-surface-container text-on-surface hover:bg-[#04000D] hover:text-white",
        outline: "border border-[#04000D]/15 bg-white text-on-surface hover:bg-[#04000D] hover:text-white hover:border-[#04000D]",
        ghost: "text-on-surface hover:bg-[#04000D]/5",
        danger: "bg-error text-on-error hover:bg-red-700",
      },
      size: {
        sm: "h-9 px-4 text-xs",
        md: "h-11 px-6 text-sm",
        lg: "h-14 px-8 text-base",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
