"""
Configuración compartida de pytest para toda la suite de pruebas.

Define la base de datos en memoria y el override de get_db UNA SOLA VEZ
para evitar conflictos entre módulos de prueba.
"""

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app import models
from app.database import get_db
from main import app

TEST_DB_URL = "sqlite:///:memory:"

test_engine = create_engine(
    TEST_DB_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


# Override registrado una única vez al importar conftest
app.dependency_overrides[get_db] = override_get_db


@pytest.fixture(autouse=True, scope="session")
def setup_database():
    """Crea las tablas al inicio de la sesión y las elimina al finalizar."""
    models.Base.metadata.create_all(bind=test_engine)
    yield
    models.Base.metadata.drop_all(bind=test_engine)
