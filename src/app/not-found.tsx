"use client";

import { Home, ArrowLeft, Crosshair } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6 relative overflow-hidden">
      {/* Background Layer System */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Aggressive ambient glows */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/10 blur-[150px] rounded-full animate-pulse" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-secondary/8 blur-[140px] rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-primary/5 blur-[120px] rounded-full" />
        
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(150, 217, 6, 0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(150, 217, 6, 0.3) 1px, transparent 1px)
            `,
            backgroundSize: "32px 32px",
          }}
        />
        
        {/* Vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,#000_70%)]" />
      </div>

      <div className="relative z-10 max-w-4xl w-full">
        {/* Large 404 Code */}
        <div className="text-center mb-8">
          <div className="relative inline-block">
            <h1 className="font-heading text-[16rem] md:text-[20rem] font-black uppercase text-primary/20 leading-none tracking-tighter select-none">
              404
            </h1>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-primary/10 p-8 rounded-full border-2 border-primary/30 backdrop-blur-sm">
                <Crosshair className="w-24 h-24 text-primary" strokeWidth={1.5} />
              </div>
            </div>
          </div>
        </div>

        {/* Aggressive 404 Message */}
        <div className="text-center mb-12">
          <h2 className="font-heading text-4xl md:text-6xl font-black uppercase text-foreground mb-4 tracking-tight">
            OBJETIVO <span className="text-primary">PERDIDO</span>
          </h2>
          <p className="font-mono text-muted-foreground text-xl max-w-lg mx-auto leading-relaxed">
            La página que buscas no existe. Recalcula tu ruta.
          </p>
        </div>

        {/* Aggressive Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center">
          <Link
            href="/"
            className="group relative inline-flex items-center justify-center gap-3 px-10 py-5 bg-primary text-primary-foreground font-heading font-black uppercase tracking-widest text-sm hover:bg-primary/90 transition-all duration-200 overflow-hidden"
          >
            <span className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            <Home className="w-5 h-5 relative z-10 group-hover:scale-110 transition-transform duration-200" strokeWidth={2} />
            <span className="relative z-10">Volver a la Base</span>
          </Link>
          <button
            onClick={() => window.history.back()}
            className="group relative inline-flex items-center justify-center gap-3 px-10 py-5 bg-transparent border-2 border-primary text-primary font-heading font-black uppercase tracking-widest text-sm hover:bg-primary hover:text-primary-foreground transition-all duration-200 overflow-hidden"
          >
            <span className="absolute inset-0 bg-primary/10 translate-x-full group-hover:translate-x-0 transition-transform duration-300" />
            <ArrowLeft className="w-5 h-5 relative z-10 group-hover:-translate-x-1 transition-transform duration-200" strokeWidth={2} />
            <span className="relative z-10">Retroceder</span>
          </button>
        </div>

        {/* Tech Navigation */}
        <div className="mt-16 p-6 rounded-xl bg-primary/5 border border-primary/20 backdrop-blur-sm">
          <p className="font-mono text-xs text-primary uppercase tracking-widest text-center mb-4">
            Coordenadas del Sistema
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            <Link
              href="/"
              className="group flex items-center gap-2 font-mono text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <div className="w-1.5 h-1.5 bg-primary/50 group-hover:bg-primary rounded-full" />
              INICIO
            </Link>
            <Link
              href="/products"
              className="group flex items-center gap-2 font-mono text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <div className="w-1.5 h-1.5 bg-primary/50 group-hover:bg-primary rounded-full" />
              PRODUCTOS
            </Link>
            <Link
              href="/#location"
              className="group flex items-center gap-2 font-mono text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <div className="w-1.5 h-1.5 bg-primary/50 group-hover:bg-primary rounded-full" />
              UBICACIÓN
            </Link>
          </div>
        </div>

        {/* Tech decorations */}
        <div className="mt-12 flex justify-center gap-8 opacity-30">
          <div className="h-px w-24 bg-primary" />
          <div className="flex gap-2">
            <div className="w-2 h-2 bg-primary animate-pulse" />
            <div className="w-2 h-2 bg-primary animate-pulse delay-100" />
            <div className="w-2 h-2 bg-primary animate-pulse delay-200" />
          </div>
          <div className="h-px w-24 bg-primary" />
        </div>
      </div>
    </div>
  );
}