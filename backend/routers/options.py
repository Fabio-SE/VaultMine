"""options.py — server.properties, OPs, whitelist"""
import os, json
from fastapi import APIRouter, HTTPException
import state, utils

router = APIRouter()


@router.get("/properties")
async def get_properties():
    drive_path  = state.get("drive_path")
    server_name = state.get("server_in_use")
    path = os.path.join(drive_path, server_name, "server.properties")
    if not os.path.exists(path):
        raise HTTPException(404, "server.properties não encontrado")
    from jproperties import Properties
    props = Properties()
    with open(path, "rb") as f:
        props.load(f, "utf-8")
    return {k: v[0] for k, v in props.items()}


@router.put("/properties")
async def save_properties(body: dict):
    drive_path  = state.get("drive_path")
    server_name = state.get("server_in_use")
    path = os.path.join(drive_path, server_name, "server.properties")
    from jproperties import Properties
    props = Properties()
    if os.path.exists(path):
        with open(path, "rb") as f:
            props.load(f, "utf-8")
    for k, v in body.items():
        props[k] = str(v)
    with open(path, "wb") as f:
        props.store(f, encoding="utf-8")
    return {"ok": True}


@router.get("/ops")
async def get_ops():
    drive_path  = state.get("drive_path")
    server_name = state.get("server_in_use")
    path = os.path.join(drive_path, server_name, "ops.json")
    if not os.path.exists(path):
        return {"ops": []}
    with open(path) as f:
        return {"ops": json.load(f)}


@router.delete("/ops/{name}")
async def remove_op(name: str):
    drive_path  = state.get("drive_path")
    server_name = state.get("server_in_use")
    path = os.path.join(drive_path, server_name, "ops.json")
    with open(path) as f:
        ops = json.load(f)
    ops = [o for o in ops if o.get("name") != name]
    with open(path, "w") as f:
        json.dump(ops, f, indent=2)
    return {"ok": True}


@router.get("/whitelist")
async def get_whitelist():
    drive_path  = state.get("drive_path")
    server_name = state.get("server_in_use")
    path = os.path.join(drive_path, server_name, "whitelist.json")
    if not os.path.exists(path):
        return {"whitelist": []}
    with open(path) as f:
        return {"whitelist": json.load(f)}
