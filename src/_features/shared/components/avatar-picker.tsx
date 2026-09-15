"use client"

import { useRef, useState } from "react"
import { ImagePlus, Loader2, Trash2, User } from "lucide-react"

const MAX_BYTES = 5 * 1024 * 1024 // 5MB pre-compresión
const MAX_SIDE = 256 // avatarDownscale: suficiente para círculos UI, liviano en users.avatar TEXT

/** Validación pura del archivo elegido (testeable sin DOM/canvas). */
export function validateImageFile(file: File): string | null {
  if (!file.type.startsWith("image/")) return "Elegí un archivo de imagen (JPG, PNG, WebP)."
  if (file.size > MAX_BYTES) return "La foto supera 5MB. Elegí una más liviana."
  return null
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error("No se pudo leer la foto."))
    reader.readAsDataURL(file)
  })
}

/**
 * Downscale client-side a máx 256px (JPEG 0.82) para guardar el avatar como
 * dataURL directo en users.avatar — sin bucket de Storage, sin pegar links.
 */
export function downscaleToAvatar(dataUrl: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const scale = Math.min(1, MAX_SIDE / Math.max(img.width, img.height))
      const w = Math.max(1, Math.round(img.width * scale))
      const h = Math.max(1, Math.round(img.height * scale))
      const canvas = document.createElement("canvas")
      canvas.width = w
      canvas.height = h
      const ctx = canvas.getContext("2d")
      if (!ctx) {
        reject(new Error("Tu navegador no soporta procesar imágenes."))
        return
      }
      ctx.drawImage(img, 0, 0, w, h)
      resolve(canvas.toDataURL("image/jpeg", 0.82))
    }
    img.onerror = () => reject(new Error("No se pudo procesar la foto."))
    img.src = dataUrl
  })
}

/**
 * Selector de foto de perfil desde el dispositivo: preview circular +
 * "Elegir foto" + "Quitar". Reemplaza el input de URL pegada.
 */
export function AvatarPicker({
  value,
  onChange,
}: {
  value: string | null
  onChange: (v: string | null) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)

  const handleFile = async (file: File | undefined) => {
    if (!file) return
    const invalid = validateImageFile(file)
    if (invalid) {
      setError(invalid)
      return
    }
    setError(null)
    setProcessing(true)
    try {
      const raw = await readAsDataUrl(file)
      onChange(await downscaleToAvatar(raw))
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo procesar la foto.")
    } finally {
      setProcessing(false)
      // permite re-elegir el mismo archivo dos veces seguidas
      if (inputRef.current) inputRef.current.value = ""
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-3">
        <span className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-secondary">
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="Vista previa del avatar" className="h-full w-full object-cover" />
          ) : (
            <User className="h-7 w-7 text-muted-foreground" />
          )}
        </span>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={processing}
            onClick={() => inputRef.current?.click()}
            className="flex cursor-pointer items-center gap-2 rounded-md border border-border bg-background px-3 py-2 font-mono text-[11px] uppercase tracking-wider text-foreground transition-colors hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
          >
            {processing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ImagePlus className="h-4 w-4" />
            )}
            {processing ? "Procesando…" : value ? "Cambiar foto" : "Elegir foto"}
          </button>
          {value ? (
            <button
              type="button"
              disabled={processing}
              onClick={() => {
                onChange(null)
                setError(null)
              }}
              aria-label="Quitar foto"
              className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:border-destructive hover:text-destructive disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          ) : null}
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        aria-label="Elegir foto de perfil"
        className="hidden"
        onChange={(e) => void handleFile(e.target.files?.[0])}
      />
      <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
        Desde tu dispositivo · JPG/PNG/WebP · máx 5MB
      </p>
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  )
}
