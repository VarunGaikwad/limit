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
      className={"h-svh w-screen flex justify-center items-center " + className}
    >
      {children}
    </div>
  );
}
