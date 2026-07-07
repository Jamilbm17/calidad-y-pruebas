"""
Script de datos de prueba para OpenMed Logistics.
Ejecutar desde el directorio back/:  python seed.py
"""
from datetime import datetime, timedelta
from app.database import SessionLocal, engine
from app import models
from app.auth.security import hash_password

models.Base.metadata.create_all(bind=engine)

# ── Correos (usados en multiples tablas) ───────────────────────────────────────
ADMIN       = "admin@logistica.upn"
C_CARLOS    = "carlos.mendoza@gmail.com"
C_MARIA     = "maria.flores@outlook.com"
C_JOSE      = "jose.quispe@yahoo.com"
C_LUCIA     = "lucia.torres@gmail.com"
C_ROBERTO   = "roberto.salas@gmail.com"
T_JUAN      = "juan.huanca@logistica.upn"
T_ROSA      = "rosa.mamani@logistica.upn"

# ── Ubicaciones frecuentes ─────────────────────────────────────────────────────
UB_MIRAFLORES   = "Lima, Miraflores"
UB_LURIN        = "Lima, Lurin"
UB_MOLLENDO     = "Arequipa, Cercado"
UB_SAN_ISIDRO   = "Lima, San Isidro"


def run():
    db = SessionLocal()
    try:
        _seed_usuarios(db)
        _seed_rutas(db)
        _seed_envios(db)
        _seed_seguimientos(db)
        _seed_notificaciones(db)
        db.commit()
        print("\n[OK] Seed completado correctamente.\n")
        _print_credentials()
    except Exception as exc:
        db.rollback()
        print(f"\n[ERROR] {exc}")
        raise
    finally:
        db.close()


# ── Helpers ────────────────────────────────────────────────────────────────────

def _exists(db, model, **kwargs):
    return db.query(model).filter_by(**kwargs).first()

def _ago(days=0, hours=0):
    return datetime.now() - timedelta(days=days, hours=hours)


# ── Usuarios ───────────────────────────────────────────────────────────────────

USUARIOS = [
    # (rol, nombre_completo, correo, telefono, password)
    ("admin",         "Admin Sistema",         ADMIN,    "01-6234500", "Admin1234"),
    ("cliente",       "Carlos Mendoza Ruiz",   C_CARLOS, "987654321",  "Cliente123"),
    ("cliente",       "Maria Flores Vega",     C_MARIA,  "976543210",  "Cliente123"),
    ("cliente",       "Jose Quispe Huanca",    C_JOSE,   "965432109",  "Cliente123"),
    ("cliente",       "Lucia Torres Paredes",  C_LUCIA,  "954321098",  "Cliente123"),
    ("cliente",       "Roberto Salas Cano",    C_ROBERTO,"943210987",  "Cliente123"),
    ("transportista", "Juan Huanca Mamani",    T_JUAN,   "932109876",  "Trans1234"),
    ("transportista", "Rosa Mamani Condori",   T_ROSA,   "921098765",  "Trans1234"),
]

def _seed_usuarios(db):
    for rol, nombre, correo, telefono, pwd in USUARIOS:
        if not _exists(db, models.Usuario, correo=correo):
            db.add(models.Usuario(
                nombre_completo=nombre,
                correo=correo,
                contrasena=hash_password(pwd),
                rol=rol,
                telefono=telefono,
                fecha_registro=_ago(days=60),
            ))
    db.flush()
    print("  [OK] Usuarios")


# ── Rutas ──────────────────────────────────────────────────────────────────────

RUTAS_DATA = [
    # (transportista, origen, destino, km, tiempo, estado)
    (T_JUAN, "Lima - Miraflores",  "Arequipa - Cercado",  1008, "14 h", "activa"),
    (T_JUAN, "Lima - San Isidro",  "Cusco - Centro",      1172, "20 h", "activa"),
    (T_ROSA, "Lima - Callao",      "Trujillo - Centro",    561, "8 h",  "activa"),
    (T_ROSA, "Arequipa - Cercado", "Puno - Centro",        291, "5 h",  "activa"),
    (T_JUAN, "Lima - Ate",         "Huancayo - El Tambo",  302, "6 h",  "activa"),
    (T_ROSA, "Lima - San Borja",   "Ica - Centro",         303, "4 h",  "activa"),
]

def _seed_rutas(db):
    for correo, origen, destino, km, tiempo, estado in RUTAS_DATA:
        if not _exists(db, models.Ruta, zona_origen=origen, zona_destino=destino):
            trans = _exists(db, models.Usuario, correo=correo)
            db.add(models.Ruta(
                id_usuario_transportista=trans.id_usuario if trans else None,
                zona_origen=origen,
                zona_destino=destino,
                distancia_km=km,
                tiempo_estimado=tiempo,
                estado_ruta=estado,
            ))
    db.flush()
    print("  [OK] Rutas")


