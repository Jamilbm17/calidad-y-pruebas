from typing import Optional

from pydantic import BaseModel, EmailStr


class LoginRequest(BaseModel):
    correo: str
    contrasena: str


class RegisterRequest(BaseModel):
    nombre_completo: str
    correo: str
    contrasena: str
    rol: str = "cliente"
    telefono: Optional[str] = None


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    id_usuario: int
    nombre_completo: str
    correo: str
    rol: str
