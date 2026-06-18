"""
Suite de pruebas unitarias con Pytest.
Valida:
  - Registro e inicio de sesión (auth).
  - Lógica de inserción de envíos.
  - Recuperación correcta de estados (registrado, en_transito, entregado, etc.).

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
    """Registra un usuario de prueba y retorna su JWT para los tests protegidos."""
    client.post(
        "/auth/register",
        json={
            "nombre_completo": "Tester UPN",
            "correo": "tester@upn.pe",
            "contrasena": "Test1234",
            "rol": "admin",
        },
    )
    response = client.post(
        "/auth/login",
        json={"correo": "tester@upn.pe", "contrasena": "Test1234"},
    )
    return response.json()["access_token"]


@pytest.fixture(scope="module")
def auth_headers(auth_token: str) -> dict:
    return {"Authorization": f"Bearer {auth_token}"}


# ── Payload base reutilizable ─────────────────────────────────────────────────
BASE_PAYLOAD = {
    "codigo_tracking": "TRK-UPN-001",
    "id_usuario_cliente": 1,
    "descripcion_paquete": "Caja con libros universitarios",
    "peso_kg": 2.5,
    "dimensiones": "30x25x10 cm",
    "direccion_origen": "Av. La Marina 1000, Lima",
    "direccion_destino": "Jr. Los Álamos 200, Trujillo",
    "estado_inicial": "registrado",
    "ubicacion_inicial": "Centro de distribución Lima Norte",
}


# ── Tests de autenticación ────────────────────────────────────────────────────
def test_register_retorna_201():
    """Registrar un usuario nuevo debe retornar HTTP 201 con un token."""
    response = client.post(
        "/auth/register",
        json={
            "nombre_completo": "Cliente UPN",
            "correo": "cliente@upn.pe",
            "contrasena": "Cliente1234",
        },
    )
    assert response.status_code == 201
    assert "access_token" in response.json()


def test_register_duplicado_retorna_409():
    """Registrar el mismo correo dos veces debe retornar HTTP 409."""
    response = client.post(
        "/auth/register",
        json={
            "nombre_completo": "Cliente UPN",
            "correo": "cliente@upn.pe",
            "contrasena": "Cliente1234",
        },
    )
    assert response.status_code == 409


def test_login_credenciales_correctas_retorna_token():
    """Login con credenciales válidas debe retornar un JWT."""
    response = client.post(
        "/auth/login",
        json={"correo": "cliente@upn.pe", "contrasena": "Cliente1234"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


def test_login_contrasena_incorrecta_retorna_401():
    """Login con contraseña incorrecta debe retornar HTTP 401."""
    response = client.post(
        "/auth/login",
        json={"correo": "cliente@upn.pe", "contrasena": "WrongPass"},
    )
    assert response.status_code == 401


def test_login_correo_inexistente_retorna_401():
    """Login con correo que no existe debe retornar HTTP 401."""
    response = client.post(
        "/auth/login",
        json={"correo": "noexiste@upn.pe", "contrasena": "cualquiera"},
    )
    assert response.status_code == 401


def test_envios_sin_token_retorna_401():
    """Acceder a /envios sin token debe retornar HTTP 401 (no autenticado)."""
    response = client.post("/envios", json=BASE_PAYLOAD)
    assert response.status_code == 401


# ── Tests de inserción ────────────────────────────────────────────────────────
def test_crear_envio_retorna_201(auth_headers: dict):
    """Insertar un envío nuevo debe retornar HTTP 201."""
    response = client.post("/envios", json=BASE_PAYLOAD, headers=auth_headers)
    assert response.status_code == 201


def test_crear_envio_contiene_codigo_tracking(auth_headers: dict):
    """El cuerpo de respuesta debe incluir el código de tracking enviado."""
    response = client.post(
        "/envios",
        json={**BASE_PAYLOAD, "codigo_tracking": "TRK-UPN-002"},
        headers=auth_headers,
    )
    assert response.json()["codigo_tracking"] == "TRK-UPN-002"


def test_crear_envio_genera_seguimiento_inicial(auth_headers: dict):
    """Al crear un envío se debe generar automáticamente un registro de seguimiento."""
    response = client.post(
        "/envios",
        json={**BASE_PAYLOAD, "codigo_tracking": "TRK-UPN-003"},
        headers=auth_headers,
    )
    assert len(response.json()["seguimientos"]) == 1


def test_crear_envio_duplicado_retorna_409(auth_headers: dict):
    """Intentar crear dos envíos con el mismo código debe retornar HTTP 409."""
    response = client.post("/envios", json=BASE_PAYLOAD, headers=auth_headers)
    assert response.status_code == 409


def test_crear_envio_sin_direccion_origen_retorna_422(auth_headers: dict):
    """Omitir campos obligatorios debe retornar HTTP 422 (Unprocessable Entity)."""
    payload = {k: v for k, v in BASE_PAYLOAD.items() if k != "direccion_origen"}
    response = client.post("/envios", json=payload, headers=auth_headers)
    assert response.status_code == 422


# ── Tests de recuperación de estados ─────────────────────────────────────────
@pytest.mark.parametrize(
    "codigo, estado",
    [
        ("TRK-STATUS-REGISTRADO", "registrado"),
        ("TRK-STATUS-EN-TRANSITO", "en_transito"),
        ("TRK-STATUS-EN-DEPOSITO", "en_deposito"),
        ("TRK-STATUS-ENTREGADO", "entregado"),
        ("TRK-STATUS-DEVUELTO", "devuelto"),
    ],
)
def test_estado_se_almacena_y_recupera_correctamente(codigo: str, estado: str, auth_headers: dict):
    """Cada estado posible debe almacenarse y recuperarse sin alteraciones."""
    client.post(
        "/envios",
        json={**BASE_PAYLOAD, "codigo_tracking": codigo, "estado_inicial": estado},
        headers=auth_headers,
    )
    response = client.get(f"/envios/{codigo}", headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["seguimientos"][0]["estado"] == estado


def test_consultar_envio_existente_retorna_datos_completos(auth_headers: dict):
    """GET /envios/{codigo} debe devolver todos los campos del envío."""
    response = client.get(f"/envios/{BASE_PAYLOAD['codigo_tracking']}", headers=auth_headers)
    assert response.status_code == 200

    data = response.json()
    assert data["codigo_tracking"] == BASE_PAYLOAD["codigo_tracking"]
    assert data["direccion_origen"] == BASE_PAYLOAD["direccion_origen"]
    assert data["direccion_destino"] == BASE_PAYLOAD["direccion_destino"]
    assert data["descripcion_paquete"] == BASE_PAYLOAD["descripcion_paquete"]


def test_consultar_envio_incluye_ubicacion_inicial(auth_headers: dict):
    """La ubicación inicial registrada debe aparecer en el primer seguimiento."""
    response = client.get(f"/envios/{BASE_PAYLOAD['codigo_tracking']}", headers=auth_headers)
    data = response.json()
    assert data["seguimientos"][0]["ubicacion_actual"] == BASE_PAYLOAD["ubicacion_inicial"]


def test_consultar_envio_inexistente_retorna_404(auth_headers: dict):
    """Buscar un código que no existe debe retornar HTTP 404."""
    response = client.get("/envios/CODIGO-QUE-NO-EXISTE", headers=auth_headers)
    assert response.status_code == 404
