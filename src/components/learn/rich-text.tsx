import type { ReactNode } from "react";

import { TextLink } from "@/components/ui/text-link";
import { cn } from "@/lib/utils";
import type { RichText } from "@/types/lesson";

type RichTextProps = {
  text: RichText;
  className?: string;
  /** `prose` uses the muted pill style for inline code; `plain` is monospace only. */
  codeStyle?: "prose" | "plain";
};

const TOKEN_PATTERN = /(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g;

function InlineCode({
  children,
  codeStyle,
}: {
  children: string;
  codeStyle: "prose" | "plain";
}) {
  if (codeStyle === "plain") {
    return <code className="font-mono">{children}</code>;
  }

  return (
    <code className="bg-muted text-foreground rounded px-1.5 py-0.5 font-mono text-[0.875em]">
      {children}
    </code>
  );
}

function renderToken(
  token: string,
  key: number,
  codeStyle: "prose" | "plain",
): ReactNode {
  if (token.startsWith("**") && token.endsWith("**")) {
    return (
      <strong key={key} className="text-foreground">
        {token.slice(2, -2)}
      </strong>
    );
  }

  if (token.startsWith("`") && token.endsWith("`")) {
    return (
      <InlineCode key={key} codeStyle={codeStyle}>
        {token.slice(1, -1)}
      </InlineCode>
    );
  }

  const linkMatch = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(token);
  if (linkMatch) {
    const label = linkMatch[1];
    const href = linkMatch[2];
    if (label && href) {
      return (
        <TextLink key={key} href={href}>
          {label}
        </TextLink>
      );
    }
  }

  return token;
}

export function RichTextSpan({
  text,
  className,
  codeStyle = "prose",
}: RichTextProps) {
  const parts = text.split(TOKEN_PATTERN).filter((part) => part.length > 0);

  return (
    <span className={className}>
      {parts.map((part, index) => renderToken(part, index, codeStyle))}
    </span>
  );
}

export function RichTextParagraph({
  text,
  className,
  codeStyle = "prose",
}: RichTextProps) {
  return (
    <p className={className}>
      <RichTextSpan text={text} codeStyle={codeStyle} />
    </p>
  );
}

export function listItemClassName(variant: "disc" | "plain" = "disc") {
  return cn(
    variant === "disc" && "list-disc space-y-2 pl-5",
    variant === "plain" && "space-y-4",
  );
}
