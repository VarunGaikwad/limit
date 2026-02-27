import React from "react";

type AuthCardProps = React.HTMLAttributes<HTMLDivElement> & {
  title: string;
  subtitle?: string;
};

export default function AuthCard({ title, subtitle, children }: AuthCardProps) {
  return (
    <div className="flex-1 flex flex-col h-svh md:h-[85vh] md:max-h-212.5 w-full md:max-w-250 md:rounded-[2.5rem] md:shadow-2xl md:shadow-primary/10 overflow-hidden md:flex-row bg-primary">
      <div className="flex-[0.35] md:flex-[0.45] min-h-45 w-full h-full flex flex-col items-center justify-center p-8 text-white relative">
        <div className="relative z-10 text-center space-y-4 md:space-y-6">
          <h1 className="font-black text-4xl tracking-tight drop-shadow-md md:text-6xl leading-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-white/90 text-center max-w-70 font-medium italic md:text-xl md:max-w-100 leading-relaxed mx-auto">
              {subtitle}
            </p>
          )}
        </div>

        {/* Decorative background element for left side on desktop */}
        <div className="hidden md:block absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[10%] left-[10%] size-32 bg-snow/10 rounded-full blur-xl animate-pulse" />
          <div className="absolute bottom-[20%] right-[5%] size-48 bg-snow/5 rounded-full blur-2xl animate-pulse delay-500" />
        </div>
      </div>

      {/* Form Section / Right Side on Desktop */}
      <div className="flex-1 bg-snow rounded-t-cxl md:rounded-t-none md:rounded-l-[2.5rem] shadow-2xl shadow-black/10 px-8 py-10 md:px-12 lg:px-16 overflow-y-auto">
        <div className="w-full max-w-md mx-auto space-y-6 flex flex-col justify-center min-h-full py-4">
          {children}
        </div>
      </div>
    </div>
  );
}
