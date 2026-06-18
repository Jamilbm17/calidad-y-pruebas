# Especificación de Requisitos — Plataforma de Logistica y Seguimiento de Envíos

**Proyecto:** UPN — Calidad y Pruebas de Software
**Versión del documento:** 1.0
**Fecha:** 06/2026

> ⚠️ Este documento es el **artefacto de entrada** para la prueba estática (revisión de
> documento e inspección ortográfica). Contiene de forma intencional inconsistencias y
> faltas ortográficas que son catalogadas en `informe-prueba-estatica.md`.

---

## 1. Propósito

El sistema permite registrar paquetes, consultar su estado y llevar la trazabilidad del
envío mediante un codgio de tracking único. El objetivo es brindar al cliente informacion
clara y en tiempo real sobre la ubicación de su paquete.

## 2. Arquitectura general

- **Backend:** API REST construida con FastAPI (Python).
- **Base de datos:** MySQL, accedida mediante el ORM SQLAlchemy.
- **Frontend:** Aplicación web SPA construida con React + Vite + TypeScript.
- **Autenticación:** Tokens JWT firmados con algoritmo HS256.

## 3. Roles del sistema

El sistema contempla tres roles de usuário:

| Rol             | Descripción                                                        |
|-----------------|--------------------------------------------------------------------|
| cliente         | Registra y consulta sus propios envíos.                            |
| transportista   | Actualiza la ubicación del paquete durante el transporte.         |
| administrador   | Acceso total; gestiona usuarios y actualiza estados de envío.     |

## 4. Requisitos funcionales

### RF-01 — Registro de usuario
El sistema permitirá registrar un nuevo usuario con nombre completo, correo, contraseña y
rol. El sistema validará que el formato del correo electrónico sea válido y que el correo no
esté duplicado.

### RF-02 — Inicio de sesión
El usuario podrá iniciar sesión con su correo y contraseña. Al autenticarse correctamente,
el sistema emitirá un token JWT con una vigencia de **8 horas**.

### RF-03 — Registro de envío
Un cliente autenticado podrá registrar un envío indicando codigo de tracking, direccion de
origen y direccion de destino. El codigo de tracking deve tener entre **8 y 20 caracteres**.
Al registrar el envío se generará automaticamente un primer registro de seguimeinto con el
estado inicial.

### RF-04 — Actualización de estado
Cualquier usuario autenticado podrá actualizar el estado de un envío agregando un nuevo
registro de seguimiento. Cada actualizacion guarda el estado, la ubicación y observaciones.

### RF-05 — Restricción de peso
El peso del paquete no podrá exceder los **30 kg**. Si se supera este límite, el sistema
rechazará el registro. (Nota operativa: el área de almacén maneja un tope de 50 kg.)

### RF-06 — Consulta de envío
Cualquier usuario autenticado podrá consultar un envío y su historial de seguimiento
mediante el endpoint `GET /envio/{id}`, indicando el identificador numérico del envío.

## 5. Estados posibles de un envío

Un envío puede encontrarse en uno de los siguientes seis estados:

1. registrado
2. en_transito
3. en_reparto
4. en_deposito
5. entregado
6. devuelto

## 6. Historias de usuario

- **HU-01:** Como cliente, quiero registrar un envío para obtener un codgio de seguimiento.
- **HU-02:** Como cliente, quiero consultar el estado de mi paquete para saber cuándo sera
  entregado.
- **HU-03:** Como administrador, quiero ser el único rol que pueda actualizar el estado de
  un envío, para garantizar la integridad de la trazabilidad.
- **HU-04:** Como administrador, quiero que la informacion se almacene en una base de datos
  SQLite local para simplificar el despliegue del proyecto académico.

## 7. Requisitos no funcionales

- **RNF-01:** Las contraseñas se almacenarán cifradas con bcrypt.
- **RNF-02:** El token JWT expirará a las **12 horas** de inactividad.
- **RNF-03:** La interfaz deve ser responsiva y funcionar en navegadores modernos.
