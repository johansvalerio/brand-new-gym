import {
  Mail,
  Phone,
  MapPin,
  ArrowUp,
  MessageCircle,
  Share2,
  Globe,
} from "lucide-react";

const footerLinks = {
  brand: {
    name: "GYM ULATE",
    tagline: "Forja Tu Legado",
  },
  navigation: [
    { label: "Inicio", href: "#home" },
    { label: "Equipamiento", href: "#equipment" },
    { label: "Entrenadores", href: "#coaches" },
    { label: "Membresía", href: "#membership" },
    { label: "Ubicación", href: "#location" },
  ],
  support: [
    { label: "Preguntas Frecuentes", href: "#faq" },
    { label: "Contacto", href: "#contact" },
    { label: "Privacidad", href: "#privacy" },
    { label: "Términos", href: "#terms" },
  ],
  contact: {
    email: "info@gymulate.com",
    phone: "+1 (555) 123-4567",
    address: "Av. Central, Cañas, Guanacaste, Costa Rica",
  },
  social: [
    { platform: "Chat", icon: MessageCircle, href: "#" },
    { platform: "Compartir", icon: Share2, href: "#" },
    { platform: "Web", icon: Globe, href: "#" },
  ],
};

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative bg-black pt-20 overflow-hidden">
      {/* ░░ The closing wall — no grid, a grounded black floor ░░ */}
      <div className="absolute inset-0 pointer-events-none">
        {/* A single faint bottom glow — the "floor" light */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[80%] h-[300px] bg-primary/8 blur-[120px] rounded-full" />
        {/* A soft top sheen so the footer isn't a flat void */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        {/* Fine hairline grid ONLY near the very bottom (a floor rule, not a pattern) */}
        <div className="absolute bottom-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      </div>

      <div className="relative z-10 container mx-auto max-w-7xl px-6">
        {/* ░░ Hero sign-off — the memorable last word ░░ */}
        <div className="mb-16">
          {/* <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/5 mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
            </span>
            <span className="font-mono text-[11px] uppercase tracking-[0.28em] text-primary font-bold">
              The grind is eternal
            </span>
          </div> */}

          <h2 className="font-heading font-black uppercase leading-[0.85] tracking-[-0.03em] text-[clamp(2.75rem,7vw,5.5rem)] text-foreground">
            Forja Tu
            <br />
            <span className="text-primary">Legado.</span>
          </h2>

          <p className="font-mono text-muted-foreground text-sm md:text-base mt-4 max-w-xl leading-relaxed">
            Una fortaleza de disciplina. Donde se rompen límites y se forjan
            legados.
          </p>
        </div>

        {/* ░░ Column grid ░░ */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-14">
          {/* Brand */}
          <div className="lg:pr-8">
            <h3 className="font-heading font-black text-xl uppercase tracking-widest text-foreground mb-4">
              {footerLinks.brand.name}
            </h3>
            <p className="font-mono text-xs text-primary tracking-[0.22em] uppercase mb-5">
              {footerLinks.brand.tagline}
            </p>

            <div className="flex gap-3">
              {footerLinks.social.map((social) => (
                <a
                  key={social.platform}
                  href={social.href}
                  className="p-2.5 rounded-lg border border-border/50 text-muted-foreground hover:text-primary hover:border-primary/50 hover:bg-primary/10 transition-all duration-300 group/btn cursor-pointer"
                  aria-label={social.platform}
                >
                  <social.icon
                    className="w-5 h-5 group-hover/btn:scale-110 transition-transform duration-300"
                    strokeWidth={2}
                  />
                </a>
              ))}
            </div>
          </div>

          {/* Navigate */}
          <div>
            <h4 className="font-heading font-bold text-xs uppercase tracking-[0.24em] text-muted-foreground mb-5">
              Navegar
            </h4>
            <ul className="space-y-3">
              {footerLinks.navigation.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="group/link inline-flex items-center gap-2 font-mono text-sm text-foreground/80 hover:text-primary transition-colors duration-300 cursor-pointer"
                  >
                    <span className="w-0 h-px bg-primary transition-all duration-300 group-hover/link:w-4" />
                    <span className="transition-transform duration-300 group-hover/link:translate-x-0.5">
                      {link.label}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-heading font-bold text-xs uppercase tracking-[0.24em] text-muted-foreground mb-5">
              Soporte
            </h4>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="group/link inline-flex items-center gap-2 font-mono text-sm text-foreground/80 hover:text-primary transition-colors duration-300 cursor-pointer"
                  >
                    <span className="w-0 h-px bg-primary transition-all duration-300 group-hover/link:w-4" />
                    <span className="transition-transform duration-300 group-hover/link:translate-x-0.5">
                      {link.label}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-heading font-bold text-xs uppercase tracking-[0.24em] text-muted-foreground mb-5">
              Contacto
            </h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <Mail
                  className="w-4 h-4 text-primary mt-0.5 flex-shrink-0"
                  strokeWidth={2}
                />
                <a
                  href={`mailto:${footerLinks.contact.email}`}
                  className="font-mono text-sm text-foreground/80 hover:text-primary transition-colors duration-300 break-all"
                >
                  {footerLinks.contact.email}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Phone
                  className="w-4 h-4 text-primary mt-0.5 flex-shrink-0"
                  strokeWidth={2}
                />
                <a
                  href={`tel:${footerLinks.contact.phone}`}
                  className="font-mono text-sm text-foreground/80 hover:text-primary transition-colors duration-300"
                >
                  {footerLinks.contact.phone}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin
                  className="w-4 h-4 text-primary mt-0.5 flex-shrink-0"
                  strokeWidth={2}
                />
                <span className="font-mono text-sm text-foreground/80 leading-relaxed">
                  {footerLinks.contact.address}
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* ░░ Bottom bar ░░ */}
        <div className="pt-6 pb-6 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-mono text-xs text-muted-foreground text-center sm:text-left">
            © {year} {footerLinks.brand.name}. Todos los derechos reservados.
          </p>
          <div className="flex items-center gap-6">
            <a
              href="#privacy"
              className="font-mono text-xs text-muted-foreground hover:text-primary transition-colors duration-300 cursor-pointer"
            >
              Privacidad
            </a>
            <a
              href="#terms"
              className="font-mono text-xs text-muted-foreground hover:text-primary transition-colors duration-300 cursor-pointer"
            >
              Términos
            </a>
          </div>
          <a
            href="#home"
            className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground hover:text-primary transition-colors duration-300 cursor-pointer"
          >
            Volver arriba
            <ArrowUp className="w-4 h-4" strokeWidth={2.5} />
          </a>
        </div>
      </div>
    </footer>
  );
}