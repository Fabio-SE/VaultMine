"""
Helpers reutilizados pelos routers — mesma lógica do notebook original.
"""
import os
import json
import requests as req
from fastapi import HTTPException


# ── HTTP ──────────────────────────────────────────────────────

def GET(url: str, headers=None):
    r = req.get(url, headers=headers, timeout=15)
    if r.status_code == 200:
        return r
    raise HTTPException(status_code=502, detail=f"Erro HTTP {r.status_code} ao acessar {url}")


def DOWNLOAD_FILE(url: str, path: str, file_name: str, force=False, headers=None):
    dest = os.path.join(path, file_name)
    if not force and os.path.exists(dest):
        return dest
    r = GET(url, headers=headers)
    os.makedirs(path, exist_ok=True)
    with open(dest, "wb") as f:
        f.write(r.content)
    return dest


# ── Config ────────────────────────────────────────────────────

def load_server_config(drive_path: str) -> dict:
    p = os.path.join(drive_path, "server_list.txt")
    if os.path.exists(p):
        with open(p) as f:
            return json.load(f)
    return {"server_list": [], "server_in_use": "", "ngrok_proxy": {}, "playit": {}}


def save_server_config(drive_path: str, cfg: dict):
    p = os.path.join(drive_path, "server_list.txt")
    with open(p, "w") as f:
        json.dump(cfg, f, indent=2)


def load_colab_config(drive_path: str, server_name: str) -> dict:
    p = os.path.join(drive_path, server_name, "colabconfig.txt")
    if os.path.exists(p):
        with open(p) as f:
            return json.load(f)
    return {}


def save_colab_config(drive_path: str, server_name: str, cfg: dict):
    p = os.path.join(drive_path, server_name, "colabconfig.txt")
    with open(p, "w") as f:
        json.dump(cfg, f, indent=2)


# ── Server versions ───────────────────────────────────────────

def get_server_types() -> list:
    return ["Vanilla","Snapshot","Paper","Purpur","Mohist","Arclight",
            "Velocity","Banner","Fabric","Folia","Forge","Neoforge",
            "Bedrock","Crucible","Magma","Ketting","Cardboard","Custom"]


def get_server_versions(server_type: str) -> list:
    t = server_type.lower()
    try:
        if t in ("vanilla", "snapshot"):
            data = req.get("https://launchermeta.mojang.com/mc/game/version_manifest.json").json()
            kind = "release" if t == "vanilla" else "snapshot"
            return [v["id"] for v in data["versions"] if v["type"] == kind]
        elif t == "paper":
            return list(reversed(req.get("https://api.papermc.io/v2/projects/paper").json()["versions"]))
        elif t == "purpur":
            return list(reversed(req.get("https://api.purpurmc.org/v2/purpur").json()["versions"]))
        elif t == "fabric":
            return [v["version"] for v in req.get("https://meta.fabricmc.net/v2/versions/game").json() if v["stable"]]
        elif t in ("mohist", "banner"):
            return [v["name"] for v in req.get(f"https://api.mohistmc.com/project/{t}/versions").json()]
        elif t in ("folia", "velocity"):
            return list(reversed(req.get(f"https://api.papermc.io/v2/projects/{t}").json()["versions"]))
        return ["latest"]
    except Exception as e:
        raise HTTPException(status_code=502, detail=str(e))


def get_download_url(server_type: str, version: str) -> str:
    t = server_type.lower()
    try:
        if t in ("vanilla", "snapshot"):
            kind = "release" if t == "vanilla" else "snapshot"
            data = req.get("https://launchermeta.mojang.com/mc/game/version_manifest.json").json()
            for hit in data["versions"]:
                if hit["type"] == kind and hit["id"] == version:
                    return req.get(hit["url"]).json()["downloads"]["server"]["url"]
        elif t in ("paper", "folia", "velocity"):
            builds = req.get(f"https://api.papermc.io/v2/projects/{t}/versions/{version}").json()["builds"]
            build = builds[-1]
            jar = req.get(f"https://api.papermc.io/v2/projects/{t}/versions/{version}/builds/{build}").json()["downloads"]["application"]["name"]
            return f"https://api.papermc.io/v2/projects/{t}/versions/{version}/builds/{build}/downloads/{jar}"
        elif t == "purpur":
            build = req.get(f"https://api.purpurmc.org/v2/purpur/{version}").json()["builds"]["latest"]
            return f"https://api.purpurmc.org/v2/purpur/{version}/{build}/download"
        elif t == "fabric":
            installer = req.get("https://meta.fabricmc.net/v2/versions/installer").json()[0]["version"]
            loader = req.get(f"https://meta.fabricmc.net/v2/versions/loader/{version}").json()[0]["loader"]["version"]
            return f"https://meta.fabricmc.net/v2/versions/loader/{version}/{loader}/{installer}/server/jar"
    except Exception as e:
        raise HTTPException(status_code=502, detail=str(e))
    raise HTTPException(status_code=404, detail="URL não encontrada para esse tipo/versão")
