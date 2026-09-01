import { Products } from "@/_features/gym-admin/products/components/Products";
import ConstellationBackground from "@/_features/shared/components/ConstellationBackground";

export default function Home() {
 return (
 <main className="relative min-h-screen py-16 bg-background text-foreground overflow-x-hidden selection:bg-primary/30">
 <div className="opacity-40">
 <ConstellationBackground />
 </div>
 <Products />
 </main>
 );
}
