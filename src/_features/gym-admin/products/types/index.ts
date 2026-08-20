// ─── Product (coincide exactamente con el modelo Prisma) ───
export interface Product {
  product_id: number;
  product_name: string;
  product_description: string | null;
  product_price: number;
  product_stock: number;
  product_image: string | null;
  product_created_at: string;
  product_updated_at: string;
}

// DTOs (coinciden con NestJS: Omit<Product, 'product_id' | 'product_created_at' | 'product_updated_at'>)
export type CreateProductDto = Omit<
  Product,
  "product_id" | "product_created_at" | "product_updated_at"
>;

export type UpdateProductDto = Partial<CreateProductDto>;
