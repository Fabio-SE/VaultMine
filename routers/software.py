"""routers/software.py"""
import os
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from core.state import state
from core.config import load_colab_config, save_colab_config
from core.api import get_server_types, get_server_versions, get_download_url, download_file

router = APIRouter()

@router.get("/types")
def types(): return get_server_types()

@router.get("/versions/{server_type}")
def versions(server_type: str): return get_server_versions(server_type)

class ChangeBody(BaseModel):
    server_type: str
    server_version: str

@router.post("/change")
def change_software(body: ChangeBody):
    url = get_download_url(body.server_type, body.server_version)
    if not url: raise HTTPException(502,"URL de download não encontrada")
    server_dir = os.path.join(state.drive_path, state.server_in_use)
    old = os.path.join(server_dir,"server.jar")
    if os.path.exists(old): os.remove(old)
    download_file(url, server_dir, "server.jar", force=True)
    cfg = load_colab_config(state.drive_path, state.server_in_use)
    cfg["server_type"] = body.server_type.lower()
    cfg["server_version"] = body.server_version
    save_colab_config(state.drive_path, state.server_in_use, cfg)
    return {"ok": True}

class JavaBody(BaseModel):
    java_version: str

@router.post("/java")
def set_java(body: JavaBody):
    cfg = load_colab_config(state.drive_path, state.server_in_use)
    cfg["java_version"] = body.java_version
    save_colab_config(state.drive_path, state.server_in_use, cfg)
    return {"ok": True}
