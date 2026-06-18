-- ============================================================
--  Plataforma de Logística y Seguimiento de Envíos — UPN
--  Base de datos: SQLite  (compatible con MySQL/PostgreSQL
--  cambiando los tipos de dato indicados)
-- ============================================================

CREATE TABLE Usuario (
    id_usuario      INTEGER       PRIMARY KEY AUTOINCREMENT,
    nombre_completo VARCHAR(255)  NOT NULL,
    correo          VARCHAR(255)  NOT NULL UNIQUE,
    contrasena      VARCHAR(255)  NOT NULL,
    rol             VARCHAR(50)   NOT NULL,
    telefono        VARCHAR(20),
    fecha_registro  DATETIME      DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Ruta (
    id_ruta                  INTEGER       PRIMARY KEY AUTOINCREMENT,
    id_usuario_transportista INTEGER,
    zona_origen              VARCHAR(255)  NOT NULL,
    zona_destino             VARCHAR(255)  NOT NULL,
    distancia_km             NUMERIC(10,2),
    tiempo_estimado          VARCHAR(100),
    estado_ruta              VARCHAR(50),

    FOREIGN KEY (id_usuario_transportista) REFERENCES Usuario(id_usuario)
);

CREATE TABLE Envio (
    id_envio            INTEGER       PRIMARY KEY AUTOINCREMENT,
    codigo_tracking     VARCHAR(100)  NOT NULL UNIQUE,
    id_usuario_cliente  INTEGER       NOT NULL,
    id_ruta             INTEGER,
    descripcion_paquete VARCHAR(255),
    peso_kg             NUMERIC(10,2),
    dimensiones         VARCHAR(100),
    direccion_origen    VARCHAR(255)  NOT NULL,
    direccion_destino   VARCHAR(255)  NOT NULL,
    fecha_creacion      DATETIME      DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (id_usuario_cliente) REFERENCES Usuario(id_usuario),
    FOREIGN KEY (id_ruta)            REFERENCES Ruta(id_ruta)
);

CREATE TABLE Seguimiento (
    id_seguimiento           INTEGER      PRIMARY KEY AUTOINCREMENT,
    id_envio                 INTEGER      NOT NULL,
    estado                   VARCHAR(50)  NOT NULL,
    ubicacion_actual         VARCHAR(255),
    fecha_hora_actualizacion DATETIME     DEFAULT CURRENT_TIMESTAMP,
    observaciones            TEXT,

    FOREIGN KEY (id_envio) REFERENCES Envio(id_envio)
);

CREATE TABLE Notificacion (
    id_notificacion INTEGER     PRIMARY KEY AUTOINCREMENT,
    id_usuario      INTEGER     NOT NULL,
    id_envio        INTEGER,
    mensaje         TEXT        NOT NULL,
    tipo            VARCHAR(50),
    leida           BOOLEAN     DEFAULT FALSE,
    fecha_emision   DATETIME    DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario),
    FOREIGN KEY (id_envio)   REFERENCES Envio(id_envio)
);