# ── Envios ─────────────────────────────────────────────────────────────────────

ENVIOS_DATA = [
    # (codigo, cliente, ruta_idx, descripcion, peso, dim, origen, destino, dias_atras)
    ("TRK-2025-001", C_CARLOS,  1, "Documentos notariales",      0.5, "30x20x5 cm",  "Av. Larco 800, Miraflores",          "Av. Salaverry 300, Arequipa",    14),
    ("TRK-2025-002", C_MARIA,   2, "Laptop y accesorios",        2.8, "45x35x15 cm", "Av. Javier Prado 1200, San Isidro",  "Jr. Maruri 120, Cusco",          11),
    ("TRK-2025-003", C_JOSE,    3, "Medicamentos refrigerados",  1.2, "40x30x20 cm", "Jr. Manco Capac 450, Callao",        "Av. Espana 550, Trujillo",        9),
    ("TRK-2025-004", C_LUCIA,   4, "Artesanias de ceramica",     4.5, "50x40x30 cm", "Av. Salaverry 300, Arequipa",        "Jr. Lima 200, Puno",              7),
    ("TRK-2025-005", C_ROBERTO, 5, "Ropa deportiva",             3.0, "60x50x20 cm", "Av. Separadora Industrial, Ate",     "Jr. Ancash 100, Huancayo",        5),
    ("TRK-2025-006", C_CARLOS,  6, "Electrodomesticos",          8.0, "70x60x50 cm", "Av. San Borja Norte 500",            "Av. Municipalidad 300, Ica",      4),
    ("TRK-2025-007", C_MARIA,   1, "Libros universitarios",      3.5, "40x30x25 cm", "Jr. Schell 310, Miraflores",         "Calle Lima 450, Arequipa",        3),
    ("TRK-2025-008", C_JOSE,    2, "Equipos de laboratorio",     6.0, "80x60x40 cm", "Av. Rivera Navarrete 900, San Isidro","Av. Cultura 800, Cusco",         2),
    ("TRK-2025-009", C_LUCIA,   3, "Partes de bicicleta",        2.2, "90x20x20 cm", "Av. Argentina 2800, Callao",         "Av. America Sur 600, Trujillo",   1),
    ("TRK-2025-010", C_ROBERTO, 6, "Materiales de oficina",      1.8, "35x25x15 cm", "Jr. Comandante Espinar 155, Miraflores","Jr. Bolivar 200, Ica",         0),
    ("TRK-2025-011", C_CARLOS,  5, "Repuestos automotrices",     5.5, "60x40x30 cm", "Av. Nicolas Arriola 220, Ate",       "Av. Ferrocarril 450, Huancayo",   0),
    ("TRK-2025-012", C_MARIA,   4, "Instrumentos musicales",     3.8, "100x40x30 cm","Av. Conquistadores 1140, San Isidro","Jr. Deustua 340, Puno",           6),
]

def _seed_envios(db):
    rutas = db.query(models.Ruta).order_by(models.Ruta.id_ruta).all()
    ruta_map = {i + 1: r.id_ruta for i, r in enumerate(rutas)}

    for codigo, correo, ruta_idx, desc, peso, dim, origen, destino, dias in ENVIOS_DATA:
        if not _exists(db, models.Envio, codigo_tracking=codigo):
            cliente = _exists(db, models.Usuario, correo=correo)
            db.add(models.Envio(
                codigo_tracking=codigo,
                id_usuario_cliente=cliente.id_usuario,
                id_ruta=ruta_map.get(ruta_idx),
                descripcion_paquete=desc,
                peso_kg=peso,
                dimensiones=dim,
                direccion_origen=origen,
                direccion_destino=destino,
                fecha_creacion=_ago(days=dias, hours=8),
            ))
    db.flush()
    print("  [OK] Envios")


# ── Seguimientos ───────────────────────────────────────────────────────────────

