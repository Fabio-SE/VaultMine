"""routers/mods.py"""
import os, requests as req
from fastapi import APIRouter, UploadFile, HTTPException
from pydantic import BaseModel
from core.state import state
from core.config import load_colab_config
from core.api import download_file

router = APIRouter()

def _dest_folder():
    cfg = load_colab_config(state.drive_path, state.server_in_use)
    st = cfg.get("server_type","paper")
    folder = "plugins" if st in ("paper","purpur","mohist","banner","velocity") else "mods"
    return os.path.join(state.drive_path, state.server_in_use, folder), folder

@router.get("/search")
def search(q: str, version: str = ""):
    cfg = load_colab_config(state.drive_path, state.server_in_use)
    st = cfg.get("server_type","paper")
    ptype = "plugin" if st in ("paper","purpur","mohist","banner","velocity") else "mod"
    facets = f'[["project_type:{ptype}"],["versions:{version}"]]' if version else f'[["project_type:{ptype}"]]'
    r = req.get("https://api.modrinth.com/v2/search", params={"query":q,"facets":facets,"limit":10}, timeout=10)
    return r.json().get("hits",[])

class DownloadBody(BaseModel):
    project_id: str
    game_version: str = ""

@router.post("/install")
def install_mod(body: DownloadBody):
    dest_folder, folder_name = _dest_folder()
    cfg = load_colab_config(state.drive_path, state.server_in_use)
    st = cfg.get("server_type","paper")
    params = {}
    if body.game_version: params["game_versions"] = f'["{body.game_version}"]'
    params["loaders"] = f'["{st}"]'
    versions = req.get(f"https://api.modrinth.com/v2/project/{body.project_id}/version", params=params, timeout=10).json()
    if not versions: raise HTTPException(404,"Nenhuma versão compatível encontrada")
    file_info = versions[0]["files"][0]
    download_file(file_info["url"], dest_folder, file_info["filename"], force=False)
    return {"ok": True, "filename": file_info["filename"], "folder": folder_name}

class UrlBody(BaseModel):
    url: str
    filename: str

@router.post("/install-url")
def install_from_url(body: UrlBody):
    dest_folder, folder_name = _dest_folder()
    os.makedirs(dest_folder, exist_ok=True)
    download_file(body.url, dest_folder, body.filename, force=True)
    return {"ok": True, "folder": folder_name}

@router.get("/list")
def list_mods():
    dest_folder, folder_name = _dest_folder()
    if not os.path.exists(dest_folder): return {"folder": folder_name, "files": []}
    return {"folder": folder_name, "files": sorted(f for f in os.listdir(dest_folder) if f.endswith(".jar"))}

@router.delete("/remove/{filename}")
def remove_mod(filename: str):
    dest_folder, _ = _dest_folder()
    p = os.path.join(dest_folder, filename)
    if os.path.exists(p): os.remove(p)
    return {"ok": True}
