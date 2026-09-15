"use client";

import { useState } from "react";
import { Dumbbell, Loader2 } from "lucide-react";
import Link from "next/link";
import ConstellationBackground from "@/_features/shared/components/ConstellationBackground";
import { createClient } from "@/lib/supabase/client";

export function Login({ nextPath, gymName }: { nextPath?: string; gymName?: string | null }) {
  const [oAuthLoading, setOAuthLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();
  // window solo existe en el browser: se lee dentro de los handlers, nunca en render (SSR).
  const getCallbackUrl = () =>
    `${window.location.origin}/auth/callback${nextPath ? `?next=${encodeURIComponent(nextPath)}` : ""}`;

  const handleGoogleLogin = async () => {
    setOAuthLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: getCallbackUrl(),
        },
      });

      if (error) throw error;
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Error al conectar con Google");
      setOAuthLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6 relative overflow-hidden">
      <ConstellationBackground />
      {/* Background Layer System */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Ambient glows */}
        <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-primary/8 blur-[150px] rounded-full" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-secondary/8 blur-[140px] rounded-full" />
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
              JAULA
            </h1>
          </div>
          <p className="font-mono text-muted-foreground text-sm">
            TU GYM, BAJO CONTROL
          </p>
          {gymName && (
            <p className="mt-3 inline-flex items-center rounded-full border border-primary/40 bg-primary/10 px-4 py-1 font-mono text-xs uppercase tracking-widest text-primary">
              {gymName}
            </p>
          )}
        </div>

        {/* Login Form */}
        <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-8">
          {/* OAuth Buttons — solo Google */}
          <div className="space-y-4">
            <button
              onClick={handleGoogleLogin}
              disabled={oAuthLoading}
              className="group relative w-full inline-flex items-center justify-center gap-3 px-6 py-4 bg-background border-2 border-border hover:border-primary/50 text-foreground font-mono text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl min-h-[52px]"
            >
              {oAuthLoading ? (
                <Loader2 className="w-5 h-5 animate-spin text-primary" strokeWidth={2} />
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
              )}
              <span className="relative z-10">
                {oAuthLoading ? "Conectando..." : "Continuar con Google"}
              </span>
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
              <p className="font-mono text-xs text-destructive text-center">{error}</p>
            </div>
          )}

          {/* Registro */}
          <div className="mt-6 pt-6 border-t border-border/40 text-center">
            <p className="font-mono text-xs text-muted-foreground">
              ¿No tenés cuenta?{" "}
              <Link
                href={`/auth/register${nextPath ? `?next=${encodeURIComponent(nextPath)}` : ""}${gymName ? `${nextPath ? "&" : "?"}gym=${gymName}` : ""}`}
                className="text-primary hover:underline transition-colors"
              >
                Crear cuenta
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