# (codigo_tracking, [(estado, ubicacion, observacion, dias, horas)])
SEGUIMIENTOS_DATA = [
    ("TRK-2025-001", [
        ("registrado",  UB_MIRAFLORES,          "Paquete recibido en oficina Miraflores",              14, 8),
        ("en_transito", UB_LURIN,               "Salio del centro de distribucion Lima Sur",           13, 18),
        ("en_deposito", "Ica, Deposito Central","Parada tecnica en deposito Ica",                      12, 10),
        ("en_transito", "Nazca, Punto Control", "Retomando ruta hacia Arequipa",                       11, 6),
        ("entregado",   UB_MOLLENDO,            "Entregado a Carlos Mendoza, firma conforme",          10, 14),
    ]),
    ("TRK-2025-002", [
        ("registrado",  UB_SAN_ISIDRO,          "Paquete registrado con seguro de contenido",         11, 9),
        ("en_transito", "Lima, La Molina",       "En camino al deposito de salida Lima Este",          10, 20),
        ("en_deposito", "Abancay, Deposito",     "Revision aduanera completada sin observaciones",      9, 7),
        ("en_transito", "Cusco, Urcos",          "A 40 km del destino, estimado 1 hora",                8, 16),
        ("entregado",   "Cusco, Centro",         "Recibido por Maria Flores en domicilio",              8, 18),
    ]),
    ("TRK-2025-003", [
        ("registrado",  "Lima, Callao",          "Ingresado al sistema con cadena de frio",             9, 7),
        ("en_transito", "Lima, Independencia",   "Salida programada via Panamericana Norte",            8, 19),
        ("en_deposito", "Chimbote, Terminal",    "Almacenado en camara fria, temperatura OK",           7, 8),
        ("entregado",   "Trujillo, Centro",      "Entregado a farmacia receptora, temperatura OK",      6, 12),
    ]),
    ("TRK-2025-004", [
        ("registrado",  UB_MOLLENDO,            "Embalaje especial para ceramicas fragiles",            7, 9),
        ("en_transito", "Juliaca, Carretera",   "Transito por ruta Juliaca-Puno",                      6, 15),
        ("en_deposito", "Puno, Terminal",       "Pendiente de recojo por destinatario",                 5, 10),
        ("entregado",   "Puno, Centro",         "Entregado, embalaje intacto sin roturas",              5, 16),
    ]),
    ("TRK-2025-005", [
        ("registrado",  "Lima, Ate",             "Paquete sellado y etiquetado",                        5, 8),
        ("en_transito", "Lima, Carretera Central","Avanzando por la Carretera Central",                 4, 22),
        ("en_transito", "Ticlio, Control",       "Cruce de control en altura 4818 msnm",               4, 16),
        ("en_deposito", "Huancayo, Deposito",    "En espera de ventana de entrega manana",              3, 11),
        ("entregado",   "Huancayo, El Tambo",    "Entregado en domicilio, firma conforme",              2, 15),
    ]),
    ("TRK-2025-006", [
        ("registrado",  "Lima, San Borja",       "Electrodomestico embalado con espuma protectora",     4, 10),
        ("en_transito", UB_LURIN,               "Salida rumbo a Ica via Panamericana Sur",              3, 20),
        ("en_deposito", "Chincha, Deposito",     "Parada programada en Chincha",                        2, 14),
        ("entregado",   "Ica, Centro",           "Entregado e instalado en domicilio",                  1, 17),
    ]),
    ("TRK-2025-007", [
        ("registrado",  UB_MIRAFLORES,           "Caja de libros, 3.5 kg, 4 volumenes",                3, 9),
        ("en_transito", UB_LURIN,               "En transito por Panamericana Sur",                    2, 18),
        ("en_deposito", "Ica, Deposito",         "Parada tecnica, continua manana",                    1, 12),
        ("en_transito", "Nazca, Bypass",         "Reanudando viaje hacia Arequipa",                    1, 6),
    ]),
    ("TRK-2025-008", [
        ("registrado",  UB_SAN_ISIDRO,          "Equipos fragiles, manipulacion especial",             2, 8),
        ("en_transito", "Lima, La Molina",       "Cargado en unidad climatizada",                      1, 20),
    ]),
    ("TRK-2025-009", [
        ("registrado",  "Lima, Callao",          "Piezas de bicicleta MTB, peso verificado",           1, 9),
        ("en_transito", "Lima, Independencia",   "Salida via Panamericana Norte, ETA 8h",              0, 18),
    ]),
    ("TRK-2025-010", [
        ("registrado",  UB_MIRAFLORES,           "Material de oficina, urgente",                       0, 10),
    ]),
    ("TRK-2025-011", [
        ("registrado",  "Lima, Ate",             "Repuestos para taller mecanico",                     0, 9),
    ]),
    ("TRK-2025-012", [
        ("registrado",  UB_SAN_ISIDRO,          "Guitarra y estuche protector",                        6, 10),
        ("en_transito", UB_MOLLENDO,            "En transito por ruta Arequipa-Puno",                  5, 14),
        ("devuelto",    UB_MOLLENDO,            "Destinatario ausente, retorno por falta de recojo",   4, 9),
    ]),
]

