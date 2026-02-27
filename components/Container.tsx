import React from "react";

type ContainerProps = React.PropsWithChildren<{}> & {
  className?: string;
};
export default function Container({
  className = "",
  children,
}: ContainerProps) {
  return (
    <div
      className={
        "min-h-svh w-full flex justify-center items-center relative " +
        className
      }
    >
      {/* Background patterns for desktop */}
      <div className="fixed inset-0 bg-dot-pattern opacity-[0.03] pointer-events-none" />
      <div className="fixed -top-24 -left-24 size-96 bg-primary/5 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="fixed -bottom-24 -right-24 size-96 bg-primary/10 rounded-full blur-3xl pointer-events-none animate-pulse delay-700" />

      <div className="relative z-10 w-full h-full flex justify-center items-center">
        {children}
      </div>
    </div>
  );
}
