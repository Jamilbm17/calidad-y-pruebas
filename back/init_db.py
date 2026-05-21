"""
Script para inicializar la base de datos logistica.db con el esquema completo.
Adaptado de MySQL a SQLite (AUTO_INCREMENT → INTEGER PRIMARY KEY AUTOINCREMENT).

Uso:
    python init_db.py
"""

import sqlite3

SQL_SCRIPT = """
CREATE TABLE IF NOT EXISTS Usuario (
    id_usuario      INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre_completo VARCHAR(255) NOT NULL,
    correo          VARCHAR(255) UNIQUE NOT NULL,
    contrasena      VARCHAR(255) NOT NULL,
    rol             VARCHAR(50)  NOT NULL,
    telefono        VARCHAR(20),
    fecha_registro  DATETIME     DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS Ruta (
    id_ruta                  INTEGER PRIMARY KEY AUTOINCREMENT,
    id_usuario_transportista INTEGER,
    zona_origen              VARCHAR(255) NOT NULL,
    zona_destino             VARCHAR(255) NOT NULL,
    distancia_km             DECIMAL(10,2),
    tiempo_estimado          VARCHAR(100),
    estado_ruta              VARCHAR(50),
    FOREIGN KEY (id_usuario_transportista) REFERENCES Usuario(id_usuario)
);

CREATE TABLE IF NOT EXISTS Envio (
    id_envio            INTEGER PRIMARY KEY AUTOINCREMENT,
    codigo_tracking     VARCHAR(100) UNIQUE NOT NULL,
    id_usuario_cliente  INTEGER NOT NULL,
    id_ruta             INTEGER,
    descripcion_paquete VARCHAR(255),
    peso_kg             DECIMAL(10,2),
    dimensiones         VARCHAR(100),
    direccion_origen    VARCHAR(255) NOT NULL,
    direccion_destino   VARCHAR(255) NOT NULL,
    fecha_creacion      DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario_cliente) REFERENCES Usuario(id_usuario),
    FOREIGN KEY (id_ruta)            REFERENCES Ruta(id_ruta)
);

CREATE TABLE IF NOT EXISTS Seguimiento (
    id_seguimiento           INTEGER PRIMARY KEY AUTOINCREMENT,
    id_envio                 INTEGER NOT NULL,
    estado                   VARCHAR(50) NOT NULL,
    ubicacion_actual         VARCHAR(255),
    fecha_hora_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    observaciones            TEXT,
    FOREIGN KEY (id_envio) REFERENCES Envio(id_envio)
);

CREATE TABLE IF NOT EXISTS Notificacion (
    id_notificacion INTEGER PRIMARY KEY AUTOINCREMENT,
    id_usuario      INTEGER NOT NULL,
    id_envio        INTEGER,
    mensaje         TEXT    NOT NULL,
    tipo            VARCHAR(50),
    leida           BOOLEAN  DEFAULT FALSE,
    fecha_emision   DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario),
    FOREIGN KEY (id_envio)   REFERENCES Envio(id_envio)
);
"""


ADMIN_CORREO = "admin@logistica.upn"
ADMIN_PASSWORD = "Admin1234"


def _hash_password(plain: str) -> str:
    import bcrypt  # noqa: PLC0415
    return bcrypt.hashpw(plain.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def seed_admin(conn: sqlite3.Connection) -> None:
    existing = conn.execute(
        "SELECT id_usuario FROM Usuario WHERE correo = ?", (ADMIN_CORREO,)
    ).fetchone()

    if existing:
        print(f"  → Usuario admin ya existe (correo: {ADMIN_CORREO}). Sin cambios.")
        return

    hashed = _hash_password(ADMIN_PASSWORD)
    conn.execute(
        """
        INSERT INTO Usuario (nombre_completo, correo, contrasena, rol)
        VALUES (?, ?, ?, ?)
        """,
        ("Administrador UPN", ADMIN_CORREO, hashed, "admin"),
    )
    conn.commit()
    print(f"  → Usuario admin creado.")
    print(f"     correo   : {ADMIN_CORREO}")
    print(f"     contraseña: {ADMIN_PASSWORD}")


def init_database(db_path: str = "logistica.db") -> None:
    conn = sqlite3.connect(db_path)
    conn.executescript(SQL_SCRIPT)
    conn.commit()
    seed_admin(conn)
    conn.close()
    print(f"Base de datos '{db_path}' inicializada correctamente.")


if __name__ == "__main__":
    init_database()
