import React from "react";

type UnauthCardProps = React.HTMLAttributes<HTMLDivElement> & {
  title: string;
};
export default function UnauthCard({ title, children }: UnauthCardProps) {
  return (
    <div className="flex-1 flex flex-col h-full">
      <div className="h-1/4 w-full grid place-content-center font-bold text-3xl">
        {title}
      </div>
      <div className="h-full bg-white rounded-t-4xl flex items-center justify-center px-8 md:px-40 lg:px-80">
        <div className="w-full space-y-2.5">{children}</div>
      </div>
    </div>
  );
}
