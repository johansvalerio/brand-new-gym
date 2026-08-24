## Plan: Edición de pagos pendientes desde /payments

### Regla de negocio
Solo los pagos **pending** son editables (plan/método/nota). Los approved/rejected quedan congelados — integridad de auditoría y consistencia con la membresía ya activada.

### Fase A — DB (migración)
En `handle_payment_decision()` (BEFORE UPDATE), re-snapshot del monto cuando cambia el plan:
```sql
if tg_op = 'UPDATE' and new.plan_id is distinct from old.plan_id then
  select price into new.amount from public.plans where id = new.plan_id;
end if;
```
(mismo principio anti-manipulación del INSERT: la DB fija el precio).

### Fase B — Frontend

1. **`usePayments.ts`**: nueva mutación `useUpdatePayment({ id, planId, method, note })` → UPDATE eq id (RLS ya limita a admin) → toast + invalida payments.
2. **`walk-in-payment-dialog.tsx`**: soporta doble modo vía prop opcional `payment?: PaymentRow | null`:
   - **Sin payment** (actual): crea solicitud/pago nuevo, miembro elegible por buscador+select, submit = insert pending... *no* — este dialog en create-mode registra walk-ins aprobados (comportamiento actual intacto).
   - **Con payment** (modo edición): título "Editar pago", miembro bloqueado (solo lectura, mostrado como texto), plan/método/nota prefijados desde la fila, submit → `useUpdatePayment`. Botón "Guardar cambios".
   - Internamente usa ambas mutaciones según modo; Realtime refresca las listas solo.
3. **`pending-payment-card.tsx`**: nuevo botón lápiz (`onEdit?`) junto a Rechazar/Aprobar.
4. **`Payments.tsx`**: estado `editing: PaymentRow | null`; el lápiz de cada card hace `setEditing(payment)` + abre el dialog; al cerrar se limpia.

### Verificación
- SQL: UPDATE de plan en un pending re-snapshottea amount; admin edita método/plan/note ✓; no-admin blocked (RLS update ya admin-only).
- `npx tsc --noEmit` + detector.
- Navegador: registrar pago walk-in → editarlo (cambiar plan) → monto y fila actualizados solos (Realtime); aprobados sin botón editar.

~5 archivos: 1 migración, usePayments, walk-in-payment-dialog, pending-payment-card, Payments.tsx (+MASTER.md nota breve).