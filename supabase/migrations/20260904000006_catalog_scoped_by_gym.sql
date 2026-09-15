-- Catálogo por gym (2026-09-04): plans/products/categories tenían SELECT
-- abierto a todo el mundo (USING true) y los hooks no filtraban por gym:
-- un miembro veía planes y productos de los 3 gyms mezclados.
-- Se parte en rama anon (solo plans: la landing pública los muestra) y
-- rama authenticated scopeada al propio gym. products/categories no los usa
-- nada público → solo authenticated del propio gym.

DROP POLICY IF EXISTS "Plans viewable by everyone" ON public.plans;
CREATE POLICY "plans_select_anon"
  ON public.plans FOR SELECT TO anon USING (true);
CREATE POLICY "plans_select_own_gym"
  ON public.plans FOR SELECT TO authenticated USING (gym_id = my_gym_id());

DROP POLICY IF EXISTS "Products viewable by everyone" ON public.products;
CREATE POLICY "products_select_own_gym"
  ON public.products FOR SELECT TO authenticated USING (gym_id = my_gym_id());

DROP POLICY IF EXISTS "Categories viewable by everyone" ON public.categories;
CREATE POLICY "categories_select_own_gym"
  ON public.categories FOR SELECT TO authenticated USING (gym_id = my_gym_id());
