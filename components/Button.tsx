import React, { forwardRef } from "react";
import Link from "next/link";

type BaseProps = {
  variant?: "primary" | "default";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  className?: string;
  children: React.ReactNode;
};

type ButtonAsButton = BaseProps &
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    href?: undefined;
  };

type ButtonAsAnchor = BaseProps &
  React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    href: string;
  };

type ButtonProps = ButtonAsButton | ButtonAsAnchor;

const Button = forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(
  (props, ref) => {
    const {
      variant = "default",
      size = "md",
      isLoading = false,
      className = "",
      children,
      ...rest
    } = props;

    const baseStyles =
      "select-none inline-flex items-center justify-center rounded-full font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-95";

    const variants = {
      primary:
        "bg-primary text-white hover:bg-primary/90 focus:ring-primary shadow-lg shadow-primary/20",
      default:
        "bg-gray-100 text-gray-800 hover:bg-gray-200 focus:ring-gray-300 border border-gray-200",
    };

    const sizes = {
      sm: "px-4 py-1.5 text-sm",
      md: "px-6 py-2.5",
      lg: "px-8 py-3.5 text-lg",
    };

    const disabledStyles = "opacity-50 cursor-not-allowed pointer-events-none";

    const classes = [
      baseStyles,
      variants[variant],
      sizes[size],
      ("disabled" in props && props.disabled) || isLoading
        ? disabledStyles
        : "",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    // 🔥 If href exists → render Link
    if ("href" in props && props.href) {
      return (
        <Link
          href={props.href}
          ref={ref as React.Ref<HTMLAnchorElement>}
          className={classes}
          {...(rest as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
        >
          {children}
        </Link>
      );
    }

    // Otherwise → render button
    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        type={
          (rest as React.ButtonHTMLAttributes<HTMLButtonElement>).type ??
          "button"
        }
        disabled={
          (rest as React.ButtonHTMLAttributes<HTMLButtonElement>).disabled ||
          isLoading
        }
        className={classes}
        {...(rest as React.ButtonHTMLAttributes<HTMLButtonElement>)}
      >
        {isLoading ? (
          <div className="flex items-center gap-2">
            <svg
              className="animate-spin h-4 w-4 text-current"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>Loading...</span>
          </div>
        ) : (
          children
        )}
      </button>
    );
  },
);

Button.displayName = "Button";

export default Button;
