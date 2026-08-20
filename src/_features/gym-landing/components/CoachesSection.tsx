'use client';

import { motion, useReducedMotion } from 'motion/react';
import { useState } from 'react';
import { Dumbbell, Flame, Trophy, ArrowUpRight } from 'lucide-react';

const coaches = [
  {
    name: 'Marcus Vance',
    specialty: 'Fuerza y Acondicionamiento',
    image: 'https://images.unsplash.com/photo-1567013127542-490d732e519a?q=80&w=1974&auto=format&fit=crop',
    stat: '12+ años',
    statLabel: 'Entrenando',
    icon: Dumbbell,
  },
  {
    name: 'Sarah Jenkins',
    specialty: 'Especialista en Hipertrofia',
    image: 'https://images.unsplash.com/photo-1594381898411-846e7d193883?q=80&w=1974&auto=format&fit=crop',
    stat: '500+',
    statLabel: 'Atletas',
    icon: Flame,
  },
  {
    name: 'David Ortiz',
    specialty: 'Entrenador de Powerlifting',
    image: 'https://images.unsplash.com/photo-1534367507873-d2d7e24c7f07?q=80&w=1974&auto=format&fit=crop',
    stat: '9 años',
    statLabel: 'Comp Elite',
    icon: Trophy,
  },
];

export function CoachesSection() {
  const reduceMotion = useReducedMotion();
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  return (
    <section
      id="coaches"
      className="relative py-24 md:py-28 bg-card border-t border-border px-6 overflow-hidden"
    >
      {/* ░░ Background layer system ░░ */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-1/4 w-[420px] h-[420px] bg-primary/8 blur-[130px] rounded-full" />
        <div className="absolute bottom-0 left-1/4 w-[420px] h-[420px] bg-secondary/8 blur-[130px] rounded-full" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      </div>

      <div className="container mx-auto max-w-6xl relative z-10">
        {/* ░░ Section header (site pattern: centered chip + H2 + SVG underline + desc) ░░ */}
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="text-center mb-16 md:mb-20"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/5 mb-6">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-primary">
              Los Entrenadores
            </span>
          </div>
          <h2 className="font-heading text-4xl md:text-6xl font-black uppercase text-foreground mb-6 leading-[0.95]">
            Conoce Nuestros{" "}
            <span className="text-primary relative inline-block">
              Entrenadores
              <svg
                className="absolute -bottom-2 left-0 w-full h-3 text-primary/40"
                viewBox="0 0 200 12"
                preserveAspectRatio="none"
                aria-hidden="true"
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
            Veteranos de la industria con historiales comprobados. No contratamos
            porristas; contratamos arquitectos del rendimiento humano.
          </p>
        </motion.div>

        {/* ░░ Coach cards ░░ */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {coaches.map((coach, idx) => {
            const Icon = coach.icon;
            return (
              <motion.div
                key={coach.name}
                initial={reduceMotion ? false : { opacity: 0, y: 40, scale: 0.96 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{
                  duration: 0.6,
                  delay: idx * 0.12,
                  ease: [0.22, 1, 0.36, 1],
                }}
                onHoverStart={() => setActiveIdx(idx)}
                onHoverEnd={() => setActiveIdx(null)}
                className="group relative overflow-hidden rounded-2xl bg-background border border-border hover:border-primary/50 transition-colors duration-500 cursor-pointer"
              >
                {/* Hover glow */}
                <div
                  className={`absolute -top-20 -right-20 w-48 h-48 rounded-full bg-primary/40 blur-3xl transition-opacity duration-700 pointer-events-none ${activeIdx === idx ? 'opacity-60' : 'opacity-0'
                    }`}
                />

                {/* Image */}
                <div className="aspect-[3/4] overflow-hidden relative">
                  <img
                    src={coach.image}
                    alt={coach.name}
                    className="w-full h-full object-cover filter grayscale group-hover:grayscale-0 transition-all duration-700 scale-100 group-hover:scale-110"
                  />

                  {/* Icon chip - top right */}
                  <div className="absolute top-4 right-4 p-2.5 rounded-xl bg-background/80 backdrop-blur-md border border-border/60 text-primary opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-500">
                    <Icon className="w-5 h-5" strokeWidth={2} />
                  </div>

                  {/* Bottom gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent opacity-90" />

                  {/* Stat - bottom */}
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <div className="flex items-end justify-between">
                      <div>
                        <h3 className="font-heading text-2xl font-black uppercase text-foreground leading-tight">
                          {coach.name}
                        </h3>
                        <p className="font-mono text-primary text-sm tracking-widest mt-1">
                          {coach.specialty}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="block font-heading text-xl font-black text-primary leading-none">
                          {coach.stat}
                        </span>
                        <span className="block font-mono text-[10px] uppercase tracking-widest text-muted-foreground mt-1">
                          {coach.statLabel}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Hover reveal bar - bottom */}
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-secondary scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500" />
              </motion.div>
            );
          })}
        </div>

        {/* ░░ Footnote ░░ */}
        <motion.p
          initial={reduceMotion ? false : { opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-12 text-center font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground/70 flex items-center justify-center gap-2"
        >
          <ArrowUpRight className="w-4 h-4 text-primary" strokeWidth={2} />
          <span>Entrena con los mejores. Reserva una sesión gratuita.</span>
        </motion.p>
      </div>
    </section>
  );
}