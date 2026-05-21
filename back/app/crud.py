from sqlalchemy.orm import Session

from . import models, schemas


def create_envio(db: Session, data: schemas.CreateEnvioRequest) -> models.Envio:
    envio = models.Envio(
        codigo_tracking=data.codigo_tracking,
        id_usuario_cliente=data.id_usuario_cliente,
        id_ruta=data.id_ruta,
        descripcion_paquete=data.descripcion_paquete,
        peso_kg=data.peso_kg,
        dimensiones=data.dimensiones,
        direccion_origen=data.direccion_origen,
        direccion_destino=data.direccion_destino,
    )
    db.add(envio)
    db.flush()

    seguimiento = models.Seguimiento(
        id_envio=envio.id_envio,
        estado=data.estado_inicial,
        ubicacion_actual=data.ubicacion_inicial,
    )
    db.add(seguimiento)
    db.commit()
    db.refresh(envio)
    return envio


def get_envio_by_codigo(db: Session, codigo: str) -> models.Envio | None:
    return (
        db.query(models.Envio)
        .filter(models.Envio.codigo_tracking == codigo)
        .first()
    )


def get_seguimientos(db: Session, id_envio: int) -> list[models.Seguimiento]:
    return (
        db.query(models.Seguimiento)
        .filter(models.Seguimiento.id_envio == id_envio)
        .order_by(models.Seguimiento.fecha_hora_actualizacion.desc())
        .all()
    )
