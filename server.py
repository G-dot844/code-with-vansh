from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
import json
import sqlite3
from pathlib import Path
from urllib.parse import urlparse


BASE_DIR = Path(__file__).resolve().parent
DB_PATH = BASE_DIR / "dutycheck.db"


def connect_db():
    return sqlite3.connect(DB_PATH)


def setup_database():
    with connect_db() as connection:
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS workers (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL UNIQUE,
                on_duty INTEGER NOT NULL DEFAULT 0,
                last_changed TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
            """
        )


def get_workers():
    with connect_db() as connection:
        connection.row_factory = sqlite3.Row
        rows = connection.execute(
            """
            SELECT name, on_duty, last_changed
            FROM workers
            ORDER BY on_duty DESC, name ASC
            """
        ).fetchall()

    return [
        {
            "name": row["name"],
            "onDuty": bool(row["on_duty"]),
            "lastChanged": row["last_changed"],
        }
        for row in rows
    ]


def update_worker(name, on_duty):
    with connect_db() as connection:
        connection.execute(
            """
            INSERT INTO workers (name, on_duty, last_changed)
            VALUES (?, ?, CURRENT_TIMESTAMP)
            ON CONFLICT(name) DO UPDATE SET
                on_duty = excluded.on_duty,
                last_changed = CURRENT_TIMESTAMP
            """,
            (name, int(on_duty)),
        )


class DutyCheckHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(BASE_DIR), **kwargs)

    def do_GET(self):
        if urlparse(self.path).path == "/api/workers":
            self.send_json({"workers": get_workers()})
            return

        super().do_GET()

    def do_POST(self):
        if urlparse(self.path).path != "/api/check":
            self.send_error(404, "Not found")
            return

        try:
            payload = self.read_json()
            name = " ".join(payload.get("name", "").split())
            action = payload.get("action")

            if not name:
                self.send_json({"error": "Worker name is required."}, status=400)
                return

            if action not in {"in", "out"}:
                self.send_json({"error": "Action must be in or out."}, status=400)
                return

            update_worker(name, action == "in")
            self.send_json({"workers": get_workers(), "name": name, "action": action})
        except json.JSONDecodeError:
            self.send_json({"error": "Invalid JSON."}, status=400)

    def read_json(self):
        length = int(self.headers.get("Content-Length", "0"))
        body = self.rfile.read(length).decode("utf-8")
        return json.loads(body or "{}")

    def send_json(self, data, status=200):
        body = json.dumps(data).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)


def main():
    setup_database()
    server = ThreadingHTTPServer(("localhost", 8000), DutyCheckHandler)
    print("DutyCheck is running at http://localhost:8000")
    print("Press Ctrl+C to stop the server.")
    server.serve_forever()


if __name__ == "__main__":
    main()
