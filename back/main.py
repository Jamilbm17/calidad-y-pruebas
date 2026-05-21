from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app import models
from app.auth.router import router as auth_router
from app.database import engine
from app.routers import envios

models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Plataforma de Logística y Seguimiento de Envíos",
    version="1.0.0",
    description="API para registrar y rastrear paquetes — Proyecto UPN",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(envios.router)


@app.get("/")
def health():
    return {"status": "ok", "message": "Logística API en funcionamiento"}
