from datetime import datetime
from typing import Optional

from pydantic import BaseModel, field_validator

ESTADOS_VALIDOS = {"registrado", "en_transito", "en_deposito", "entregado", "devuelto"}


class SeguimientoResponse(BaseModel):
    id_seguimiento: int
    id_envio: int
    estado: str
    ubicacion_actual: Optional[str] = None
    fecha_hora_actualizacion: Optional[datetime] = None
    observaciones: Optional[str] = None

    model_config = {"from_attributes": True}


class CreateEnvioRequest(BaseModel):
    codigo_tracking: str
    id_usuario_cliente: int
    id_ruta: Optional[int] = None
    descripcion_paquete: Optional[str] = None
    peso_kg: Optional[float] = None
    dimensiones: Optional[str] = None
    direccion_origen: str
    direccion_destino: str
    estado_inicial: str = "registrado"
    ubicacion_inicial: Optional[str] = None

    @field_validator("codigo_tracking")
    @classmethod
    def validar_codigo_tracking(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("El código de tracking no puede estar vacío")
        return v.strip()

    @field_validator("estado_inicial")
    @classmethod
    def validar_estado_inicial(cls, v: str) -> str:
        if v not in ESTADOS_VALIDOS:
            raise ValueError(
                f"Estado '{v}' no válido. Use uno de: {', '.join(sorted(ESTADOS_VALIDOS))}"
            )
        return v

    @field_validator("peso_kg")
    @classmethod
    def validar_peso_kg(cls, v: Optional[float]) -> Optional[float]:
        if v is not None and v <= 0:
            raise ValueError("El peso debe ser mayor a 0")
        return v


class CreateSeguimientoRequest(BaseModel):
    estado: str
    ubicacion_actual: Optional[str] = None
    observaciones: Optional[str] = None

    @field_validator("estado")
    @classmethod
    def validar_estado(cls, v: str) -> str:
        if v not in ESTADOS_VALIDOS:
            raise ValueError(
                f"Estado '{v}' no válido. Use uno de: {', '.join(sorted(ESTADOS_VALIDOS))}"
            )
        return v


class EnvioResponse(BaseModel):
    id_envio: int
    codigo_tracking: str
    id_usuario_cliente: int
    id_ruta: Optional[int] = None
    descripcion_paquete: Optional[str] = None
    peso_kg: Optional[float] = None
    dimensiones: Optional[str] = None
    direccion_origen: str
    direccion_destino: str
    fecha_creacion: Optional[datetime] = None
    seguimientos: list[SeguimientoResponse] = []

    model_config = {"from_attributes": True}
