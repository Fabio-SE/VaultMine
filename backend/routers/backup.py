"""backup.py"""
import os, shutil, zipfile
from datetime import datetime
from fastapi import APIRouter
import state

router = APIRouter()


@router.get("")
async def list_backups():
    drive_path  = state.get("drive_path")
    server_name = state.get("server_in_use")
    backup_dir  = os.path.join(drive_path, server_name, "backup")
    if not os.path.exists(backup_dir):
        return {"backups": []}
    items = []
    for name in sorted(os.listdir(backup_dir), reverse=True):
        p = os.path.join(backup_dir, name)
        size = os.path.getsize(p) if os.path.isfile(p) else \
               sum(os.path.getsize(os.path.join(r,f)) for r,d,fs in os.walk(p) for f in fs)
        items.append({"name": name, "size_mb": round(size/1024/1024, 2)})
    return {"backups": items}


@router.post("")
async def create_backup(body: dict):
    drive_path  = state.get("drive_path")
    server_name = state.get("server_in_use")
    world       = body.get("world", "world")
    backup_name = body.get("name", f"{server_name}-{world}-{datetime.now().strftime('%Y%m%d-%H%M%S')}")

    world_path  = os.path.join(drive_path, server_name, world)
    backup_dir  = os.path.join(drive_path, server_name, "backup")
    os.makedirs(backup_dir, exist_ok=True)
    zip_path    = os.path.join(backup_dir, f"{backup_name}.zip")

    with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zf:
        for root, dirs, files in os.walk(world_path):
            for file in files:
                fp = os.path.join(root, file)
                zf.write(fp, os.path.relpath(fp, os.path.dirname(world_path)))

    size_mb = round(os.path.getsize(zip_path) / 1024 / 1024, 2)
    return {"ok": True, "file": f"{backup_name}.zip", "size_mb": size_mb}


@router.delete("/{name}")
async def delete_backup(name: str):
    drive_path  = state.get("drive_path")
    server_name = state.get("server_in_use")
    p = os.path.join(drive_path, server_name, "backup", name)
    if os.path.isfile(p):
        os.remove(p)
    elif os.path.isdir(p):
        shutil.rmtree(p)
    return {"ok": True}
