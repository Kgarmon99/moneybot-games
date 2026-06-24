#!/usr/bin/env python3
"""Simple cross-platform server for the MoneyBot Command Center dashboard."""
import http.server
import socketserver
import os

PORT = int(os.environ.get("MONEYBOT_COMMAND_CENTER_PORT", "8765"))
ADDRESS = "0.0.0.0"

class Handler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Help browsers refresh the JSON file instead of caching it
        if self.path.endswith("dashboard-data.json"):
            self.send_header("Cache-Control", "no-store")
        super().end_headers()

os.chdir(os.path.dirname(os.path.abspath(__file__)))

with socketserver.TCPServer((ADDRESS, PORT), Handler) as httpd:
    print(f"MoneyBot Command Center")
    print(f"Open: http://localhost:{PORT}")
    print(f"On your TV: http://<this-pc-ip>:{PORT}")
    print("Press Ctrl+C to stop")
    httpd.serve_forever()
