import { cn } from "@/lib/utils";

interface RichTextDisplayProps {
  html: string;
  className?: string;
}

/**
 * Renders HTML output from the Tiptap rich-text editor with
 * consistent prose styling that matches the design system.
 */
export function RichTextDisplay({ html, className }: RichTextDisplayProps) {
  return (
    <div
      className={cn("rich-text-display", className)}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
