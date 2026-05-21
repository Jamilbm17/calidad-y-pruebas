import { useQuery } from "@tanstack/react-query"
import { enviosService } from "../services/envios"

export function useGetEnvio(codigo: string) {
  return useQuery({
    queryKey: ["envio", codigo],
    queryFn: () => enviosService.getByCode(codigo),
    enabled: !!codigo,
  })
}
