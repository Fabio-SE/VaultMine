"""routers/options.py"""
import os, json
from fastapi import APIRouter, HTTPException
from core.state import state

router = APIRouter()

def _props_path():
    return os.path.join(state.drive_path, state.server_in_use, "server.properties")

@router.get("/properties")
def get_properties():
    p = _props_path()
    if not os.path.exists(p):
        raise HTTPException(404, "server.properties não encontrado")
    from jproperties import Properties
    props = Properties()
    with open(p,"rb") as f: props.load(f,"utf-8")
    return {k: v[0] for k,v in props.items()}

@router.post("/properties")
def set_properties(body: dict):
    p = _props_path()
    if not os.path.exists(p):
        raise HTTPException(404, "server.properties não encontrado")
    from jproperties import Properties
    props = Properties()
    with open(p,"rb") as f: props.load(f,"utf-8")
    for k,v in body.items():
        props[k] = str(v)
    with open(p,"wb") as f: props.store(f,encoding="utf-8")
    return {"ok": True}

@router.get("/ops")
def get_ops():
    p = os.path.join(state.drive_path, state.server_in_use, "ops.json")
    if not os.path.exists(p): return []
    with open(p) as f: return json.load(f)

@router.delete("/ops/{name}")
def remove_op(name: str):
    p = os.path.join(state.drive_path, state.server_in_use, "ops.json")
    if not os.path.exists(p): raise HTTPException(404,"ops.json não encontrado")
    with open(p) as f: ops = json.load(f)
    ops = [o for o in ops if o.get("name") != name]
    with open(p,"w") as f: json.dump(ops,f,indent=2)
    return {"ok": True}

@router.get("/whitelist")
def get_whitelist():
    p = os.path.join(state.drive_path, state.server_in_use, "whitelist.json")
    if not os.path.exists(p): return []
    with open(p) as f: return json.load(f)
