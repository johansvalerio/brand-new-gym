"use client";

import { useState } from "react";
import { Dumbbell, Loader2 } from "lucide-react";
import ConstellationBackground from "@/_features/shared/components/ConstellationBackground";
import { createClient } from "@/lib/supabase/client";

export function Login() {
  const [oAuthLoading, setOAuthLoading] = useState<"google" | "facebook" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  const handleGoogleLogin = async () => {
    setOAuthLoading("google");
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Error al conectar con Google");
      setOAuthLoading(null);
    }
  };

  const handleFacebookLogin = async () => {
    setOAuthLoading("facebook");
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "facebook",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Error al conectar con Facebook");
      setOAuthLoading(null);
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
              GYM<span className="text-primary">ULATE</span>
            </h1>
          </div>
          <p className="font-mono text-muted-foreground text-sm">
            ACCEDER A TU FORTALEZA DE ENTRENAMIENTO
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-8">
          {/* OAuth Buttons */}
          <div className="space-y-4">
            <button
              onClick={handleGoogleLogin}
              disabled={oAuthLoading === "google"}
              className="group relative w-full inline-flex items-center justify-center gap-3 px-6 py-4 bg-background border-2 border-border hover:border-primary/50 text-foreground font-mono text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl min-h-[52px]"
            >
              {oAuthLoading === "google" ? (
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
                {oAuthLoading === "google" ? "Conectando..." : "Continuar con Google"}
              </span>
            </button>

            <button
              onClick={handleFacebookLogin}
              disabled={oAuthLoading === "facebook"}
              className="group relative w-full inline-flex items-center justify-center gap-3 px-6 py-4 bg-background border-2 border-border hover:border-primary/50 text-foreground font-mono text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl min-h-[52px]"
            >
              {oAuthLoading === "facebook" ? (
                <Loader2 className="w-5 h-5 animate-spin text-primary" strokeWidth={2} />
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" fill="#1877F2"/>
                </svg>
              )}
              <span className="relative z-10">
                {oAuthLoading === "facebook" ? "Conectando..." : "Continuar con Facebook"}
              </span>
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
              <p className="font-mono text-xs text-destructive text-center">{error}</p>
            </div>
          )}
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