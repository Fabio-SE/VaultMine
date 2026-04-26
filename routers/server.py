"""routers/server.py"""
import os, shutil
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from core.state import state
from core.config import load_server_config, save_server_config, save_colab_config
from core.api import get_server_types, get_server_versions, get_download_url, download_file

router = APIRouter()

@router.get("/types")
def server_types():
    return get_server_types()

@router.get("/versions/{server_type}")
def server_versions(server_type: str):
    return get_server_versions(server_type)

@router.get("/list")
def list_servers():
    cfg = load_server_config(state.drive_path)
    return {"servers": cfg.get("server_list",[]), "active": cfg.get("server_in_use","")}

class ChooseBody(BaseModel):
    server_name: str

@router.post("/choose")
def choose_server(body: ChooseBody):
    cfg = load_server_config(state.drive_path)
    if body.server_name not in cfg["server_list"]:
        raise HTTPException(404, "Servidor não encontrado")
    cfg["server_in_use"] = body.server_name
    save_server_config(state.drive_path, cfg)
    state.server_in_use = body.server_name
    return {"ok": True}

class CreateBody(BaseModel):
    server_name: str
    server_type: str
    server_version: str
    xmx: str = "3G"

@router.post("/create")
def create_server(body: CreateBody):
    log = []
    server_dir = os.path.join(state.drive_path, body.server_name)
    os.makedirs(server_dir, exist_ok=True)
    log.append(f"✓ Pasta criada: {server_dir}")

    url = get_download_url(body.server_type, body.server_version)
    if not url:
        raise HTTPException(502, "URL de download não encontrada")

    log.append("⬇ Baixando server.jar...")
    download_file(url, server_dir, "server.jar", force=True)
    log.append("✓ server.jar baixado")

    with open(os.path.join(server_dir, "eula.txt"), "w") as f:
        f.write("eula=true\n")
    log.append("✓ eula.txt criado")

    save_colab_config(state.drive_path, body.server_name, {
        "server_name":    body.server_name,
        "server_type":    body.server_type.lower(),
        "server_version": body.server_version,
        "java_version":   "17",
        "xmx":            body.xmx,
        "xms":            "1G",
    })
    log.append("✓ colabconfig.txt salvo")

    cfg = load_server_config(state.drive_path)
    if body.server_name not in cfg["server_list"]:
        cfg["server_list"].append(body.server_name)
    cfg["server_in_use"] = body.server_name
    save_server_config(state.drive_path, cfg)
    state.server_list = cfg["server_list"]
    state.server_in_use = body.server_name

    log.append(f"✓ Servidor '{body.server_name}' criado e ativo!")
    return {"ok": True, "log": log}

class DeleteBody(BaseModel):
    server_name: str

@router.delete("/delete")
def delete_server(body: DeleteBody):
    cfg = load_server_config(state.drive_path)
    server_dir = os.path.join(state.drive_path, body.server_name)
    if os.path.exists(server_dir):
        shutil.rmtree(server_dir)
    if body.server_name in cfg["server_list"]:
        cfg["server_list"].remove(body.server_name)
    if cfg.get("server_in_use") == body.server_name:
        cfg["server_in_use"] = cfg["server_list"][0] if cfg["server_list"] else ""
    save_server_config(state.drive_path, cfg)
    state.server_list = cfg["server_list"]
    state.server_in_use = cfg["server_in_use"]
    return {"ok": True}
