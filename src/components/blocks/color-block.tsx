import { type HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const colorBlockVariants = cva(
  "rounded-xl p-xl",
  {
    variants: {
      color: {
        lime: "bg-block-lime",
        lilac: "bg-block-lilac",
        mint: "bg-block-mint",
        coral: "bg-block-coral",
        pink: "bg-block-pink",
        surface: "bg-surface-container",
      },
    },
    defaultVariants: {
      color: "surface",
    },
  },
);

export interface ColorBlockProps
  extends Omit<HTMLAttributes<HTMLElement>, "color">,
    VariantProps<typeof colorBlockVariants> {}

function ColorBlock({ className, color, children, ...props }: ColorBlockProps) {
  return (
    <section
      className={cn(colorBlockVariants({ color }), className)}
      {...props}
    >
      {children}
    </section>
  );
}

export { ColorBlock, colorBlockVariants };
