import React from "react";
import Link from "next/link";

type HyperLinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  size?: "sm" | "md" | "lg";
  variant?: "primary" | "muted";
  href: string;
};

export default function HyperLink({
  size = "md",
  variant = "primary",
  className = "",
  target,
  rel,
  children,
  href,
  ...rest
}: HyperLinkProps) {
  const sizes = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  const variants = {
    primary:
      "text-primary underline hover:no-underline underline-offset-4 font-medium transition-all",
    muted: "text-gray-500 hover:text-gray-800 transition-all font-medium",
  };

  const computedRel =
    target === "_blank" ? (rel ?? "noopener noreferrer") : rel;

  return (
    <Link
      href={href}
      className={["select-none", sizes[size], variants[variant], className]
        .filter(Boolean)
        .join(" ")}
      target={target}
      rel={computedRel}
      {...rest}
    >
      {children}
    </Link>
  );
}
