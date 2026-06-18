# Informe de Prueba Estática

**Proyecto:** Plataforma de Logística y Seguimiento de Envíos
**Curso:** Calidad y Pruebas de Software — UPN
**Fecha:** 11/06/2026
**Técnica aplicada:** Pruebas estáticas (revisión sin ejecución del software)

---

## 1. Introducción

La **prueba estática** consiste en examinar los artefactos del proyecto (código fuente y
documentos) **sin ejecutarlos**, con el fin de detectar defectos de forma temprana. Este
informe aplica las tres modalidades de prueba estática solicitadas:

1. **Leer un código fuente buscando errores** → revisión del código del backend y frontend.
2. **Leer un documento buscando inconsistencias** → revisión de la especificación de
   requisitos (`especificacion-requisitos.md`).
3. **Corrector ortográfico / revisión de textos** → inspección ortográfica del mismo
   documento de especificación.

### Alcance

| Artefacto | Ubicación | Modalidad |
|-----------|-----------|-----------|
| Código backend (FastAPI) | `back/app/`, `back/main.py`, `back/init_db.py` | Punto 1 |
| Código frontend (React) | `front/src/` | Punto 1 |
| Especificación de requisitos | `docs/especificacion-requisitos.md` | Puntos 2 y 3 |

### Resumen de resultados

| Punto | Modalidad | Defectos encontrados |
|-------|-----------|----------------------|
| 1 | Lectura de código fuente | 11 |
| 2 | Inconsistencias en documento | 8 |
| 3 | Ortografía en documento | 10 |
| **Total** | | **29** |

### Clasificación de severidad

- **Alta:** afecta seguridad o produce comportamiento incorrecto grave.
- **Media:** defecto funcional o de validación que puede provocar datos inválidos.
- **Baja:** inconsistencia menor, mantenibilidad o estilo.
- **Informativa:** no rompe nada, pero conviene corregir.

---

## 2. PUNTO 1 — Lectura de código fuente buscando errores

Revisión manual del código (sin ejecutarlo) complementada con criterios de análisis estático
(imports sin uso, validaciones faltantes, seguridad, consistencia de contratos front/back).

| ID | Severidad | Archivo / Ubicación | Defecto |
|------|-----------|---------------------|---------|
| D-01 | **Alta** | `back/app/auth/schemas.py:15` + `router.py` (register) | Escalada de privilegios en el registro |
| D-02 | **Alta** | `back/app/auth/security.py:13` | `SECRET_KEY` con valor por defecto embebido en el código |
| D-03 | **Media** | `back/app/auth/schemas.py:3,7,12` | `EmailStr` importado pero no usado; correo no validado |
| D-04 | **Media** | `back/app/routers/envios.py:11-26` | `id_usuario_cliente` no validado ni atado al usuario autenticado |
| D-05 | **Media** | `back/app/database.py:6` | Claves foráneas no se aplican en SQLite (`PRAGMA foreign_keys` desactivado) |
| D-06 | **Baja** | `back/app/schemas.py:32` vs `front/.../EnvioForm.tsx:7` | Validación divergente de `codigo_tracking` entre front y back |
| D-07 | **Baja** | `front/src/components/EnvioForm.tsx:19` | `estado_inicial` aceptado como string libre en el esquema del front |
| D-08 | **Baja** | `front/.../EnvioTracker.tsx:46` vs `models/envio.ts:6` | `formatDate` recibe `undefined` no contemplado por su firma |
| D-09 | **Baja** | `schemas.py` / `EnvioTracker.tsx:32` / `EnvioForm.tsx:157` | Lista de estados duplicada en 3 lugares sin única fuente |
| D-10 | **Informativa** | `back/init_db.py:73,99` | Credencial de admin embebida + f-string sin placeholders (F541) |
| D-11 | **Baja** | `front/.../EnvioTracker.tsx:210` | Render condicional con número (`peso_kg && ...`) frágil ante el valor 0 |

### Detalle de los defectos principales

