import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner"
import type { CreateEnvioDto, EnvioResponse } from "../models/envio"
import { enviosService } from "../services/envios"

interface UseMutationOptions {
  onSuccess?: (data: EnvioResponse) => void
}

export function useCreateEnvio({ onSuccess }: UseMutationOptions = {}) {
  return useMutation({
    mutationKey: ["envio", "create"],
    mutationFn: (data: CreateEnvioDto) => enviosService.create(data),
    onMutate: () => {
      toast.loading("Registrando envío...", { id: "create-envio" })
    },
    onSuccess: (data) => {
      toast.dismiss("create-envio")
      toast.success("Envío registrado correctamente", {
        description: `Código de tracking: ${data.codigo_tracking}`,
      })
      onSuccess?.(data)
    },
    onError: (error: unknown) => {
      toast.dismiss("create-envio")
      const detail =
        (error as { response?: { data?: { detail?: string } } })?.response?.data?.detail ??
        "Error al registrar el envío"
      toast.error("Error", { description: detail })
    },
  })
}
