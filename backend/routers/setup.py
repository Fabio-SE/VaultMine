import os, json, subprocess
from fastapi import APIRouter
from pydantic import BaseModel
import state, utils

router = APIRouter()


class SetupBody(BaseModel):
    drive_path: str = "/content/drive/MyDrive/minecraft"


@router.post("")
async def run_setup(body: SetupBody):
    logs = []

    # Montar Drive
    try:
        from google.colab import drive
        if not os.path.exists("/content/drive"):
            drive.mount("/content/drive")
        logs.append("✓ Google Drive montado")
    except ImportError:
        logs.append("⚠ Não estamos no Colab — Drive não montado (modo local)")

    # Criar pasta
    os.makedirs(body.drive_path, exist_ok=True)
    logs.append(f"✓ Pasta criada: {body.drive_path}")

    # server_list.txt
    cfg_path = os.path.join(body.drive_path, "server_list.txt")
    if not os.path.exists(cfg_path):
        with open(cfg_path, "w") as f:
            json.dump({"server_list": [], "server_in_use": ""}, f)
        logs.append("✓ server_list.txt criado")
    else:
        logs.append("✓ server_list.txt já existe")

    # Salvar estado
    state.set("drive_path", body.drive_path)
    state.set("setup_done", True)
    cfg = utils.load_server_config(body.drive_path)
    state.set("server_list", cfg.get("server_list", []))
    state.set("server_in_use", cfg.get("server_in_use", ""))

    logs.append("✓ Setup concluído!")
    return {"ok": True, "logs": logs}
