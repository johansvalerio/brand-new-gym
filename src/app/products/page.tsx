import { Products } from "@/_features/gym-admin/products/components/Products";

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground overflow-x-hidden selection:bg-primary/30">
     <Products />
    </main>
  );
}
