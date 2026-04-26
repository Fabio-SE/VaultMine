"""routers/setup.py"""
import os, subprocess
from fastapi import APIRouter
from pydantic import BaseModel
from core.state import state
from core.config import load_config, save_config, load_server_config, save_server_config

router = APIRouter()

class SetupBody(BaseModel):
    drive_path: str = "/content/drive/MyDrive/minecraft"

@router.post("")
def run_setup(body: SetupBody):
    log = []

    # Instalar dependências
    pkgs = ["jproperties","rich","beautifulsoup4","ruamel.yaml","mcstatus","toml","requests"]
    for pkg in pkgs:
        r = subprocess.run(["pip","install","-q",pkg], capture_output=True, text=True)
        log.append(f"{'✓' if r.returncode==0 else '✗'} {pkg}")

    # Montar Drive
    try:
        if not os.path.exists("/content/drive"):
            from google.colab import drive
            drive.mount("/content/drive")
        log.append("✓ Google Drive montado")
    except ImportError:
        log.append("⚠ Não estamos no Colab — Drive não montado (modo local)")

    # Criar estrutura
    os.makedirs(body.drive_path, exist_ok=True)
    cfg_path = os.path.join(body.drive_path, "server_list.txt")
    if not os.path.exists(cfg_path):
        save_server_config(body.drive_path, {"server_list":[], "server_in_use":""})
        log.append("✓ server_list.txt criado")

    # Atualizar estado
    state.setup_done = True
    state.drive_path = body.drive_path
    cfg = load_server_config(body.drive_path)
    state.server_list = cfg.get("server_list", [])
    state.server_in_use = cfg.get("server_in_use", "")

    save_config({"drive_path": body.drive_path})
    log.append("✓ Setup concluído!")
    return {"ok": True, "log": log}

@router.get("/info")
def get_info():
    cfg = load_config()
    return {
        "drive_path": state.drive_path or cfg.get("drive_path"),
        "server_list": state.server_list,
        "server_in_use": state.server_in_use,
    }
