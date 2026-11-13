# -*- coding: utf-8 -*-
"""
preview_server.py — Local HTTP server for Cò Đi Học Official Website Hub
Serves c:\\commandcenter\\08_New_Way_Edu\\website_codihoc on http://127.0.0.1:8099
"""

import json
import os
import sys
from pathlib import Path
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

PORT = int(os.environ.get("CDH_PREVIEW_PORT", "8099"))
DOC_DIR = Path(__file__).resolve().parent
POSTIZ_DIR = DOC_DIR.parent.parent / "02_AI_Hub" / "Warehouse" / "Capability_Store" / "Postiz_Social_Publisher"
if str(POSTIZ_DIR) not in sys.path:
    sys.path.insert(0, str(POSTIZ_DIR))


class CDHHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(DOC_DIR), **kwargs)

    def end_headers(self):
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
        self.send_header("Access-Control-Allow-Origin", "*")
        super().end_headers()

    def do_GET(self):
        if self.path.split("?", 1)[0] == "/api/clean-feed":
            try:
                from group_harvest_db_store import GroupHarvestDatabaseStore

                payload = GroupHarvestDatabaseStore().build_clean_forum_payload()
                raw = json.dumps(payload, ensure_ascii=False).encode("utf-8")
                self.send_response(200)
                self.send_header("Content-Type", "application/json; charset=utf-8")
                self.send_header("Content-Length", str(len(raw)))
                self.end_headers()
                self.wfile.write(raw)
            except Exception as exc:
                err = json.dumps({"ok": False, "error": str(exc)}, ensure_ascii=False).encode("utf-8")
                self.send_response(500)
                self.send_header("Content-Type", "application/json; charset=utf-8")
                self.send_header("Content-Length", str(len(err)))
                self.end_headers()
                self.wfile.write(err)
            return
        super().do_GET()

if __name__ == "__main__":
    server_address = ("127.0.0.1", PORT)
    httpd = ThreadingHTTPServer(server_address, CDHHandler)
    print(f"Cò Đi Học Preview Server is running on http://127.0.0.1:{PORT}")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down server...")
        httpd.server_close()
