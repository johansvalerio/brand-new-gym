"use client";

import { useEffect } from "react";
import { AlertTriangle, Home, RefreshCw, Zap } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const segs = usePathname().split("/").filter(Boolean);
  const slug = segs[0] === "auth" || segs.length === 0 ? "gym-ulate" : segs[0];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6 relative overflow-hidden">
      {/* Background Layer System */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Aggressive ambient glows */}
        <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-destructive/10 blur-[150px] rounded-full animate-pulse" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-primary/8 blur-[140px] rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-destructive/5 blur-[120px] rounded-full" />
        
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(239, 68, 68, 0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(239, 68, 68, 0.3) 1px, transparent 1px)
            `,
            backgroundSize: "32px 32px",
          }}
        />
        
        {/* Vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,#000_70%)]" />
      </div>

      <div className="relative z-10 max-w-4xl w-full">
        {/* Large Error Code */}
        <div className="text-center mb-8">
          <div className="relative inline-block">
            <h1 className="font-heading text-[12rem] md:text-[16rem] font-black uppercase text-destructive/20 leading-none tracking-tighter select-none">
              ERROR
            </h1>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-destructive/10 p-8 rounded-full border-2 border-destructive/30 backdrop-blur-sm">
                <AlertTriangle className="w-24 h-24 text-destructive" strokeWidth={1.5} />
              </div>
            </div>
          </div>
        </div>

        {/* Aggressive Error Message */}
        <div className="text-center mb-12">
          <h2 className="font-heading text-4xl md:text-6xl font-black uppercase text-foreground mb-4 tracking-tight">
            FALLO DEL <span className="text-destructive">SISTEMA</span>
          </h2>
          <p className="font-mono text-muted-foreground text-xl max-w-lg mx-auto leading-relaxed">
            Algo se rompió. Los campeones se adaptan. Elige tu próximo movimiento.
          </p>
        </div>

        {/* Error Details (Development Only) */}
        {process.env.NODE_ENV === "development" && (
          <div className="mb-10 p-6 rounded-xl bg-destructive/5 border border-destructive/20 font-mono text-sm text-muted-foreground backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-4 h-4 text-destructive" strokeWidth={2} />
              <p className="font-bold text-destructive uppercase tracking-wider">Reporte de Error</p>
            </div>
            <p className="break-all">{error.message}</p>
            {error.digest && <p className="mt-2 text-xs">ID: {error.digest}</p>}
          </div>
        )}

        {/* Aggressive Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center">
          <button
            onClick={reset}
            className="group relative inline-flex items-center justify-center gap-3 px-10 py-5 bg-destructive text-destructive-foreground font-heading font-black uppercase tracking-widest text-sm hover:bg-destructive/90 transition-all duration-200 overflow-hidden"
          >
            <span className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            <RefreshCw className="w-5 h-5 relative z-10 group-hover:rotate-180 transition-transform duration-500" strokeWidth={2} />
            <span className="relative z-10">Recuperar Sistema</span>
          </button>
          <Link
            href={`/${slug}`}
            className="group relative inline-flex items-center justify-center gap-3 px-10 py-5 bg-transparent border-2 border-primary text-primary font-heading font-black uppercase tracking-widest text-sm hover:bg-primary hover:text-primary-foreground transition-all duration-200 overflow-hidden"
          >
            <span className="absolute inset-0 bg-primary/10 translate-x-full group-hover:translate-x-0 transition-transform duration-300" />
            <Home className="w-5 h-5 relative z-10 group-hover:scale-110 transition-transform duration-200" strokeWidth={2} />
            <span className="relative z-10">Volver a la Base</span>
          </Link>
        </div>

        {/* Tech decorations */}
        <div className="mt-16 flex justify-center gap-8 opacity-30">
          <div className="h-px w-24 bg-destructive" />
          <div className="flex gap-2">
            <div className="w-2 h-2 bg-destructive animate-pulse" />
            <div className="w-2 h-2 bg-destructive animate-pulse delay-100" />
            <div className="w-2 h-2 bg-destructive animate-pulse delay-200" />
          </div>
          <div className="h-px w-24 bg-destructive" />
        </div>
      </div>
    </div>
  );
}