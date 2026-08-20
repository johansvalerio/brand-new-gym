"use client";

import { useState } from "react";
import { Lock, Mail, User, ArrowRight, Eye, EyeOff, Dumbbell, Check } from "lucide-react";
import Link from "next/link";
import ConstellationBackground from "@/_features/shared/ConstellationBackground";

export function SignUp() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate signup
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6 relative overflow-hidden">
      <ConstellationBackground />
      {/* Background Layer System */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Ambient glows */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/8 blur-[150px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-secondary/8 blur-[140px] rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-primary/5 blur-[120px] rounded-full" />
        
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
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

      <div className="relative z-10 w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center gap-3 mb-6">
            <div className="bg-primary/10 p-3 rounded-xl border border-primary/30">
              <Dumbbell className="w-8 h-8 text-primary" strokeWidth={2} />
            </div>
            <h1 className="font-heading text-3xl font-black uppercase tracking-tight text-foreground">
              GYM<span className="text-primary">ULATE</span>
            </h1>
          </div>
          <p className="font-mono text-muted-foreground text-sm">
            ÚNETE A LA LEGIÓN DE ENTRENAMIENTO DE ÉLITE
          </p>
        </div>

        {/* Sign Up Form */}
        <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name */}
            <div className="space-y-2">
              <label className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                Nombre Completo
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" strokeWidth={2} />
                <input
                  type="text"
                  placeholder="Juan Pérez"
                  className="w-full pl-12 pr-4 py-4 bg-background border border-border rounded-xl font-mono text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" strokeWidth={2} />
                <input
                  type="email"
                  placeholder="tu@correo.com"
                  className="w-full pl-12 pr-4 py-4 bg-background border border-border rounded-xl font-mono text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" strokeWidth={2} />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-12 py-4 bg-background border border-border rounded-xl font-mono text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" strokeWidth={2} />
                  ) : (
                    <Eye className="w-5 h-5" strokeWidth={2} />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <label className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                Confirmar Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" strokeWidth={2} />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-12 py-4 bg-background border border-border rounded-xl font-mono text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" strokeWidth={2} />
                  ) : (
                    <Eye className="w-5 h-5" strokeWidth={2} />
                  )}
                </button>
              </div>
            </div>

            {/* Terms */}
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 mt-1 rounded border-border bg-background text-primary focus:ring-primary" required />
              <span className="font-mono text-xs text-muted-foreground leading-relaxed">
                Acepto los términos de servicio y la política de privacidad. Entiendo que este es un centro de entrenamiento intenso.
              </span>
            </label>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full inline-flex items-center justify-center gap-3 px-8 py-4 bg-primary text-primary-foreground font-heading font-black uppercase tracking-widest text-sm hover:bg-primary/90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden rounded-xl"
            >
              <span className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              {isLoading ? (
                <span className="relative z-10">ENLISTANDO...</span>
              ) : (
                <>
                  <span className="relative z-10">Enlistarse Ahora</span>
                  <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform duration-200" strokeWidth={2} />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-8 flex items-center gap-4">
            <div className="flex-1 h-px bg-border/50" />
            <span className="font-mono text-xs text-muted-foreground uppercase tracking-wider">
              Ya
            </span>
            <div className="flex-1 h-px bg-border/50" />
          </div>

          {/* Login Link */}
          <div className="text-center">
            <p className="font-mono text-sm text-muted-foreground">
              ¿Ya estás en la legión?{" "}
              <Link href="/auth/login" className="text-primary hover:text-primary/80 font-bold transition-colors">
                Acceder a la base
              </Link>
            </p>
          </div>
        </div>

        {/* Tech decoration */}
        <div className="mt-8 flex justify-center gap-6 opacity-30">
          <div className="h-px w-16 bg-primary" />
          <div className="flex gap-2">
            <div className="w-1.5 h-1.5 bg-primary animate-pulse" />
            <div className="w-1.5 h-1.5 bg-primary animate-pulse delay-100" />
            <div className="w-1.5 h-1.5 bg-primary animate-pulse delay-200" />
          </div>
          <div className="h-px w-16 bg-primary" />
        </div>
      </div>
    </div>
  );
}