"""
VAULT Web — FastAPI Backend
Rode com: uvicorn main:app --host 0.0.0.0 --port 8000
"""

from fastapi import FastAPI, Request, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
import os

from routers import setup, server, runner, options, software, mods, backup, logs, playit
from core.config import load_config, save_config, APP_CFG_PATH

# ──────────────────────────────────────────────────────────────
app = FastAPI(title="VAULT", docs_url=None, redoc_url=None)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Autenticação simples por senha ─────────────────────────────
def get_password() -> str:
    cfg = load_config()
    return cfg.get("password", "vault123")

async def check_auth(request: Request):
    """Middleware de autenticação via header X-Vault-Password."""
    # Rotas públicas (login e estáticos)
    if request.url.path in ("/api/login", "/") or request.url.path.startswith("/static"):
        return
    password = request.headers.get("X-Vault-Password", "")
    if password != get_password():
        raise HTTPException(status_code=401, detail="Senha incorreta")

# ── Routers ────────────────────────────────────────────────────
app.include_router(setup.router,    prefix="/api/setup",    dependencies=[Depends(check_auth)])
app.include_router(server.router,   prefix="/api/server",   dependencies=[Depends(check_auth)])
app.include_router(runner.router,   prefix="/api/runner",   dependencies=[Depends(check_auth)])
app.include_router(options.router,  prefix="/api/options",  dependencies=[Depends(check_auth)])
app.include_router(software.router, prefix="/api/software", dependencies=[Depends(check_auth)])
app.include_router(mods.router,     prefix="/api/mods",     dependencies=[Depends(check_auth)])
app.include_router(backup.router,   prefix="/api/backup",   dependencies=[Depends(check_auth)])
app.include_router(logs.router,     prefix="/api/logs",     dependencies=[Depends(check_auth)])
app.include_router(playit.router,   prefix="/api/playit",   dependencies=[Depends(check_auth)])

# ── Login ──────────────────────────────────────────────────────
@app.post("/api/login")
async def login(body: dict):
    if body.get("password") == get_password():
        return {"ok": True}
    raise HTTPException(status_code=401, detail="Senha incorreta")

# ── Status geral ───────────────────────────────────────────────
@app.get("/api/status")
async def status(_=Depends(check_auth)):
    from core.state import state
    return {
        "setup_done":    state.setup_done,
        "server_in_use": state.server_in_use,
        "server_running": state.server_running,
        "playit_url":    state.playit_url,
    }

# ── Servir o frontend (SPA) ─────────────────────────────────────
# Arquivos estáticos (JS, CSS se houver)
if os.path.exists("static"):
    app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/{full_path:path}")
async def serve_frontend(full_path: str):
    """Serve o index.html para todas as rotas (SPA)."""
    return FileResponse("static/index.html")
