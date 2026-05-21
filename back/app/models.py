from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, Numeric, String, Text
from sqlalchemy.sql import func

from .database import Base


class Usuario(Base):
    __tablename__ = "Usuario"

    id_usuario = Column(Integer, primary_key=True, autoincrement=True)
    nombre_completo = Column(String(255), nullable=False)
    correo = Column(String(255), unique=True, nullable=False)
    contrasena = Column(String(255), nullable=False)
    rol = Column(String(50), nullable=False)
    telefono = Column(String(20))
    fecha_registro = Column(DateTime, server_default=func.now())


class Ruta(Base):
    __tablename__ = "Ruta"

    id_ruta = Column(Integer, primary_key=True, autoincrement=True)
    id_usuario_transportista = Column(Integer, ForeignKey("Usuario.id_usuario"))
    zona_origen = Column(String(255), nullable=False)
    zona_destino = Column(String(255), nullable=False)
    distancia_km = Column(Numeric(10, 2))
    tiempo_estimado = Column(String(100))
    estado_ruta = Column(String(50))


class Envio(Base):
    __tablename__ = "Envio"

    id_envio = Column(Integer, primary_key=True, autoincrement=True)
    codigo_tracking = Column(String(100), unique=True, nullable=False)
    id_usuario_cliente = Column(Integer, ForeignKey("Usuario.id_usuario"), nullable=False)
    id_ruta = Column(Integer, ForeignKey("Ruta.id_ruta"))
    descripcion_paquete = Column(String(255))
    peso_kg = Column(Numeric(10, 2))
    dimensiones = Column(String(100))
    direccion_origen = Column(String(255), nullable=False)
    direccion_destino = Column(String(255), nullable=False)
    fecha_creacion = Column(DateTime, server_default=func.now())


class Seguimiento(Base):
    __tablename__ = "Seguimiento"

    id_seguimiento = Column(Integer, primary_key=True, autoincrement=True)
    id_envio = Column(Integer, ForeignKey("Envio.id_envio"), nullable=False)
    estado = Column(String(50), nullable=False)
    ubicacion_actual = Column(String(255))
    fecha_hora_actualizacion = Column(DateTime, server_default=func.now())
    observaciones = Column(Text)


class Notificacion(Base):
    __tablename__ = "Notificacion"

    id_notificacion = Column(Integer, primary_key=True, autoincrement=True)
    id_usuario = Column(Integer, ForeignKey("Usuario.id_usuario"), nullable=False)
    id_envio = Column(Integer, ForeignKey("Envio.id_envio"))
    mensaje = Column(Text, nullable=False)
    tipo = Column(String(50))
    leida = Column(Boolean, default=False)
    fecha_emision = Column(DateTime, server_default=func.now())
