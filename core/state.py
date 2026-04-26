"""
Estado global da aplicação.
Um único objeto compartilhado entre todos os routers.
"""
import subprocess
from dataclasses import dataclass, field
from typing import Optional


@dataclass
class AppState:
    # Setup
    setup_done: bool = False
    drive_path: str = "/content/drive/MyDrive/minecraft"

    # Servidor ativo
    server_in_use: str = ""
    server_list: list = field(default_factory=list)

    # Processo do servidor
    server_running: bool = False
    server_process: Optional[subprocess.Popen] = None

    # Túnel
    playit_url: str = ""
    playit_process: Optional[subprocess.Popen] = None

    # Buffer de log (últimas 500 linhas)
    log_buffer: list = field(default_factory=list)
    log_thread_running: bool = False

    def add_log(self, line: str):
        self.log_buffer.append(line)
        if len(self.log_buffer) > 500:
            self.log_buffer.pop(0)


# Instância global
state = AppState()
