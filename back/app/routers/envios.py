from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import crud, schemas
from app.auth.dependencies import get_current_user
from app.database import get_db

router = APIRouter(prefix="/envios", tags=["envios"])


@router.post("", response_model=schemas.EnvioResponse, status_code=201)
def registrar_envio(
    body: schemas.CreateEnvioRequest,
    db: Session = Depends(get_db),
    _: dict = Depends(get_current_user),
):
    existing = crud.get_envio_by_codigo(db, body.codigo_tracking)
    if existing:
        raise HTTPException(status_code=409, detail="El código de tracking ya existe")

    envio = crud.create_envio(db, body)
    seguimientos = crud.get_seguimientos(db, envio.id_envio)

    response = schemas.EnvioResponse.model_validate(envio)
    response.seguimientos = [schemas.SeguimientoResponse.model_validate(s) for s in seguimientos]
    return response


@router.get("/{codigo}", response_model=schemas.EnvioResponse)
def consultar_envio(
    codigo: str,
    db: Session = Depends(get_db),
    _: dict = Depends(get_current_user),
):
    envio = crud.get_envio_by_codigo(db, codigo)
    if not envio:
        raise HTTPException(status_code=404, detail="Envío no encontrado")

    seguimientos = crud.get_seguimientos(db, envio.id_envio)

    response = schemas.EnvioResponse.model_validate(envio)
    response.seguimientos = [schemas.SeguimientoResponse.model_validate(s) for s in seguimientos]
    return response
