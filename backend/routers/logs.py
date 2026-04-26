"""logs.py — ler log e otimizador TPS"""
import os
from fastapi import APIRouter, HTTPException
import state

router = APIRouter()


@router.get("")
async def get_logs(tail: int = 200, filter: str = ""):
    drive_path  = state.get("drive_path")
    server_name = state.get("server_in_use")
    log_path    = os.path.join(drive_path, server_name, "logs", "latest.log")
    if not os.path.exists(log_path):
        return {"lines": [], "total": 0}
    with open(log_path, "r", encoding="utf-8", errors="ignore") as f:
        all_lines = f.readlines()
    lines = [l.rstrip() for l in all_lines[-tail:]]
    if filter:
        lines = [l for l in lines if filter.lower() in l.lower()]
    return {"lines": lines, "total": len(all_lines)}


@router.post("/optimize")
async def optimize_tps():
    """Aplica otimizações de TPS nos arquivos de configuração."""
    drive_path  = state.get("drive_path")
    server_name = state.get("server_in_use")
    server_dir  = os.path.join(drive_path, server_name)
    applied = []

    props_path = os.path.join(server_dir, "server.properties")
    if os.path.exists(props_path):
        from jproperties import Properties
        props = Properties()
        with open(props_path, "rb") as f:
            props.load(f, "utf-8")
        props["sync-chunk-writes"]             = "false"
        props["network-compression-threshold"] = "-1"
        props["simulation-distance"]           = "4"
        props["view-distance"]                 = "7"
        with open(props_path, "wb") as f:
            props.store(f, encoding="utf-8")
        applied.append("server.properties")

    spigot_path = os.path.join(server_dir, "spigot.yml")
    if os.path.exists(spigot_path):
        from ruamel.yaml import YAML
        yaml = YAML()
        with open(spigot_path) as f:
            cfg = yaml.load(f)
        wd = cfg.setdefault("world-settings", {}).setdefault("default", {})
        wd["mob-spawn-range"] = 3
        wd.setdefault("entity-activation-range", {}).update(
            {"animals":16,"monsters":24,"raiders":48,"misc":8,"water":8,"villagers":16,"flying-monsters":48}
        )
        with open(spigot_path, "w") as f:
            yaml.dump(cfg, f)
        applied.append("spigot.yml")

    bukkit_path = os.path.join(server_dir, "bukkit.yml")
    if os.path.exists(bukkit_path):
        from ruamel.yaml import YAML
        yaml = YAML()
        with open(bukkit_path) as f:
            cfg = yaml.load(f)
        cfg["spawn-limits"] = {"monsters":20,"animals":5,"water-animals":2,
                               "water-ambient":2,"water-underground-creature":3,"axolotls":3,"ambient":1}
        cfg["ticks-per"] = {"monster-spawns":10,"animal-spawns":400,"water-spawns":400,
                            "water-ambient-spawns":400,"water-underground-creature-spawns":400,
                            "axolotl-spawns":400,"ambient-spawns":400}
        with open(bukkit_path, "w") as f:
            yaml.dump(cfg, f)
        applied.append("bukkit.yml")

    return {"ok": True, "applied": applied}
