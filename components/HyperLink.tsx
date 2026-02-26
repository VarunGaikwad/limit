import React from "react";

type HyperLinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  size?: "sm" | "md" | "lg";
  variant?: "primary" | "muted";
};

export default function HyperLink({
  size = "md",
  variant = "primary",
  className = "",
  target,
  rel,
  children,
  ...rest
}: HyperLinkProps) {
  const sizes = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  const variants = {
    primary:
      "text-primary underline hover:no-underline focus:outline-none focus:ring-2 focus:ring-primary",
    muted:
      "text-gray-500 underline hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400",
  };

  const computedRel =
    target === "_blank" ? (rel ?? "noopener noreferrer") : rel;

  return (
    <a
      className={[
        "select-none transition-colors",
        sizes[size],
        variants[variant],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      target={target}
      rel={computedRel}
      {...rest}
    >
      {children}
    </a>
  );
}
