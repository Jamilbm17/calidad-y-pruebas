# Plataforma de Logística y Seguimiento de Envíos

Proyecto académico para el curso **Calidad y Pruebas de Software — UPN**.  
Sistema full-stack para gestionar y rastrear envíos con autenticación por roles.

---

## Estructura de carpetas

```
CALIDAD Y PRUEBAS DE SOFTWARE/
├── back/                          # Backend (Python / FastAPI)
│   ├── app/
│   │   ├── models.py              # Modelos ORM (SQLAlchemy)
│   │   ├── schemas.py             # Esquemas de validación (Pydantic)
│   │   ├── database.py            # Configuración de la base de datos
│   │   ├── crud.py                # Operaciones CRUD
│   │   ├── auth/                  # Módulo de autenticación
│   │   │   ├── router.py          # Endpoints: login / register
│   │   │   ├── schemas.py         # Modelos de auth
│   │   │   ├── security.py        # JWT + bcrypt
│   │   │   └── dependencies.py    # Dependencia get_current_user
│   │   └── routers/
│   │       └── envios.py          # Endpoints de envíos y seguimiento
│   ├── tests/
│   │   ├── conftest.py            # Fixtures y base de datos en memoria
│   │   ├── test_envios.py         # Pruebas de integración
│   │   └── test_validaciones.py   # Pruebas de reglas de negocio
│   ├── main.py                    # Punto de entrada de la app
│   ├── init_db.py                 # Script de inicialización con datos semilla
│   ├── requirements.txt           # Dependencias Python
│   ├── pytest.ini                 # Configuración de Pytest
│   └── logistica.db               # Base de datos SQLite
│
├── front/                         # Frontend (React / TypeScript)
│   ├── src/
│   │   ├── App.tsx                # Componente raíz y manejo de auth
│   │   ├── main.tsx               # Punto de entrada React
│   │   ├── components/
│   │   │   ├── EnvioForm.tsx      # Formulario para crear envíos
│   │   │   └── EnvioTracker.tsx   # Componente de seguimiento
│   │   ├── pages/
│   │   │   ├── LoginPage.tsx      # Página de login / registro
│   │   │   └── HomePage.tsx       # Dashboard principal
│   │   └── core/
│   │       ├── lib/
│   │       │   ├── api.ts         # Instancia Axios con interceptor JWT
│   │       │   └── queryClient.ts # Cliente TanStack Query
│   │       ├── hooks/             # Custom hooks (query y mutations)
│   │       ├── services/          # Llamadas a la API (auth y envíos)
│   │       └── models/            # Interfaces TypeScript
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── .env                       # VITE_API_URL=http://localhost:8000
│
└── docs/
    ├── especificacion-requisitos.md
    └── informe-prueba-estatica.md
```

---

## Backend

| Tecnología | Versión | Uso |
|---|---|---|
| Python | 3.x | Lenguaje principal |
| FastAPI | >= 0.115 | Framework web y API REST |
| Uvicorn | >= 0.34 | Servidor ASGI |
| SQLAlchemy | >= 2.0 | ORM para la base de datos |
| SQLite | — | Base de datos local (`logistica.db`) |
| Pydantic | >= 2.0 | Validación de datos y esquemas |
| python-jose | >= 3.3 | Generación y verificación de tokens JWT |
| bcrypt | >= 4.0 | Hash de contraseñas |
| Pytest | >= 8.0 | Framework de pruebas |
| HTTPX | >= 0.28 | Cliente HTTP para pruebas de integración |

### Endpoints principales

| Método | Ruta | Descripción | Auth |
|---|---|---|---|
| POST | `/auth/register` | Registrar usuario | No |
| POST | `/auth/login` | Iniciar sesión (devuelve JWT) | No |
| POST | `/envios` | Crear envío | Usuario |
| GET | `/envios/{codigo}` | Consultar envío por código | Usuario |
| POST | `/envios/{codigo}/seguimientos` | Agregar actualización de estado | Admin |

### Roles del sistema

- **cliente** — crea y consulta sus envíos
- **transportista** — gestiona rutas
- **admin** — agrega actualizaciones de seguimiento

### Credenciales de administrador por defecto

```
Email:     admin@logistica.upn
Password:  Admin1234
```

---

## Frontend

| Tecnología | Versión | Uso |
|---|---|---|
| React | 19.0.0 | Framework UI |
| TypeScript | 5.8.3 | Tipado estático |
| Vite | 6.3.3 | Build tool y dev server |
| Tailwind CSS | 4.1.5 | Estilos utilitarios |
| Axios | 1.8.4 | Cliente HTTP con interceptor JWT |
| TanStack Query | 5.64.2 | Gestión de estado del servidor |
| React Hook Form | 7.56.0 | Manejo de formularios |
| Zod | 3.24.2 | Validación de esquemas en formularios |
| Sonner | 2.0.1 | Notificaciones toast |
| pnpm | — | Gestor de paquetes |

### Flujo de datos

1. El usuario inicia sesión → el token JWT se guarda en `localStorage`.
2. El interceptor de Axios adjunta `Authorization: Bearer <token>` a cada petición.
3. TanStack Query gestiona el estado asíncrono de los envíos.
4. React Hook Form + Zod validan los formularios antes de enviar datos.
5. Sonner muestra notificaciones de éxito o error al usuario.

---

## Cómo ejecutar el proyecto

### Backend

```bash
cd back
pip install -r requirements.txt
python init_db.py        # inicializar BD con datos semilla
uvicorn main:app --reload
# API disponible en http://localhost:8000
```

### Frontend

```bash
cd front
pnpm install
pnpm dev
# App disponible en http://localhost:5173
```

### Pruebas del backend

```bash
cd back
pytest
```

---

## Base de datos

El esquema cuenta con 5 tablas principales:

| Tabla | Descripción |
|---|---|
| `usuario` | Usuarios con roles (cliente, transportista, admin) |
| `ruta` | Rutas entre zonas con distancia y tiempo estimado |
| `envio` | Envíos con código de tracking único |
| `seguimiento` | Historial de estados de cada envío |
| `notificacion` | Notificaciones generadas para usuarios |

Estados válidos de seguimiento: `registrado` · `en_transito` · `en_deposito` · `entregado` · `devuelto`
