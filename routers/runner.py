"""routers/runner.py — Inicia/para o servidor Minecraft"""
import os, subprocess, threading
from fastapi import APIRouter, HTTPException
from core.state import state
from core.config import load_colab_config

router = APIRouter()

def _jvm_flags(cfg: dict) -> list:
    xmx = cfg.get("xmx","3G"); xms = cfg.get("xms","1G")
    return [
        f"-Xmx{xmx}", f"-Xms{xms}",
        "-XX:+UseG1GC","-XX:+ParallelRefProcEnabled","-XX:MaxGCPauseMillis=200",
        "-XX:+UnlockExperimentalVMOptions","-XX:+DisableExplicitGC","-XX:+AlwaysPreTouch",
        "-XX:G1NewSizePercent=30","-XX:G1MaxNewSizePercent=40","-XX:G1HeapRegionSize=8M",
        "-XX:G1ReservePercent=20","-XX:G1HeapWastePercent=5","-XX:G1MixedGCCountTarget=4",
        "-XX:InitiatingHeapOccupancyPercent=15","-XX:G1MixedGCLiveThresholdPercent=90",
        "-XX:G1RSetUpdatingPauseTimePercent=5","-XX:SurvivorRatio=32",
        "-XX:+PerfDisableSharedMem","-XX:MaxTenuringThreshold=1",
        "-jar","server.jar","--nogui",
    ]

def _read_logs(proc: subprocess.Popen):
    """Thread que lê stdout do servidor e popula state.log_buffer."""
    for line in iter(proc.stdout.readline, ""):
        state.add_log(line.rstrip())
    state.server_running = False

@router.post("/start")
def start_server():
    if state.server_running:
        raise HTTPException(409, "Servidor já está rodando")
    if not state.server_in_use:
        raise HTTPException(400, "Nenhum servidor ativo")

    cfg = load_colab_config(state.drive_path, state.server_in_use)
    server_dir = os.path.join(state.drive_path, state.server_in_use)
    cmd = ["java"] + _jvm_flags(cfg)

    try:
        proc = subprocess.Popen(
            cmd, cwd=server_dir,
            stdout=subprocess.PIPE, stderr=subprocess.STDOUT,
            text=True, bufsize=1,
        )
    except FileNotFoundError:
        raise HTTPException(500, "Java não encontrado. Instale Java 17 ou 21.")

    state.server_process = proc
    state.server_running = True
    state.log_buffer.clear()

    # Thread para capturar logs
    t = threading.Thread(target=_read_logs, args=(proc,), daemon=True)
    t.start()

    return {"ok": True, "pid": proc.pid}

@router.post("/stop")
def stop_server():
    if not state.server_running or not state.server_process:
        raise HTTPException(409, "Servidor não está rodando")
    state.server_process.terminate()
    state.server_running = False
    state.server_process = None
    return {"ok": True}

@router.post("/command")
async def send_command(body: dict):
    """Envia um comando ao servidor via stdin."""
    if not state.server_running or not state.server_process:
        raise HTTPException(409, "Servidor não está rodando")
    cmd = body.get("command","")
    if cmd:
        state.server_process.stdin.write(cmd + "\n")
        state.server_process.stdin.flush()
    return {"ok": True}

@router.get("/status")
def runner_status():
    return {
        "running": state.server_running,
        "pid": state.server_process.pid if state.server_process else None,
        "playit_url": state.playit_url,
    }
