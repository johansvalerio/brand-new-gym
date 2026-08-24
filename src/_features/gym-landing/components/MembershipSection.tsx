"use client";

import { useMemo, useState } from "react";
import { Check, Zap, Crown, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { useAuthSession } from "@/_features/auth/hooks/useAuthSession";
import { usePlans } from "@/_features/gym-admin/users/hooks/usePlans";
import {
  useCreatePaymentRequest,
} from "@/_features/gym-admin/payments/hooks/usePayments";
import { usePageTransition } from "@/_features/shared/hooks/usePageTransition";
import { currency } from "@/_features/gym-admin/products/components/utils";

/** Capa de marketing por posición: los datos reales vienen de la tabla plans. */
const CARD_VISUALS = [
  {
    icon: Shield,
    period: "/día",
    description: "Acceso completo por un día. Ideal para probar o visitar.",
    features: [
      "Acceso al gimnasio por un día",
      "Zona de Pesas y Cardio",
      "Vestidores",
      "Sin compromiso",
    ],
    accent: "from-muted/70 to-muted/20",
    glowClass: "bg-muted-foreground/30",
    highlighted: false,
  },
  {
    icon: Zap,
    period: "/semana",
    description: "Una semana completa de entrenamiento sin límites.",
    features: [
      "Acceso ilimitado por 7 días",
      "Zona de Pesas y Cardio",
      "Vestidores y duchas",
      "Perfecto para visitantes",
    ],
    accent: "from-primary/30 via-primary/15 to-transparent",
    glowClass: "bg-primary/50",
    highlighted: true,
  },
  {
    icon: Crown,
    period: "/mes",
    description: "El mejor valor para hacer del gimnasio tu rutina.",
    features: [
      "Acceso ilimitado por 30 días",
      "Todas las áreas del gimnasio",
      "Rutinas con tu coach desde la app",
      "Mejor valor por día",
    ],
    accent: "from-secondary/50 via-secondary/20 to-transparent",
    glowClass: "bg-secondary/40",
    highlighted: false,
  },
];

export function MembershipSection() {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const { profile, loading: authLoading } = useAuthSession();
  const { data: plans = [], isLoading: plansLoading } = usePlans();
  const createRequest = useCreatePaymentRequest();
  const { navigate } = usePageTransition();

  const cards = useMemo(
    () =>
      plans
        .filter((plan) => plan.is_active)
        .slice(0, 3)
        .map((plan, i) => ({ ...plan, ...(CARD_VISUALS[i % CARD_VISUALS.length] ?? {}) })),
    [plans],
  );

  const isLoadingCards = authLoading || plansLoading;

  /**
   * Sin sesión → login. Con sesión → crea la solicitud (el trigger notifica
   * al admin) y lleva al usuario a /membership donde la ve pendiente.
   */
  const handleChoose = async (planId: string) => {
    if (!profile) {
      navigate("/auth/login");
      return;
    }
    await createRequest
      .mutateAsync({
        planId,
        method: "sinpe",
        requesterProfileId: profile.id,
      })
      .catch(() => null);
    // Navega siempre: en /membership ve su solicitud (o la que ya tenía).
    navigate("/membership");
  };

  return (
    <section
      id="membership"
      className="relative py-28 bg-background px-6 overflow-hidden"
    >
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-secondary/5 blur-[120px] rounded-full" />
      </div>

      <div className="container mx-auto max-w-7xl relative z-10">
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/5 mb-6">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-primary">
              Precios
            </span>
          </div>
          <h2 className="font-heading text-4xl md:text-6xl font-black uppercase text-foreground mb-6 leading-[0.95]">
            Niveles de{" "}
            <span className="text-primary relative inline-block">
              Membresía
              <svg
                className="absolute -bottom-2 left-0 w-full h-3 text-primary/40"
                viewBox="0 0 200 12"
                preserveAspectRatio="none"
              >
                <path
                  d="M0,8 Q50,0 100,6 T200,4"
                  stroke="currentColor"
                  strokeWidth="3"
                  fill="none"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto font-mono text-lg leading-relaxed">
            Elige tu plan, paga por SINPE o en caja y entrena. Sin tarifas ocultas.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
          {isLoadingCards ? (
            <>
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="h-[480px] animate-pulse rounded-lg border border-border bg-card/60"
                />
              ))}
            </>
          ) : (
            cards.map((plan, idx) => {
              const VisualIcon = plan.icon;
              const isHovered = hoveredIdx === idx;
              const isAdjacent =
                hoveredIdx !== null && Math.abs(hoveredIdx - idx) === 1;
              const ctaLabel = profile ? "Elegir este plan" : "Comenzar";

              return (
                <Card
                  key={plan.id}
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                  className={`pricing-card relative group overflow-hidden cursor-pointer transition-all duration-500 ease-out !gap-0 !py-0 flex flex-col
                    ${plan.highlighted ? "md:-mt-4 md:mb-4 ring-2 ring-primary/40 border border-primary shadow-2xl shadow-primary/25" : "ring-1 ring-foreground/10 border border-border"}
                    ${isHovered ? "!scale-[1.02] z-20 shadow-2xl" : isAdjacent ? "scale-[0.98] opacity-70 z-0" : "scale-100 z-10"}
                    ${isHovered && plan.highlighted ? "!shadow-primary/40 !ring-primary/80" : ""}
                    ${isHovered && !plan.highlighted ? "!ring-primary/50 !border-primary/60" : ""}
                  `}
                >
                  <div
                    className={`absolute inset-0 bg-gradient-to-b ${plan.accent} opacity-70`}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent pointer-events-none" />

                  <div
                    className={`absolute -top-24 -right-24 w-48 h-48 rounded-full blur-3xl opacity-0 group-hover:opacity-80 transition-all duration-700 ${plan.glowClass}`}
                  />

                  {plan.highlighted && (
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30">
                      <div className="relative">
                        <div className="absolute inset-0 bg-primary/40 blur-lg rounded-full animate-pulse" />
                        <div className="relative pt-2 lg:pt-5 bg-primary text-center text-primary-foreground font-heading uppercase tracking-[0.2em] text-[10px] px-5 py-2 rounded-full font-black border-2 border-primary/80">
                          Más Popular
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="relative z-10 flex flex-col flex-1">
                    <CardHeader className="!px-6 !pb-6 !pt-8 !gap-0">
                      <div className="flex items-start justify-between mb-4">
                        <div
                          className={`p-3 rounded-xl transition-all duration-500 ${
                            plan.highlighted
                              ? "bg-primary/20 text-primary group-hover:bg-primary group-hover:text-primary-foreground"
                              : "bg-muted/60 text-muted-foreground group-hover:bg-muted group-hover:text-foreground"
                          }`}
                        >
                          <VisualIcon className="w-6 h-6" strokeWidth={2} />
                        </div>
                        {plan.highlighted && (
                          <div className="flex gap-0.5">
                            {[...Array(3)].map((_, i) => (
                              <div
                                key={i}
                                className="w-1 h-1 rounded-full bg-primary"
                              />
                            ))}
                          </div>
                        )}
                      </div>
                      <CardTitle className="font-heading text-3xl uppercase tracking-wide mb-2">
                        {plan.name}
                      </CardTitle>
                      <CardDescription className="font-mono text-sm leading-relaxed min-h-[40px]">
                        {plan.description}
                      </CardDescription>
                      <div className="mt-6 flex items-end gap-2">
                        <span
                          className={`text-6xl font-black font-heading leading-none transition-colors duration-500 ${
                            isHovered ? "text-primary" : "text-foreground"
                          }`}
                        >
                          {currency(plan.price)}
                        </span>
                        <span className="text-lg font-mono text-muted-foreground mb-2">
                          {plan.period}
                        </span>
                      </div>
                    </CardHeader>

                    <div className="relative mx-6 mb-6 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

                    <CardContent className="!px-6 !pb-6 flex-1">
                      <ul className="space-y-3.5">
                        {plan.features.map((feature, i) => (
                          <li
                            key={i}
                            className="flex items-start gap-3.5 group/item"
                          >
                            <div
                              className={`mt-0.5 rounded-full p-1 transition-all duration-300 flex-shrink-0 ${
                                plan.highlighted
                                  ? "bg-primary/15 group-hover/item:bg-primary/25"
                                  : "bg-muted/50 group-hover/item:bg-muted"
                              }`}
                            >
                              <Check
                                className={`w-3.5 h-3.5 ${
                                  plan.highlighted
                                    ? "text-primary"
                                    : "text-foreground"
                                }`}
                                strokeWidth={3}
                              />
                            </div>
                            <span className="font-mono text-sm text-foreground/80 leading-relaxed pt-0.5">
                              {feature}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>

                    <CardFooter className="!px-6 !pb-8 !pt-0 mt-auto !border-t-0 !bg-transparent">
                      <Button
                        onClick={() => void handleChoose(plan.id)}
                        disabled={createRequest.isPending}
                        aria-label={`${ctaLabel} — ${plan.name}`}
                        className={`w-full font-heading tracking-[0.15em] uppercase h-14 text-sm relative overflow-hidden transition-all duration-300 ${
                          plan.highlighted
                            ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/50"
                            : "bg-secondary/10 text-secondary-foreground hover:bg-secondary/20 border border-secondary-foreground/30"
                        }`}
                      >
                        <span className="relative z-10 flex items-center justify-center gap-2">
                          {ctaLabel}
                          <svg
                            className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path
                              d="M5 12h14M12 5l7 7-7 7"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </span>
                      </Button>
                    </CardFooter>
                  </div>
                </Card>
              );
            })
          )}
        </div>

        <div className="mt-16 text-center">
          <p className="font-mono text-sm text-muted-foreground inline-flex items-center gap-2">
            <span className="w-8 h-px bg-border" />
            Pagas por SINPE o en caja. El administrador confirma y entrenas.
            <span className="w-8 h-px bg-border" />
          </p>
        </div>
      </div>
    </section>
  );
}
