import { cn } from "@/lib/utils";

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizes = {
  sm: "size-4 border-2",
  md: "size-8 border-[3px]",
  lg: "size-12 border-[4px]",
};

export function Spinner({ size = "md", className }: SpinnerProps) {
  return (
    <div
      className={cn(
        "animate-spin rounded-full border-outline-variant border-t-accent-magenta",
        sizes[size],
        className,
      )}
    />
  );
}
