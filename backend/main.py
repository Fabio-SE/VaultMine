"""
VAULT — Backend FastAPI
Roda no Google Colab, exposto via playit.gg
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import setup, servers, runner, options, mods, backup, logs

app = FastAPI(title="VAULT API", version="0.1.0")

# CORS liberado para o frontend (Vercel/GitHub Pages)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],          # Em produção: coloque a URL do seu Vercel aqui
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Rotas
app.include_router(setup.router,   prefix="/setup",   tags=["Setup"])
app.include_router(servers.router, prefix="/servers", tags=["Servers"])
app.include_router(runner.router,  prefix="/runner",  tags=["Runner"])
app.include_router(options.router, prefix="/options", tags=["Options"])
app.include_router(mods.router,    prefix="/mods",    tags=["Mods"])
app.include_router(backup.router,  prefix="/backup",  tags=["Backup"])
app.include_router(logs.router,    prefix="/logs",    tags=["Logs"])


@app.get("/")
async def health():
    """Health check — frontend usa isso pra saber se o backend tá online."""
    import state
    return {
        "status": "online",
        "vault_version": "0.1.0",
        "setup_done": state.get("setup_done"),
        "server_in_use": state.get("server_in_use"),
        "server_running": state.get("server_running"),
    }
