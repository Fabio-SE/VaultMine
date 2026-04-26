import os, shutil
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import state, utils

router = APIRouter()


@router.get("")
async def list_servers():
    drive_path = state.get("drive_path")
    cfg = utils.load_server_config(drive_path)
    return {"servers": cfg["server_list"], "active": cfg["server_in_use"]}


@router.get("/types")
async def get_types():
    return {"types": utils.get_server_types()}


@router.get("/versions/{server_type}")
async def get_versions(server_type: str):
    return {"versions": utils.get_server_versions(server_type)}


class CreateBody(BaseModel):
    name: str
    server_type: str
    version: str
    xmx: str = "3G"


@router.post("")
async def create_server(body: CreateBody):
    drive_path = state.get("drive_path")
    server_dir = os.path.join(drive_path, body.name)
    os.makedirs(server_dir, exist_ok=True)

    # Download JAR
    url = utils.get_download_url(body.server_type, body.version)
    utils.DOWNLOAD_FILE(url, server_dir, "server.jar")

    # EULA
    with open(os.path.join(server_dir, "eula.txt"), "w") as f:
        f.write("eula=true\n")

    # colabconfig
    utils.save_colab_config(drive_path, body.name, {
        "server_name":    body.name,
        "server_type":    body.server_type.lower(),
        "server_version": body.version,
        "java_version":   "21",
        "tunnel":         "playit",
        "xmx":            body.xmx,
        "xms":            "1G",
    })

    # Atualiza lista
    cfg = utils.load_server_config(drive_path)
    if body.name not in cfg["server_list"]:
        cfg["server_list"].append(body.name)
    cfg["server_in_use"] = body.name
    utils.save_server_config(drive_path, cfg)
    state.set("server_list", cfg["server_list"])
    state.set("server_in_use", body.name)

    return {"ok": True, "server": body.name}


@router.post("/{name}/select")
async def select_server(name: str):
    drive_path = state.get("drive_path")
    cfg = utils.load_server_config(drive_path)
    if name not in cfg["server_list"]:
        raise HTTPException(404, "Servidor não encontrado")
    cfg["server_in_use"] = name
    utils.save_server_config(drive_path, cfg)
    state.set("server_in_use", name)
    return {"ok": True, "active": name}


@router.delete("/{name}")
async def delete_server(name: str):
    drive_path = state.get("drive_path")
    server_dir = os.path.join(drive_path, name)
    if os.path.exists(server_dir):
        shutil.rmtree(server_dir)
    cfg = utils.load_server_config(drive_path)
    if name in cfg["server_list"]:
        cfg["server_list"].remove(name)
    if cfg["server_in_use"] == name:
        cfg["server_in_use"] = cfg["server_list"][0] if cfg["server_list"] else ""
    utils.save_server_config(drive_path, cfg)
    state.set("server_list", cfg["server_list"])
    state.set("server_in_use", cfg["server_in_use"])
    return {"ok": True}
