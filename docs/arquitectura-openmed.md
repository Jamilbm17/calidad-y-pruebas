# Arquitectura de Tres Capas de la Plataforma OpenMed

---

```
╔══════════════════════════════════════════════════════════════════════════════════╗
║                          PLATAFORMA  OpenMed                                   ║
╚══════════════════════════════════════════════════════════════════════════════════╝


 ┌──────────────────────────────────────────────────────────────────────────────┐
 │                        CAPA 1 — PRESENTACIÓN                                 │
 │                          Frontend / Cliente Web                               │
 │                                                                              │
 │   ┌─────────────────────┐          ┌─────────────────────┐                  │
 │   │      React 19       │          │    TypeScript 5      │                  │
 │   │  Componentes / UI   │          │   Tipado estático    │                  │
 │   └─────────────────────┘          └─────────────────────┘                  │
 │                                                                              │
 │   ┌─────────────────────┐          ┌─────────────────────┐                  │
 │   │    Tailwind CSS     │          │       Vite           │                  │
 │   │      Estilos        │          │   Build / Dev server │                  │
 │   └─────────────────────┘          └─────────────────────┘                  │
 │                                                                              │
 │   ┌─────────────────────┐          ┌─────────────────────┐                  │
 │   │  TanStack Query     │          │  React Hook Form     │                  │
 │   │  Estado del server  │          │  + Zod (validación)  │                  │
 │   └─────────────────────┘          └─────────────────────┘                  │
 └──────────────────────────┬───────────────────────────────────────────────────┘
                             │
                             │   HTTP / REST  ·  JSON  ·  JWT Bearer Token
                             │
                             ▼
 ┌──────────────────────────────────────────────────────────────────────────────┐
 │                         CAPA 2 — LÓGICA DE NEGOCIO                           │
 │                              API  /  Backend                                  │
 │                                                                              │
 │   ┌─────────────────────┐          ┌─────────────────────┐                  │
 │   │      FastAPI        │          │      Pydantic 2      │                  │
 │   │   Endpoints REST    │          │  Validación / Schemas│                  │
 │   └─────────────────────┘          └─────────────────────┘                  │
 │                                                                              │
 │   ┌─────────────────────┐          ┌─────────────────────┐                  │
 │   │  JWT (python-jose)  │          │   bcrypt / Hashing   │                  │
 │   │   Autenticación     │          │  Seguridad passwords │                  │
 │   └─────────────────────┘          └─────────────────────┘                  │
 │                                                                              │
 │   ┌─────────────────────┐          ┌─────────────────────┐                  │
 │   │    SQLAlchemy 2     │          │      Uvicorn         │                  │
 │   │   ORM / Queries     │          │   Servidor ASGI      │                  │
 │   └─────────────────────┘          └─────────────────────┘                  │
 └──────────────────────────┬───────────────────────────────────────────────────┘
                             │
                             │   SQL  ·  ORM (SQLAlchemy)  ·  Consultas seguras
                             │
                             ▼
 ┌──────────────────────────────────────────────────────────────────────────────┐
 │                          CAPA 3 — DATOS                                      │
 │                         Base de Datos Relacional                              │
 │                                                                              │
 │              ┌──────────────────────────────────────────┐                   │
 │              │                  MySQL                    │                   │
 │              │          Motor de base de datos           │                   │
 │              └──────────────────────────────────────────┘                   │
 │                                                                              │
 │   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
 │   │   usuarios   │  │    envíos    │  │    rutas     │  │ seguimiento  │  │
 │   └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘  │
 │                                                                              │
 │   ┌──────────────────────────────────────────────────────────────────────┐  │
 │   │                        notificaciones                                 │  │
 │   └──────────────────────────────────────────────────────────────────────┘  │
 └──────────────────────────────────────────────────────────────────────────────┘
```

---

**Nota.** La figura muestra la comunicación entre el frontend desarrollado con React y
TypeScript, la API implementada con FastAPI y la base de datos administrada mediante
MySQL. Elaboración propia.

---

## Descripción de capas

| Capa | Tecnologías | Responsabilidad |
|---|---|---|
| **Presentación** | React 19, TypeScript, Tailwind CSS, Vite | Renderizado de la interfaz, formularios y estado del cliente |
| **Lógica de negocio** | FastAPI, Pydantic, SQLAlchemy, JWT, bcrypt | Endpoints REST, autenticación, validación y reglas de negocio |
| **Datos** | MySQL | Persistencia y consultas de datos relacionales |

## Flujo de comunicación

```
Usuario  ──►  React (SPA)  ──►  FastAPI (REST/JSON)  ──►  MySQL
         ◄──              ◄──                        ◄──
         Token JWT en cada petición HTTP (Authorization: Bearer)
```
