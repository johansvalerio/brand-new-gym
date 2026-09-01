"use client"

import { useState } from "react"
import { motion, useReducedMotion, AnimatePresence } from "motion/react"
import { Plus, Minus, HelpCircle } from "lucide-react"

type FaqItem = { q: string; a: string }

const FAQS: FaqItem[] = [
  {
    q: "¿Qué planes ofrecen y cuánto cuestan?",
    a: "Día ₡3.000, semana ₡10.000 y mes ₡15.000. Todos con acceso a pesas, cardio y vestidores. El mensual es el mejor valor.",
  },
  {
    q: "¿Cómo pago mi membresía o producto?",
    a: "Por SINPE o en caja del gym. Haces la solicitud en la app y el admin la confirma en el momento — sin esperas eternas.",
  },
  {
    q: "¿Cuál es el horario?",
    a: "Lunes a viernes 5:00–22:00 y sábados 5:00–12:00. Acceso según tu plan activo.",
  },
  {
    q: "¿Puedo probar un día sin compromiso?",
    a: "Sí, el plan diario es para probar el gym tal cual: equipo élite, seguimiento y comunidad.",
  },
  {
    q: "¿Me dan rutina personalizada?",
    a: "Sí. Tu coach te asigna rutina desde la app y la ves en Entrenar. También puedes crear la tuya y compartirla en el Ranking.",
  },
  {
    q: "¿Dónde están ubicados?",
    a: "En Cañas, Guanacaste — Av. Central. Ver mapa en la sección Ubicación y Horario.",
  },
]

function FaqRow({ item, isOpen, onToggle }: { item: FaqItem; isOpen: boolean; onToggle: () => void }) {
  return (
    <div className="group relative overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-primary/30">
      {isOpen && <div className="pointer-events-none absolute inset-0 bg-primary/5" />}
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="flex w-full cursor-pointer items-center justify-between gap-4 px-5 py-4 text-left sm:px-6 sm:py-5"
      >
        <span className="font-sans text-sm font-bold uppercase tracking-wide text-foreground sm:text-base">
          {item.q}
        </span>
        <span
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-colors ${
            isOpen ? "border-primary bg-primary text-primary-foreground" : "border-border bg-secondary text-muted-foreground group-hover:border-primary/40 group-hover:text-primary"
          }`}
          aria-hidden
        >
          {isOpen ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
        </span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <p className="px-5 pb-4 font-mono text-sm leading-relaxed text-muted-foreground sm:px-6 sm:pb-5">{item.a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function FaqSection() {
  const [open, setOpen] = useState<number | null>(0)
  const reduceMotion = useReducedMotion()

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  }

  return (
    <section id="faq" className="relative z-0 bg-background px-6 py-16 sm:py-20 lg:sticky lg:top-0 lg:min-h-[100svh] lg:flex lg:flex-col lg:justify-center lg:py-14">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute left-1/4 top-0 h-[400px] w-[400px] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 h-[400px] w-[400px] rounded-full bg-secondary/5 blur-[120px]" />
      </div>

      <div className="container relative z-10 mx-auto max-w-4xl">
        <div className="mb-10 text-center">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-4 py-1.5"
          >
            <HelpCircle className="h-3.5 w-3.5 text-primary" />
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-primary">FAQ</span>
          </motion.div>
          <motion.h2
            initial={reduceMotion ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
            className="mt-4 font-heading text-4xl font-black uppercase leading-[0.95] tracking-tighter text-foreground md:text-5xl"
          >
            Preguntas <span className="text-primary">frecuentes</span>
          </motion.h2>
          <motion.p
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.14 }}
            className="mx-auto mt-3 max-w-2xl font-mono text-sm leading-relaxed text-muted-foreground"
          >
            Todo lo que necesitas saber antes de entrenar. Si queda alguna duda, nos ves en Cañas.
          </motion.p>
        </div>

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="flex flex-col gap-3"
        >
          {FAQS.map((item, idx) => (
            <FaqRow key={item.q} item={item} isOpen={open === idx} onToggle={() => setOpen(open === idx ? null : idx)} />
          ))}
        </motion.div>

        <p className="mt-8 text-center font-mono text-xs text-muted-foreground">
          ¿No viste tu duda? Escríbenos en el gym o revisa tu membresía en la app.
        </p>
      </div>
    </section>
  )
}
