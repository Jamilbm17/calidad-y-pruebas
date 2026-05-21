from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.auth.schemas import LoginRequest, RegisterRequest, TokenResponse
from app.auth.security import create_access_token, hash_password, verify_password
from app.database import get_db
from app.models import Usuario

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=TokenResponse)
def login(body: LoginRequest, db: Session = Depends(get_db)):
    user: Usuario | None = db.query(Usuario).filter(Usuario.correo == body.correo).first()

    if not user or not verify_password(body.contrasena, user.contrasena):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Correo o contraseña incorrectos",
        )

    token = create_access_token(subject=user.correo, rol=user.rol)
    return TokenResponse(
        access_token=token,
        id_usuario=user.id_usuario,
        nombre_completo=user.nombre_completo,
        correo=user.correo,
        rol=user.rol,
    )


@router.post("/register", response_model=TokenResponse, status_code=201)
def register(body: RegisterRequest, db: Session = Depends(get_db)):
    existing = db.query(Usuario).filter(Usuario.correo == body.correo).first()
    if existing:
        raise HTTPException(status_code=409, detail="El correo ya está registrado")

    user = Usuario(
        nombre_completo=body.nombre_completo,
        correo=body.correo,
        contrasena=hash_password(body.contrasena),
        rol=body.rol,
        telefono=body.telefono,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token(subject=user.correo, rol=user.rol)
    return TokenResponse(
        access_token=token,
        id_usuario=user.id_usuario,
        nombre_completo=user.nombre_completo,
        correo=user.correo,
        rol=user.rol,
    )