**D-01 — Escalada de privilegios en el registro (Alta)**
En `back/app/auth/schemas.py`, `RegisterRequest.rol` se declara como `str = "cliente"` sin
restringir los valores aceptados, y `register()` lo persiste tal cual. Un atacante puede
enviar `"rol": "admin"` en el cuerpo de `POST /auth/register` y obtener una cuenta
administradora. De hecho los tests ya se auto-registran como `admin` por esta vía
(`test_envios.py:30`). **Recomendación:** validar `rol` contra un conjunto permitido
(`{"cliente", "transportista"}`) y nunca permitir auto-asignar `admin` por la API pública.

**D-02 — `SECRET_KEY` por defecto en el código (Alta)**
`SECRET_KEY = os.environ.get("SECRET_KEY", "upn-logistica-secret-key-2025-changeme")`. Si la
variable de entorno no está definida (caso por defecto), todos los JWT se firman con una
clave pública conocida, lo que permite **falsificar tokens** y suplantar a cualquier usuario.
**Recomendación:** exigir la variable de entorno y abortar el arranque si falta.

**D-03 — `EmailStr` importado pero no usado; correo sin validar (Media)**
`schemas.py` importa `EmailStr` (línea 3) pero `correo` se tipa como `str` tanto en
`LoginRequest` como en `RegisterRequest`. Resultado: (a) import muerto que un linter marca
como `F401`; (b) se aceptan correos con formato inválido (p. ej. `"abc"`). Además contradice
el RF-01 de la especificación, que promete validar el formato del correo.
**Recomendación:** cambiar `correo: str` por `correo: EmailStr`.

**D-04 — `id_usuario_cliente` no validado (Media)**
`registrar_envio` toma `id_usuario_cliente` del cuerpo y no verifica que (a) exista en la
tabla `Usuario`, ni (b) coincida con el usuario autenticado. Un cliente puede crear envíos a
nombre de otro usuario o con un id inexistente. **Recomendación:** derivar el cliente del
token (`current_user`) o validar su existencia antes de insertar.

**D-05 — Integridad referencial no aplicada (Media)**
`init_db.py` define claves foráneas, pero SQLite **no las aplica** salvo que se ejecute
`PRAGMA foreign_keys = ON` por conexión, lo cual no se hace en `database.py`. Se pueden crear
envíos con `id_ruta` o `id_usuario_cliente` huérfanos. **Recomendación:** activar el pragma
en un *event listener* de SQLAlchemy al conectar.

**D-06 / D-07 — Inconsistencias de contrato front ↔ back (Baja)**
El front (Zod) exige `codigo_tracking` de 3 a 100 caracteres, mientras el back solo verifica
que no esté vacío; y `estado_inicial` es un string libre en el esquema del front aunque el
back valida contra `ESTADOS_VALIDOS`. Llamando a la API directamente se saltan las reglas del
front. **Recomendación:** unificar las reglas de validación en ambos extremos.

*(D-08 a D-11: defectos menores de tipado, duplicación y estilo; ver tabla.)*

---

## 3. PUNTO 2 — Lectura del documento buscando inconsistencias

Documento revisado: `docs/especificacion-requisitos.md`. Se buscaron contradicciones internas
y discrepancias entre lo documentado y lo implementado en el código.

| ID | Severidad | Ubicación en el documento | Inconsistencia |
|------|-----------|---------------------------|----------------|
| I-01 | **Alta** | §2 (MySQL) vs §6 HU-04 (SQLite) | El documento dice que la BD es **MySQL** en §2, pero **SQLite** en la HU-04. El código usa SQLite (`database.py`). |
| I-02 | **Alta** | RF-04 vs HU-03 | RF-04 dice que **cualquier usuario autenticado** puede actualizar el estado; la HU-03 dice que **solo el administrador**. El código exige rol `admin` (`envios.py:53`). Contradicción interna. |
| I-03 | **Alta** | RF-02 (8 h) vs RNF-02 (12 h) | La vigencia del token JWT es **8 horas** en RF-02 y **12 horas** en RNF-02. El código define 8 h (`security.py:15`). |
| I-04 | **Media** | §5 (lista de estados) | El documento lista **6 estados** incluyendo `en_reparto`, que **no existe** en el código (`ESTADOS_VALIDOS` tiene 5 y no incluye `en_reparto`). |
| I-05 | **Media** | RF-06 (`GET /envio/{id}`) | El endpoint documentado es `GET /envio/{id}` por **id numérico**, pero el real es `GET /envios/{codigo}` por **código de tracking** (`envios.py:29`). Ruta y parámetro incorrectos. |
| I-06 | **Media** | RF-05 (30 kg vs 50 kg) | RF-05 fija el peso máximo en **30 kg** y en la misma nota menciona **50 kg**. Además **no hay ninguna validación de peso máximo** en el código (solo se valida peso > 0). |
| I-07 | **Media** | RF-03 (8–20 caracteres) | El documento exige `codigo_tracking` de **8 a 20 caracteres**; el front exige **3 a 100** y el back solo "no vacío". Tres reglas distintas. |
| I-08 | **Baja** | §3 (3 roles) vs implementación | El documento define los roles `cliente`, `transportista` y `administrador`, pero el código solo usa `cliente` y `admin` (el rol `transportista` no se usa en ninguna parte). |

