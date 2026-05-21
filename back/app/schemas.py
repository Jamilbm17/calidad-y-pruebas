from datetime import datetime
from typing import Optional

from pydantic import BaseModel


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
