"""
Casos de prueba adicionales — Validaciones y cobertura extendida.

Complementa test_envios.py con:
  - Endpoint de salud (health check)
  - Datos de respuesta en auth (nombre, rol)
  - JWT inválido / malformado
  - Campos obligatorios faltantes en /envios
  - Reglas de negocio: estado inválido, peso negativo, código vacío  ← bugs a corregir
  - Payload mínimo (solo campos requeridos)
  - Verificación de campo peso_kg en respuesta

Ejecutar desde la carpeta back/:
    pytest
"""

import pytest
from fastapi.testclient import TestClient

from main import app

client = TestClient(app)

# ── Fixtures ──────────────────────────────────────────────────────────────────
@pytest.fixture(scope="module")
def auth_token() -> str:
    client.post(
        "/auth/register",
        json={
            "nombre_completo": "Validador UPN",
            "correo": "validador@upn.pe",
            "contrasena": "Valid1234",
            "rol": "admin",
        },
    )
    response = client.post(
        "/auth/login",
        json={"correo": "validador@upn.pe", "contrasena": "Valid1234"},
    )
    return response.json()["access_token"]


@pytest.fixture(scope="module")
def auth_headers(auth_token: str) -> dict:
    return {"Authorization": f"Bearer {auth_token}"}


# ── Payload base ──────────────────────────────────────────────────────────────
BASE_PAYLOAD = {
    "codigo_tracking": "VAL-BASE-001",
    "id_usuario_cliente": 1,
    "descripcion_paquete": "Caja de prueba de validación",
    "peso_kg": 1.5,
    "dimensiones": "20x15x10 cm",
    "direccion_origen": "Av. Lima 100, Lima",
    "direccion_destino": "Jr. Trujillo 200, Trujillo",
    "estado_inicial": "registrado",
    "ubicacion_inicial": "Almacén Central Lima",
}


# ── 1. Health check ───────────────────────────────────────────────────────────
def test_health_check_retorna_ok():
    """GET / debe retornar HTTP 200 con status 'ok'."""
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


# ── 2. Auth — datos de respuesta ──────────────────────────────────────────────
def test_register_retorna_nombre_correo_y_rol():
    """El registro debe devolver nombre_completo, correo y rol junto con el token."""
    response = client.post(
        "/auth/register",
        json={
            "nombre_completo": "Ana Torres",
            "correo": "ana.torres@upn.pe",
            "contrasena": "Ana12345",
            "rol": "cliente",
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert data["nombre_completo"] == "Ana Torres"
    assert data["correo"] == "ana.torres@upn.pe"
    assert data["rol"] == "cliente"


def test_login_retorna_nombre_correo_y_rol():
    """El login debe devolver nombre_completo, correo y rol junto con el token."""
    response = client.post(
        "/auth/login",
        json={"correo": "ana.torres@upn.pe", "contrasena": "Ana12345"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["nombre_completo"] == "Ana Torres"
    assert data["correo"] == "ana.torres@upn.pe"
    assert data["rol"] == "cliente"
    assert data["token_type"] == "bearer"


# ── 3. JWT — tokens inválidos ─────────────────────────────────────────────────
def test_token_invalido_retorna_401():
    """Un token JWT firmado con clave incorrecta debe retornar HTTP 401."""
    headers = {"Authorization": "Bearer token.invalido.firmado"}
    response = client.post("/envios", json=BASE_PAYLOAD, headers=headers)
    assert response.status_code == 401


def test_token_malformado_retorna_401():
    """Un header Authorization con texto aleatorio debe retornar HTTP 401."""
    headers = {"Authorization": "Bearer esto-no-es-un-jwt"}
    response = client.get("/envios/CUALQUIER-CODIGO", headers=headers)
    assert response.status_code == 401


# ── 4. Validación de campos obligatorios ─────────────────────────────────────
def test_crear_envio_sin_codigo_tracking_retorna_422(auth_headers: dict):
    """Omitir codigo_tracking debe retornar HTTP 422."""
    payload = {k: v for k, v in BASE_PAYLOAD.items() if k != "codigo_tracking"}
    response = client.post("/envios", json=payload, headers=auth_headers)
    assert response.status_code == 422


def test_crear_envio_sin_direccion_destino_retorna_422(auth_headers: dict):
    """Omitir direccion_destino debe retornar HTTP 422."""
    payload = {k: v for k, v in BASE_PAYLOAD.items() if k != "direccion_destino"}
    response = client.post("/envios", json=payload, headers=auth_headers)
    assert response.status_code == 422


def test_crear_envio_sin_id_usuario_retorna_422(auth_headers: dict):
    """Omitir id_usuario_cliente debe retornar HTTP 422."""
    payload = {k: v for k, v in BASE_PAYLOAD.items() if k != "id_usuario_cliente"}
    response = client.post("/envios", json=payload, headers=auth_headers)
    assert response.status_code == 422


# ── 5. Reglas de negocio — BUGs a corregir ───────────────────────────────────
def test_crear_envio_estado_invalido_retorna_422(auth_headers: dict):
    """
    Un estado_inicial fuera del dominio permitido debe retornar HTTP 422.
    BUG: sin validación, el valor se almacena sin restricción.
    Corrección: agregar field_validator en CreateEnvioRequest.
    """
    payload = {**BASE_PAYLOAD, "codigo_tracking": "VAL-ESTADO-INV", "estado_inicial": "en_vuelo"}
    response = client.post("/envios", json=payload, headers=auth_headers)
    assert response.status_code == 422


def test_crear_envio_peso_negativo_retorna_422(auth_headers: dict):
    """
    Un peso_kg negativo no tiene sentido físico y debe retornar HTTP 422.
    BUG: sin validación, valores negativos se aceptan sin error.
    Corrección: agregar field_validator gt=0 en CreateEnvioRequest.
    """
    payload = {**BASE_PAYLOAD, "codigo_tracking": "VAL-PESO-NEG", "peso_kg": -3.0}
    response = client.post("/envios", json=payload, headers=auth_headers)
    assert response.status_code == 422


def test_crear_envio_codigo_tracking_vacio_retorna_422(auth_headers: dict):
    """
    Un codigo_tracking vacío no identifica al envío y debe retornar HTTP 422.
    BUG: sin validación, la cadena vacía se acepta como clave única.
    Corrección: agregar field_validator min_length=1 en CreateEnvioRequest.
    """
    payload = {**BASE_PAYLOAD, "codigo_tracking": "   "}
    response = client.post("/envios", json=payload, headers=auth_headers)
    assert response.status_code == 422


# ── 6. Happy path extendido ───────────────────────────────────────────────────
def test_crear_envio_con_solo_campos_requeridos_retorna_201(auth_headers: dict):
    """Crear un envío con únicamente los campos obligatorios debe retornar HTTP 201."""
    payload = {
        "codigo_tracking": "VAL-MINIMO-001",
        "id_usuario_cliente": 1,
        "direccion_origen": "Av. Origen 1, Lima",
        "direccion_destino": "Av. Destino 2, Arequipa",
    }
    response = client.post("/envios", json=payload, headers=auth_headers)
    assert response.status_code == 201


def test_crear_envio_respuesta_incluye_peso_kg(auth_headers: dict):
    """El cuerpo de la respuesta debe incluir el campo peso_kg con el valor enviado."""
    payload = {**BASE_PAYLOAD, "codigo_tracking": "VAL-PESO-CHECK", "peso_kg": 4.75}
    response = client.post("/envios", json=payload, headers=auth_headers)
    assert response.status_code == 201
    assert float(response.json()["peso_kg"]) == pytest.approx(4.75)
