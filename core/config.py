"""
Leitura e escrita de configurações persistentes.
"""
import json, os

APP_CFG_PATH = "vault_config.json"

_DEFAULTS = {
    "password":    "vault123",
    "drive_path":  "/content/drive/MyDrive/minecraft",
}

def load_config() -> dict:
    if os.path.exists(APP_CFG_PATH):
        with open(APP_CFG_PATH) as f:
            return {**_DEFAULTS, **json.load(f)}
    return dict(_DEFAULTS)

def save_config(data: dict):
    existing = load_config()
    existing.update(data)
    with open(APP_CFG_PATH, "w") as f:
        json.dump(existing, f, indent=2)

# ── Helpers de servidor ────────────────────────────────────────
def server_config_path(drive_path: str) -> str:
    return os.path.join(drive_path, "server_list.txt")

def load_server_config(drive_path: str) -> dict:
    p = server_config_path(drive_path)
    if os.path.exists(p):
        with open(p) as f:
            return json.load(f)
    return {"server_list": [], "server_in_use": ""}

def save_server_config(drive_path: str, cfg: dict):
    with open(server_config_path(drive_path), "w") as f:
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
