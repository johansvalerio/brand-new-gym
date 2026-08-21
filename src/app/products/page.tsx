import { Products } from "@/_features/gym-admin/products/components/Products";
import ConstellationBackground from "@/_features/shared/components/ConstellationBackground";

export default function Home() {
  return (
    <main className="min-h-screen py-16 bg-background text-foreground overflow-x-hidden selection:bg-primary/30">
      <ConstellationBackground />
      <Products />
    </main>
  );
}
