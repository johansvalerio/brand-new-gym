'use client';

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from '@/components/ui/carousel';

const machines = [
  {
    name: 'Sentadilla Hack Squat',
    description: 'Aislamiento perfecto. Cero carga en la columna vertebral.',
    image: 'https://images.unsplash.com/photo-1596357395104-14a5ae9cdade?q=80&w=2070&auto=format&fit=crop',
  },
  {
    name: 'Plataformas de Levantamiento Olímpico',
    description: 'Barras y topos Eleiko de especificación de competencia.',
    image: 'https://images.unsplash.com/photo-1517963879433-6ad2b056d712?q=80&w=2070&auto=format&fit=crop',
  },
  {
    name: 'Cables Sectorizados',
    description: 'Precisión suave y poleas duales ajustables.',
    image: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=2070&auto=format&fit=crop',
  },
  {
    name: 'Deck de Cardio Avanzado',
    description: 'Rastrea macros directamente en tus datos de sprint.',
    image: 'https://images.unsplash.com/photo-1576678927484-cc907957088c?q=80&w=1974&auto=format&fit=crop',
  },
  {
    name: 'Zona de Recuperación',
    description: 'Baños de hielo, saunas infrarrojas.',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070&auto=format&fit=crop',
  }
];

export function EquipmentCarousel() {
  return (
    <section id="equipment" className="py-24 bg-card border-y border-border px-6 overflow-hidden">
      <div className="container mx-auto max-w-6xl">

        <div className="mb-12">
          <h2 className="font-heading text-4xl md:text-5xl font-black uppercase text-foreground mb-4">
            Arsenal <span className="text-primary">de Élite</span>
          </h2>
          <p className="font-mono text-muted-foreground text-lg max-w-2xl">
            Desliza por nuestro equipo seleccionado de clase mundial, diseñado para máxima tensión mecánica y progreso fisiológico.
          </p>
        </div>

        <div className="relative">
          {/* Subtle glow underneath carousel for monster energy feel */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[100px] bg-primary/10 blur-[100px] rounded-full z-0 pointer-events-none" />

          <Carousel
            opts={{
              align: "start",
              loop: true,
              dragFree: true,
            }}
            className="w-full relative z-10"
          >
            <CarouselContent className="-ml-4 md:-ml-8 cursor-grab active:cursor-grabbing">
              {machines.map((machine, index) => (
                <CarouselItem key={index} className="pl-4 md:pl-8 md:basis-1/2 lg:basis-1/3">
                  <div className="group relative rounded-xl overflow-hidden border border-border bg-background aspect-[4/5]">
                    <div className="absolute inset-0 bg-background/40 z-10 mix-blend-overlay" />
                    <img
                      src={machine.image}
                      alt={machine.name}
                      className="w-full h-full object-cover filter grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                    />
                    <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-background via-background/80 to-transparent z-20">
                      <h3 className="font-heading font-bold text-xl uppercase text-foreground mb-2">{machine.name}</h3>
                      <p className="font-mono text-sm text-primary tracking-wide opacity-0 transform translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                        {machine.description}
                      </p>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>

            {/* Custom Carousel Controls mimicking NestJS bottom/top drag styling or simple buttons */}
            <div className="hidden md:flex items-center justify-end gap-2 mt-8">
              <CarouselPrevious className="static transform-none border-border bg-card hover:bg-primary/20 hover:text-primary hover:border-primary/50 transition-colors" />
              <CarouselNext className="static transform-none border-border bg-card hover:bg-primary/20 hover:text-primary hover:border-primary/50 transition-colors" />
            </div>
          </Carousel>
        </div>
      </div>
    </section>
  );
}