def _seed_seguimientos(db):
    envio_map = {e.codigo_tracking: e.id_envio
                 for e in db.query(models.Envio).all()}

    for codigo, eventos in SEGUIMIENTOS_DATA:
        id_envio = envio_map.get(codigo)
        if not id_envio:
            continue
        for estado, ubicacion, obs, dias, horas in eventos:
            ya = db.query(models.Seguimiento).filter_by(
                id_envio=id_envio, estado=estado, ubicacion_actual=ubicacion
            ).first()
            if not ya:
                db.add(models.Seguimiento(
                    id_envio=id_envio,
                    estado=estado,
                    ubicacion_actual=ubicacion,
                    observaciones=obs,
                    fecha_hora_actualizacion=_ago(days=dias, hours=horas),
                ))
    db.flush()
    print("  [OK] Seguimientos")


# ── Notificaciones ─────────────────────────────────────────────────────────────

# (correo, codigo_tracking|None, mensaje, tipo, leida, dias)
NOTIFICACIONES_DATA = [
    (C_CARLOS,  "TRK-2025-001", "Tu envio TRK-2025-001 fue entregado correctamente en Arequipa.",        "entrega",    True,  10),
    (C_CARLOS,  "TRK-2025-006", "Tu envio TRK-2025-006 ha sido entregado e instalado.",                  "entrega",    True,   1),
    (C_CARLOS,  "TRK-2025-011", "Tu envio TRK-2025-011 ha sido registrado y sera procesado pronto.",     "registro",   False,  0),
    (C_MARIA,   "TRK-2025-002", "Envio TRK-2025-002 entregado en Cusco. Gracias por usar OpenMed.",      "entrega",    True,   8),
    (C_MARIA,   "TRK-2025-007", "Tu envio TRK-2025-007 esta en deposito en Ica, continua manana.",       "deposito",   False,  1),
    (C_JOSE,    "TRK-2025-003", "Envio TRK-2025-003 entregado en Trujillo con cadena de frio OK.",       "entrega",    True,   6),
    (C_JOSE,    "TRK-2025-008", "Tu envio TRK-2025-008 salio de Lima hacia Cusco.",                      "transito",   False,  1),
    (C_LUCIA,   "TRK-2025-004", "Envio TRK-2025-004 entregado en Puno, ceramicas intactas.",             "entrega",    True,   5),
    (C_LUCIA,   "TRK-2025-009", "Tu envio TRK-2025-009 esta en camino a Trujillo, ETA 8h.",              "transito",   False,  0),
    (C_ROBERTO, "TRK-2025-005", "Envio TRK-2025-005 entregado en Huancayo correctamente.",               "entrega",    True,   2),
    (C_ROBERTO, "TRK-2025-010", "Tu envio TRK-2025-010 ha sido registrado.",                             "registro",   False,  0),
    (C_MARIA,   "TRK-2025-012", "Envio TRK-2025-012 devuelto por ausencia del destinatario.",            "devolucion", False,  4),
    (ADMIN,     "TRK-2025-012", "Alerta: devolucion TRK-2025-012 por destinatario ausente en Puno.",     "alerta",     False,  4),
    (ADMIN,     None,           "Sistema actualizado a v1.0.0. Nuevas rutas disponibles.",               "sistema",    True,  30),
]

def _seed_notificaciones(db):
    usuarios = {u.correo: u.id_usuario for u in db.query(models.Usuario).all()}
    envios   = {e.codigo_tracking: e.id_envio for e in db.query(models.Envio).all()}

    for correo, codigo, mensaje, tipo, leida, dias in NOTIFICACIONES_DATA:
        id_usuario = usuarios.get(correo)
        if not id_usuario:
            continue
        id_envio = envios.get(codigo) if codigo else None
        if not _exists(db, models.Notificacion, id_usuario=id_usuario, mensaje=mensaje):
            db.add(models.Notificacion(
                id_usuario=id_usuario,
                id_envio=id_envio,
                mensaje=mensaje,
                tipo=tipo,
                leida=leida,
                fecha_emision=_ago(days=dias, hours=3),
            ))
    db.flush()
    print("  [OK] Notificaciones")


# ── Output ─────────────────────────────────────────────────────────────────────

def _print_credentials():
    print("-" * 52)
    print("  Credenciales de prueba")
    print("-" * 52)
    rows = [
        ("admin",         ADMIN,    "Admin1234"),
        ("cliente",       C_CARLOS, "Cliente123"),
        ("cliente",       C_MARIA,  "Cliente123"),
        ("cliente",       C_JOSE,   "Cliente123"),
        ("cliente",       C_LUCIA,  "Cliente123"),
        ("cliente",       C_ROBERTO,"Cliente123"),
        ("transportista", T_JUAN,   "Trans1234"),
        ("transportista", T_ROSA,   "Trans1234"),
    ]
    for rol, correo, pwd in rows:
        print(f"  [{rol:<13}] {correo:<35} / {pwd}")
    print("-" * 52)


if __name__ == "__main__":
    print("\nInsertando datos de prueba...")
    run()
