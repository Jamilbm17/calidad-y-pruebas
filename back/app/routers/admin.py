from datetime import date, datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session

from app import models
from app.auth.dependencies import get_current_user
from app.database import get_db

router = APIRouter(prefix="/admin", tags=["admin"])


def _require_admin(current_user: dict = Depends(get_current_user)) -> dict:
    if current_user.get("rol") != "admin":
        raise HTTPException(status_code=403, detail="Solo administradores pueden acceder")
    return current_user


@router.get("/stats")
def get_stats(db: Session = Depends(get_db), _: dict = Depends(_require_admin)):
    today = date.today()
    inicio_hoy = datetime.combine(today, datetime.min.time())
    inicio_mes = datetime.combine(today.replace(day=1), datetime.min.time())

    envios_hoy = db.query(models.Envio).filter(models.Envio.fecha_creacion >= inicio_hoy).count()
    envios_mes = db.query(models.Envio).filter(models.Envio.fecha_creacion >= inicio_mes).count()
    total_envios = db.query(models.Envio).count()
    clientes_activos = db.query(models.Usuario).filter(models.Usuario.rol == "cliente").count()

    subq = (
        db.query(
            models.Seguimiento.id_envio,
            func.max(models.Seguimiento.id_seguimiento).label("max_id"),
        )
        .group_by(models.Seguimiento.id_envio)
        .subquery()
    )

    en_transito = (
        db.query(models.Seguimiento)
        .join(
            subq,
            (models.Seguimiento.id_envio == subq.c.id_envio)
            & (models.Seguimiento.id_seguimiento == subq.c.max_id),
        )
        .filter(models.Seguimiento.estado == "en_transito")
        .count()
    )

    envios_por_dia = []
    for i in range(13, -1, -1):
        dia = today - timedelta(days=i)
        inicio = datetime.combine(dia, datetime.min.time())
        fin = datetime.combine(dia, datetime.max.time())
        count = (
            db.query(models.Envio)
            .filter(models.Envio.fecha_creacion >= inicio, models.Envio.fecha_creacion <= fin)
            .count()
        )
        envios_por_dia.append({"fecha": dia.strftime("%d/%m"), "total": count})

    estados_rows = (
        db.query(models.Seguimiento.estado, func.count().label("total"))
        .join(
            subq,
            (models.Seguimiento.id_envio == subq.c.id_envio)
            & (models.Seguimiento.id_seguimiento == subq.c.max_id),
        )
        .group_by(models.Seguimiento.estado)
        .all()
    )

    return {
        "envios_hoy": envios_hoy,
        "envios_mes": envios_mes,
        "total_envios": total_envios,
        "clientes_activos": clientes_activos,
        "en_transito": en_transito,
        "envios_por_dia": envios_por_dia,
        "distribucion_estados": [{"estado": r.estado, "total": r.total} for r in estados_rows],
    }


@router.get("/envios")
def list_envios(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    _: dict = Depends(_require_admin),
):
    envios = (
        db.query(models.Envio)
        .order_by(models.Envio.fecha_creacion.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )

    if not envios:
        return []

    subq = (
        db.query(
            models.Seguimiento.id_envio,
            func.max(models.Seguimiento.id_seguimiento).label("max_id"),
        )
        .group_by(models.Seguimiento.id_envio)
        .subquery()
    )
    latest_states = {
        s.id_envio: s.estado
        for s in db.query(models.Seguimiento)
        .join(
            subq,
            (models.Seguimiento.id_envio == subq.c.id_envio)
            & (models.Seguimiento.id_seguimiento == subq.c.max_id),
        )
        .all()
    }

    return [
        {
            "id_envio": e.id_envio,
            "codigo_tracking": e.codigo_tracking,
            "descripcion_paquete": e.descripcion_paquete,
            "direccion_origen": e.direccion_origen,
            "direccion_destino": e.direccion_destino,
            "peso_kg": float(e.peso_kg) if e.peso_kg is not None else None,
            "fecha_creacion": e.fecha_creacion.isoformat() if e.fecha_creacion else None,
            "estado_actual": latest_states.get(e.id_envio),
            "id_usuario_cliente": e.id_usuario_cliente,
        }
        for e in envios
    ]


@router.get("/clientes")
def list_clientes(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    _: dict = Depends(_require_admin),
):
    usuarios = (
        db.query(models.Usuario)
        .filter(models.Usuario.rol.in_(["cliente", "transportista"]))
        .order_by(models.Usuario.fecha_registro.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )

    envio_counts = {
        row.id_usuario_cliente: row.total
        for row in db.query(
            models.Envio.id_usuario_cliente,
            func.count(models.Envio.id_envio).label("total"),
        )
        .group_by(models.Envio.id_usuario_cliente)
        .all()
    }

    return [
        {
            "id_usuario": u.id_usuario,
            "nombre_completo": u.nombre_completo,
            "correo": u.correo,
            "rol": u.rol,
            "telefono": u.telefono,
            "fecha_registro": u.fecha_registro.isoformat() if u.fecha_registro else None,
            "total_envios": envio_counts.get(u.id_usuario, 0),
        }
        for u in usuarios
    ]


@router.get("/seguimientos")
def list_seguimientos(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    _: dict = Depends(_require_admin),
):
    seguimientos = (
        db.query(models.Seguimiento)
        .order_by(models.Seguimiento.fecha_hora_actualizacion.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )

    if not seguimientos:
        return []

    envio_ids = list({s.id_envio for s in seguimientos})
    tracking_map = {
        e.id_envio: e.codigo_tracking
        for e in db.query(models.Envio).filter(models.Envio.id_envio.in_(envio_ids)).all()
    }

    return [
        {
            "id_seguimiento": s.id_seguimiento,
            "id_envio": s.id_envio,
            "codigo_tracking": tracking_map.get(s.id_envio, ""),
            "estado": s.estado,
            "ubicacion_actual": s.ubicacion_actual,
            "fecha_hora_actualizacion": (
                s.fecha_hora_actualizacion.isoformat() if s.fecha_hora_actualizacion else None
            ),
            "observaciones": s.observaciones,
        }
        for s in seguimientos
    ]
