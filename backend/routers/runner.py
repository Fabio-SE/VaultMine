"""runner.py — iniciar/parar servidor e integração com playit.gg"""
import os, subprocess, asyncio
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
import state, utils

router = APIRouter()


def _java_cmd(cfg: dict) -> list:
    xmx = cfg.get("xmx", "3G")
    xms = cfg.get("xms", "1G")
    return [
        "java",
        f"-Xmx{xmx}", f"-Xms{xms}",
        "-XX:+UseG1GC", "-XX:+ParallelRefProcEnabled",
        "-XX:MaxGCPauseMillis=200", "-XX:+UnlockExperimentalVMOptions",
        "-XX:+DisableExplicitGC", "-XX:+AlwaysPreTouch",
        "-XX:G1NewSizePercent=30", "-XX:G1MaxNewSizePercent=40",
        "-XX:G1HeapRegionSize=8M", "-XX:G1ReservePercent=20",
        "-XX:InitiatingHeapOccupancyPercent=15",
        "-Dusing.aikars.flags=https://mcflags.emc.gs",
        "-jar", "server.jar", "--nogui",
    ]


@router.post("/start")
async def start_server():
    if state.get("server_running"):
        raise HTTPException(400, "Servidor já está rodando")

    drive_path  = state.get("drive_path")
    server_name = state.get("server_in_use")
    if not server_name:
        raise HTTPException(400, "Nenhum servidor selecionado")

    cfg = utils.load_colab_config(drive_path, server_name)
    server_dir = os.path.join(drive_path, server_name)

    cmd = _java_cmd(cfg)
    proc = subprocess.Popen(
        cmd, cwd=server_dir,
        stdout=subprocess.PIPE, stderr=subprocess.STDOUT,
        stdin=subprocess.PIPE, text=True, bufsize=1,
    )
    state.set("server_process", proc)
    state.set("server_pid", proc.pid)
    state.set("server_running", True)

    return {"ok": True, "pid": proc.pid, "cmd": " ".join(cmd[:4]) + " ..."}


@router.post("/stop")
async def stop_server():
    proc = state.get("server_process")
    if proc:
        try:
            proc.stdin.write("stop\n")
            proc.stdin.flush()
            await asyncio.sleep(3)
        except Exception:
            pass
        proc.terminate()
    state.set("server_running", False)
    state.set("server_process", None)
    state.set("server_pid", None)
    return {"ok": True}


@router.post("/command")
async def send_command(body: dict):
    """Envia um comando ao servidor (ex: /say hello, /op player)."""
    proc = state.get("server_process")
    if not proc or not state.get("server_running"):
        raise HTTPException(400, "Servidor não está rodando")
    cmd = body.get("command", "")
    proc.stdin.write(cmd + "\n")
    proc.stdin.flush()
    return {"ok": True, "sent": cmd}


@router.get("/status")
async def server_status():
    return {
        "running":   state.get("server_running"),
        "pid":       state.get("server_pid"),
        "address":   state.get("server_address"),
        "server":    state.get("server_in_use"),
    }


@router.get("/stream-logs")
async def stream_logs():
    """SSE — frontend recebe logs em tempo real."""
    proc = state.get("server_process")
    if not proc:
        raise HTTPException(400, "Servidor não está rodando")

    async def generator():
        while True:
            line = proc.stdout.readline()
            if line:
                yield f"data: {line.rstrip()}\n\n"
            else:
                await asyncio.sleep(0.2)
                if proc.poll() is not None:
                    break

    return StreamingResponse(generator(), media_type="text/event-stream")
