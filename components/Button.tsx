import React, { forwardRef } from "react";

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
      "select-none inline-flex items-center justify-center rounded-full font-semibold transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2";

    const variants = {
      primary: "bg-primary text-white hover:bg-primary/90 focus:ring-primary",
      default: "bg-gray-300 text-black hover:bg-gray-400 focus:ring-gray-400",
    };

    const sizes = {
      sm: "px-3 py-1 text-sm",
      md: "px-4 py-2",
      lg: "px-6 py-3 text-lg",
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

    // 🔥 If href exists → render anchor
    if ("href" in props && props.href) {
      return (
        <a
          ref={ref as React.Ref<HTMLAnchorElement>}
          className={classes}
          {...(rest as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
        >
          {children}
        </a>
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
          <span className="animate-pulse">Loading...</span>
        ) : (
          children
        )}
      </button>
    );
  },
);

Button.displayName = "Button";

export default Button;
