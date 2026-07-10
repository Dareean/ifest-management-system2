import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-sans text-lg font-medium leading-none transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-primary text-on-primary hover:bg-accent-magenta",
        secondary: "bg-surface-container text-on-surface hover:bg-surface-container-high",
        outline: "border border-primary text-primary bg-transparent hover:bg-primary hover:text-on-primary",
        ghost: "text-on-surface hover:bg-surface-container",
        danger: "bg-error text-on-error hover:bg-on-error-container",
      },
      size: {
        sm: "h-9 px-4 text-sm",
        md: "h-11 px-6 text-lg",
        lg: "h-13 px-8 text-xl",
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
