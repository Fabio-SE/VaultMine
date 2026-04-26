"""
Helpers de HTTP e versões de servidor — mesma lógica do notebook original.
"""
import os, requests as _req
from fastapi import HTTPException


def GET(url: str, headers=None):
    r = _req.get(url, headers=headers, timeout=15)
    if r.status_code != 200:
        raise HTTPException(502, f"Erro {r.status_code} ao acessar {url}")
    return r


def download_file(url: str, dest_dir: str, filename: str, force=False) -> str:
    """Baixa um arquivo. Retorna o caminho completo."""
    os.makedirs(dest_dir, exist_ok=True)
    dest = os.path.join(dest_dir, filename)
    if os.path.exists(dest) and not force:
        return dest
    r = GET(url)
    with open(dest, "wb") as f:
        f.write(r.content)
    return dest


def get_server_types() -> list:
    return [
        "Vanilla","Snapshot","Paper","Purpur","Mohist",
        "Arclight","Velocity","Banner","Fabric","Folia",
        "Forge","Neoforge","Bedrock","Crucible","Magma",
        "Ketting","Cardboard","Custom",
    ]


def get_server_versions(server_type: str) -> list:
    st = server_type.lower()
    try:
        if st in ("vanilla","snapshot"):
            data = _req.get("https://launchermeta.mojang.com/mc/game/version_manifest.json",timeout=10).json()
            kind = "release" if st == "vanilla" else "snapshot"
            return [v["id"] for v in data["versions"] if v["type"] == kind]
        elif st == "paper":
            return list(reversed(_req.get("https://api.papermc.io/v2/projects/paper",timeout=10).json()["versions"]))
        elif st == "purpur":
            return list(reversed(_req.get("https://api.purpurmc.org/v2/purpur",timeout=10).json()["versions"]))
        elif st == "fabric":
            return [v["version"] for v in _req.get("https://meta.fabricmc.net/v2/versions/game",timeout=10).json() if v["stable"]]
        elif st in ("mohist","banner"):
            return [v["name"] for v in _req.get(f"https://api.mohistmc.com/project/{st}/versions",timeout=10).json()]
        elif st == "folia":
            return list(reversed(_req.get("https://api.papermc.io/v2/projects/folia",timeout=10).json()["versions"]))
        elif st == "velocity":
            return list(reversed(_req.get("https://api.papermc.io/v2/projects/velocity",timeout=10).json()["versions"]))
        else:
            return ["latest"]
    except Exception as e:
        return [f"erro: {e}"]


def get_download_url(server_type: str, version: str) -> str:
    st = server_type.lower()
    try:
        if st in ("vanilla","snapshot"):
            kind = "release" if st == "vanilla" else "snapshot"
            data = _req.get("https://launchermeta.mojang.com/mc/game/version_manifest.json",timeout=10).json()
            for v in data["versions"]:
                if v["type"] == kind and v["id"] == version:
                    return _req.get(v["url"],timeout=10).json()["downloads"]["server"]["url"]
        elif st in ("paper","folia","velocity"):
            builds = _req.get(f"https://api.papermc.io/v2/projects/{st}/versions/{version}",timeout=10).json()["builds"]
            build = builds[-1]
            name = _req.get(f"https://api.papermc.io/v2/projects/{st}/versions/{version}/builds/{build}",timeout=10).json()["downloads"]["application"]["name"]
            return f"https://api.papermc.io/v2/projects/{st}/versions/{version}/builds/{build}/downloads/{name}"
        elif st == "purpur":
            build = _req.get(f"https://api.purpurmc.org/v2/purpur/{version}",timeout=10).json()["builds"]["latest"]
            return f"https://api.purpurmc.org/v2/purpur/{version}/{build}/download"
        elif st == "fabric":
            installer = _req.get("https://meta.fabricmc.net/v2/versions/installer",timeout=10).json()[0]["version"]
            loader = _req.get(f"https://meta.fabricmc.net/v2/versions/loader/{version}",timeout=10).json()[0]["loader"]["version"]
            return f"https://meta.fabricmc.net/v2/versions/loader/{version}/{loader}/{installer}/server/jar"
        elif st in ("mohist","banner"):
            builds = _req.get(f"https://api.mohistmc.com/project/{st}/{version}/builds",timeout=10).json()
            last = builds[-1]["id"]
            return f"https://api.mohistmc.com/project/{st}/{version}/builds/{last}/download"
    except Exception as e:
        raise HTTPException(502, f"Erro ao obter URL: {e}")
    return ""
