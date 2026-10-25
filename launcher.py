import os
import sys
import subprocess
import threading
import webbrowser
import signal
import re
import time
import queue
import urllib.request
import tkinter as tk
from tkinter import ttk, messagebox

class MeetMeterLauncher:
    def __init__(self, root):
        self.root = root
        self.root.title("MeetMeter — Local Server")
        self.root.geometry("560x460")
        self.root.minsize(520, 420)
        self.root.configure(bg="#0C0E14")

        self.project_dir = os.path.dirname(os.path.abspath(__file__))
        self.process = None
        self.server_url = "http://localhost:5173"
        self.is_stopping = False
        self.ui_queue = queue.Queue()

        self._setup_ui()
        self._schedule_queue_check()
        self.root.protocol("WM_DELETE_WINDOW", self.on_close)

    def _schedule_queue_check(self):
        self._process_queue()
        self.root.after(50, self._schedule_queue_check)

    def _process_queue(self):
        while not self.ui_queue.empty():
            try:
                fn = self.ui_queue.get_nowait()
                fn()
            except Exception:
                pass

    def run_on_ui(self, fn):
        self.ui_queue.put(fn)

    def _setup_ui(self):
        # Top Navigation / Titlebar Header
        header_frame = tk.Frame(self.root, bg="#12151E", padx=28, pady=20)
        header_frame.pack(fill="x")

        title_row = tk.Frame(header_frame, bg="#12151E")
        title_row.pack(fill="x")

        app_title = tk.Label(
            title_row,
            text="MeetMeter",
            font=("Segoe UI", 15, "bold"),
            fg="#F4F4F5",
            bg="#12151E",
        )
        app_title.pack(side="left")

        version_badge = tk.Label(
            title_row,
            text="v1.0.0 Local",
            font=("Segoe UI", 8),
            fg="#71717A",
            bg="#181C28",
            padx=6,
            pady=2,
        )
        version_badge.pack(side="left", padx=8)

        app_sub = tk.Label(
            header_frame,
            text="Local Development & Desktop Runtime Controller",
            font=("Segoe UI", 9),
            fg="#71717A",
            bg="#12151E",
        )
        app_sub.pack(anchor="w", pady=(3, 0))

        # Main Body Container
        main_container = tk.Frame(self.root, bg="#0C0E14", padx=28, pady=20)
        main_container.pack(fill="both", expand=True)

        # Status Panel Card
        status_card = tk.Frame(
            main_container,
            bg="#12151E",
            highlightbackground="#232736",
            highlightthickness=1,
            padx=20,
            pady=16,
        )
        status_card.pack(fill="x", pady=(0, 16))

        status_meta_row = tk.Frame(status_card, bg="#12151E")
        status_meta_row.pack(fill="x")

        status_title = tk.Label(
            status_meta_row,
            text="RUNTIME STATUS",
            font=("Segoe UI", 8, "bold"),
            fg="#71717A",
            bg="#12151E",
        )
        status_title.pack(side="left")

        self.port_label = tk.Label(
            status_meta_row,
            text="PORT: 5173",
            font=("Consolas", 8),
            fg="#52525B",
            bg="#12151E",
        )
        self.port_label.pack(side="right")

        self.status_indicator = tk.Label(
            status_card,
            text="Offline",
            font=("Segoe UI", 13, "bold"),
            fg="#71717A",
            bg="#12151E",
        )
        self.status_indicator.pack(anchor="w", pady=(6, 2))

        self.endpoint_label = tk.Label(
            status_card,
            text="Server is currently stopped. Click 'Start Server' to boot runtime.",
            font=("Segoe UI", 9),
            fg="#A1A1AA",
            bg="#12151E",
        )
        self.endpoint_label.pack(anchor="w")

        # Action Buttons Container
        actions_frame = tk.Frame(main_container, bg="#0C0E14")
        actions_frame.pack(fill="x", pady=4)

        # Start Button (Primary)
        self.btn_start = tk.Button(
            actions_frame,
            text="Start Server",
            font=("Segoe UI", 10, "bold"),
            bg="#F4F4F5",
            fg="#0C0E14",
            activebackground="#E4E4E7",
            activeforeground="#0C0E14",
            relief="flat",
            cursor="hand2",
            padx=20,
            pady=10,
            command=self.start_server,
        )
        self.btn_start.pack(fill="x", pady=4)

        # Open in Browser (Secondary)
        self.btn_open = tk.Button(
            actions_frame,
            text="Open in Browser (localhost:5173)",
            font=("Segoe UI", 9),
            bg="#181C28",
            fg="#A1A1AA",
            activebackground="#232736",
            activeforeground="#F4F4F5",
            relief="flat",
            cursor="hand2",
            padx=16,
            pady=8,
            state="disabled",
            command=self.open_browser,
        )
        self.btn_open.pack(fill="x", pady=4)

        # Stop Button
        self.btn_stop = tk.Button(
            actions_frame,
            text="Stop Server",
            font=("Segoe UI", 9),
            bg="#181C28",
            fg="#71717A",
            activebackground="#3F151B",
            activeforeground="#FCA5A5",
            relief="flat",
            cursor="hand2",
            padx=16,
            pady=8,
            state="disabled",
            command=self.stop_server,
        )
        self.btn_stop.pack(fill="x", pady=4)

        # Footer Status Info
        footer = tk.Frame(self.root, bg="#0C0E14", padx=28, pady=12)
        footer.pack(side="bottom", fill="x")

        footer_text = tk.Label(
            footer,
            text="Local SQLite Storage  •  Zero Telemetry  •  Confidential by Design",
            font=("Segoe UI", 8),
            fg="#52525B",
            bg="#0C0E14",
        )
        footer_text.pack(anchor="w")

    def start_server(self):
        if self.process is not None:
            return

        self.is_stopping = False
        self.btn_start.config(state="disabled", text="Starting Server...", bg="#27272A", fg="#71717A")
        self.status_indicator.config(text="Starting...", fg="#FBBF24")
        self.endpoint_label.config(text="Initializing local Vite runtime on port 5173...")

        thread = threading.Thread(target=self._run_npm, daemon=True)
        thread.start()

    def _run_npm(self):
        try:
            is_win = sys.platform.startswith("win")
            node_modules_dir = os.path.join(self.project_dir, "node_modules")

            # Check if dependencies are installed
            if not os.path.isdir(node_modules_dir):
                self.run_on_ui(lambda: self.endpoint_label.config(
                    text="Installing dependencies (npm install)... Please wait.",
                    fg="#FBBF24"
                ))
                install_cmd = "npm install" if is_win else ["npm", "install"]
                install_proc = subprocess.run(
                    install_cmd,
                    cwd=self.project_dir,
                    shell=is_win,
                    capture_output=True,
                    text=True
                )
                if install_proc.returncode != 0:
                    err_msg = install_proc.stderr or install_proc.stdout
                    self.run_on_ui(lambda: messagebox.showerror("Dependency Error", f"npm install failed:\n\n{err_msg}"))
                    self.run_on_ui(self._on_server_stopped)
                    return

            self.run_on_ui(lambda: self.endpoint_label.config(
                text="Booting Vite dev server...",
                fg="#FBBF24"
            ))

            cmd = "npm run dev" if is_win else ["npm", "run", "dev"]
            self.process = subprocess.Popen(
                cmd,
                cwd=self.project_dir,
                shell=is_win,
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                text=True,
                creationflags=subprocess.CREATE_NEW_PROCESS_GROUP if is_win else 0,
            )

            log_history = []

            def read_logs():
                try:
                    for line in iter(self.process.stdout.readline, ''):
                        if not line:
                            break
                        log_history.append(line)
                        if len(log_history) > 100:
                            log_history.pop(0)

                        match = re.search(r'https?://(?:localhost|127\.0\.0\.1):(\d+)', line)
                        if match:
                            port = match.group(1)
                            self.server_url = f"http://localhost:{port}"
                except Exception:
                    pass

            reader_thread = threading.Thread(target=read_logs, daemon=True)
            reader_thread.start()

            # Poll until server actually accepts HTTP connections
            started = False
            start_time = time.time()
            while time.time() - start_time < 30:
                if self.process is None or self.process.poll() is not None:
                    break

                target_url = self.server_url
                try:
                    req = urllib.request.Request(target_url, headers={"User-Agent": "MeetMeterLauncher"})
                    with urllib.request.urlopen(req, timeout=0.8) as resp:
                        if resp.status in (200, 304, 404):
                            started = True
                            break
                except Exception:
                    time.sleep(0.4)

            if started and self.process and self.process.poll() is None:
                port_match = re.search(r':(\d+)', self.server_url)
                port = port_match.group(1) if port_match else "5173"
                self.run_on_ui(lambda: self._on_server_started(self.server_url, port))

                # Wait for process until termination
                self.process.wait()
                if not self.is_stopping:
                    self.run_on_ui(self._on_server_stopped)
            else:
                recent_logs = "".join(log_history[-15:]).strip()
                err_text = recent_logs if recent_logs else "Process exited before the server became ready."
                if not self.is_stopping:
                    self.run_on_ui(lambda: messagebox.showerror("Server Error", f"Could not launch dev server:\n\n{err_text}"))
                self.run_on_ui(self._on_server_stopped)

        except Exception as e:
            self.run_on_ui(lambda: messagebox.showerror("Server Error", f"Unexpected error:\n{str(e)}"))
            self.run_on_ui(self._on_server_stopped)

    def _on_server_started(self, url, port):
        self.server_url = url
        self.port_label.config(text=f"PORT: {port}")
        self.status_indicator.config(text="Online & Active", fg="#34D399")
        self.endpoint_label.config(text=f"{url} (Ready for connections)", fg="#E4E4E7")
        self.btn_start.config(state="disabled", text="Server Active", bg="#181C28", fg="#52525B")
        self.btn_open.config(state="normal", text=f"Open in Browser ({url.replace('http://', '')})", bg="#27272A", fg="#F4F4F5")
        self.btn_stop.config(state="normal", bg="#27272A", fg="#F87171")

    def _on_server_stopped(self):
        self.process = None
        self.status_indicator.config(text="Offline", fg="#71717A")
        self.endpoint_label.config(text="Server is stopped. Click 'Start Server' to boot runtime.", fg="#A1A1AA")
        self.port_label.config(text="PORT: 5173")
        self.btn_start.config(state="normal", text="Start Server", bg="#F4F4F5", fg="#0C0E14")
        self.btn_open.config(state="disabled", text="Open in Browser (localhost:5173)", bg="#181C28", fg="#A1A1AA")
        self.btn_stop.config(state="disabled", text="Stop Server", bg="#181C28", fg="#71717A")
        self.is_stopping = False

    def open_browser(self):
        webbrowser.open(self.server_url)

    def stop_server(self):
        if self.process:
            self.is_stopping = True
            self.btn_stop.config(state="disabled", text="Stopping...")
            try:
                if sys.platform.startswith("win"):
                    subprocess.call(["taskkill", "/F", "/T", "/PID", str(self.process.pid)], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
                else:
                    os.killpg(os.getpgid(self.process.pid), signal.SIGTERM)
            except Exception:
                try:
                    self.process.terminate()
                except Exception:
                    pass
            self.process = None
            self._on_server_stopped()

    def on_close(self):
        if self.process:
            self.is_stopping = True
            try:
                if sys.platform.startswith("win"):
                    subprocess.call(["taskkill", "/F", "/T", "/PID", str(self.process.pid)], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
                else:
                    os.killpg(os.getpgid(self.process.pid), signal.SIGTERM)
            except Exception:
                try:
                    self.process.terminate()
                except Exception:
                    pass
        self.root.destroy()

if __name__ == "__main__":
    root = tk.Tk()
    app = MeetMeterLauncher(root)
    root.mainloop()
