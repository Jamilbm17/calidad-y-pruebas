import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner"
import { queryClient } from "../lib/queryClient"
import type { CreateSeguimientoDto } from "../models/envio"
import { enviosService } from "../services/envios"

interface UseAddSeguimientoOptions {
  onSuccess?: () => void
}

export function useAddSeguimiento(codigo: string, { onSuccess }: UseAddSeguimientoOptions = {}) {
  return useMutation({
    mutationKey: ["seguimiento", "add", codigo],
    mutationFn: (data: CreateSeguimientoDto) => enviosService.addSeguimiento(codigo, data),
    onMutate: () => {
      toast.loading("Actualizando estado...", { id: "add-seguimiento" })
    },
    onSuccess: () => {
      toast.dismiss("add-seguimiento")
      toast.success("Estado actualizado correctamente")
      queryClient.invalidateQueries({ queryKey: ["envio", codigo] })
      onSuccess?.()
    },
    onError: (error: unknown) => {
      toast.dismiss("add-seguimiento")
      const detail =
        (error as { response?: { data?: { detail?: string } } })?.response?.data?.detail ??
        "Error al actualizar el estado"
      toast.error("Error", { description: detail })
    },
  })
}