### Detalle de las inconsistencias críticas

**I-02 — ¿Quién puede actualizar el estado?**
Es la inconsistencia más peligrosa porque afecta una regla de negocio de seguridad. RF-04 e
HU-03 se contradicen entre sí, y solo una coincide con el código (HU-03 → solo admin). Un
desarrollador que implemente RF-04 al pie de la letra abriría un hueco de seguridad.
**Recomendación:** corregir RF-04 para que diga "solo el administrador", alineándolo con
HU-03 y con `envios.py`.

**I-05 — Endpoint de consulta mal documentado**
Un integrador que lea la especificación llamaría a `GET /envio/{id}` con un id numérico y
obtendría `404`. El contrato real es `GET /envios/{codigo}`. **Recomendación:** corregir la
ruta (plural) y el parámetro (código de tracking, no id).

---

## 4. PUNTO 3 — Revisión ortográfica del documento

> *"El corrector ortográfico es un testeo estático… incluso un error ortográfico puede
> cambiar la interpretación de alguna funcionalidad."*

Inspección ortográfica de `docs/especificacion-requisitos.md`.

| ID | Ubicación | Escrito (incorrecto) | Correcto |
|------|-----------|----------------------|----------|
| O-01 | Título / §1 | logistica | logística |
| O-02 | §1 | codgio | código |
| O-03 | §1 | informacion | información |
| O-04 | §3 (encabezado tabla) | usuário | usuario |
| O-05 | RF-03 | direccion | dirección |
| O-06 | RF-03 | deve | debe |
| O-07 | RF-03 | automaticamente | automáticamente |
| O-08 | RF-03 | seguimeinto | seguimiento |
| O-09 | RF-04 | actualizacion | actualización |
| O-10 | HU-02 | sera | será |

### Observación sobre impacto funcional

El punto 3 enfatiza que un error ortográfico puede **cambiar la interpretación de una
funcionalidad**. Dos casos lo ilustran:

- **O-08 (`seguimeinto`)**: una transposición de letras en un término **clave del dominio**.
  Si se usara como nombre de campo o de tabla, una búsqueda por "seguimiento" no lo
  encontraría.
- **O-02 (`codgio` de tracking)**: el "código de tracking" es el identificador único del
  envío; escribirlo mal en la documentación de la API genera confusión sobre el nombre real
  del parámetro (`codigo_tracking`).

---

## 5. Conclusiones

- La prueba estática detectó **29 defectos** sin ejecutar una sola línea: **11** en código,
  **8** inconsistencias documentales y **10** faltas ortográficas.
- Los hallazgos de mayor riesgo son de **seguridad** (D-01 escalada de privilegios, D-02
  clave secreta embebida) y de **contradicción de reglas de negocio** (I-02 quién actualiza
  el estado), todos detectables por simple lectura.
- Se confirma el valor de la técnica: defectos graves se encuentran **antes** de ejecutar
  pruebas dinámicas, reduciendo el costo de corrección.

### Prioridad de corrección sugerida

1. **Inmediata (Alta):** D-01, D-02, I-02, I-03.
2. **Corto plazo (Media):** D-03, D-04, D-05, I-01, I-04, I-05, I-06, I-07.
3. **Mantenimiento (Baja/Info):** D-06 a D-11, I-08 y todas las faltas ortográficas O-01..O-10.

---

*Informe elaborado como evidencia de la actividad de prueba estática del curso Calidad y
Pruebas de Software — UPN.*
