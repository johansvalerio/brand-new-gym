Agregar el servidor MCP oficial de Supabase a ZCode con tu token de acceso:

## Pasos

1. **Leer** `C:\Users\johan\.zcode\cli\config.json` (config de usuario — aplica a todos tus workspaces y NO se commitea a git). Verificar su contenido actual para no sobrescribir nada.

2. **Agregar** el servidor bajo `mcp.servers`:

```json
{
  "mcp": {
    "servers": {
      "supabase": {
        "command": "npx",
        "args": ["-y", "@supabase/mcp-supabase@latest"],
        "env": {
          "SUPABASE_ACCESS_TOKEN": "sbp_e989...f3f0"
        }
      }
    }
  }
}
```

   - El token va en `env` (no como argumento CLI) para que no aparezca en la lista de procesos del sistema.
   - Si el archivo ya tiene otros servidores/ajustes, se fusiona sin tocar lo existente.

3. **Validar** que el JSON quedó bien formado.

4. **Reinicio**: los servidores MCP se conectan al inicio de sesión, así que necesitarás reiniciar ZCode (o reconectar el servidor desde Settings → MCP). Después dispondré de herramientas como ejecutar SQL, gestionar proyectos, migraciones, etc. directamente en tu Supabase.

## Notas
- El paquete oficial `@supabase/mcp-supabase` tiene un modo `--read-only` si en el futuro querés que solo pueda leer; por ahora queda con acceso completo como pediste.
- Opcional: `--project-ref` para limitarlo a un solo proyecto de Supabase en vez de toda tu cuenta.
- El plan del fix del logout (redirigir a `/` tras `signOut` en `FloatingNav.tsx`) sigue pendiente de tu aprobación — lo podemos hacer en cuanto apruebes.