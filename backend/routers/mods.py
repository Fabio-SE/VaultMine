"""mods.py — Modrinth search & install"""
import os, requests as req
from fastapi import APIRouter, HTTPException
import state, utils

router = APIRouter()


@router.get("/search")
async def search_modrinth(q: str, version: str = "", project_type: str = "mod"):
    facets = f'[["project_type:{project_type}"]]'
    if version:
        facets = f'[["project_type:{project_type}"],["versions:{version}"]]'
    r = req.get("https://api.modrinth.com/v2/search",
                params={"query": q, "facets": facets, "limit": 10})
    return {"results": r.json().get("hits", [])}


@router.post("/install")
async def install_mod(body: dict):
    project_id  = body["project_id"]
    game_version = body.get("game_version", "")
    loader      = body.get("loader", "")
    drive_path  = state.get("drive_path")
    server_name = state.get("server_in_use")
    cfg = utils.load_colab_config(drive_path, server_name)
    server_type = cfg.get("server_type", "paper")

    folder = "plugins" if server_type in ("paper","purpur","mohist","banner","velocity") else "mods"
    dest_folder = os.path.join(drive_path, server_name, folder)

    params = {}
    if game_version:
        params["game_versions"] = f'["{game_version}"]'
    if loader:
        params["loaders"] = f'["{loader}"]'

    versions = req.get(f"https://api.modrinth.com/v2/project/{project_id}/version",
                       params=params).json()
    if not versions:
        raise HTTPException(404, "Nenhuma versão compatível")

    file_info = versions[0]["files"][0]
    utils.DOWNLOAD_FILE(file_info["url"], dest_folder, file_info["filename"], force=True)
    return {"ok": True, "file": file_info["filename"], "folder": folder}


@router.get("/installed")
async def list_installed():
    drive_path  = state.get("drive_path")
    server_name = state.get("server_in_use")
    results = {}
    for folder in ("plugins", "mods"):
        path = os.path.join(drive_path, server_name, folder)
        if os.path.exists(path):
            results[folder] = [f for f in os.listdir(path) if f.endswith(".jar")]
    return results


@router.delete("/installed/{folder}/{filename}")
async def remove_mod(folder: str, filename: str):
    drive_path  = state.get("drive_path")
    server_name = state.get("server_in_use")
    path = os.path.join(drive_path, server_name, folder, filename)
    if os.path.exists(path):
        os.remove(path)
    return {"ok": True}
