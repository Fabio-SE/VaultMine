"""
Estado global do servidor em memória.
Como o FastAPI é um processo único no Colab, podemos manter estado assim.
Para múltiplos workers, substituir por Redis ou arquivo JSON.
"""
import subprocess

_state: dict = {
    "setup_done":       False,
    "drive_path":       "/content/drive/MyDrive/minecraft",
    "server_in_use":    "",
    "server_list":      [],
    "server_running":   False,
    "server_process":   None,   # subprocess.Popen — não serializado
    "server_pid":       None,
    "server_address":   "",     # endereço playit.gg do MC
    "playit_process":   None,   # processo do agente playit
}


def get(key: str, default=None):
    return _state.get(key, default)


def set(key: str, value):
    _state[key] = value


def all_serializable() -> dict:
    """Retorna o estado sem os campos não-serializáveis (processos)."""
    skip = {"server_process", "playit_process"}
    return {k: v for k, v in _state.items() if k not in skip}
