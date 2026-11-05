"""Serve Vatu Convert on 127.0.0.1:8768 for Tailscale (tailscale serve --bg --https=8444 8768)."""
import http.server
import os

PORT = 8768
os.chdir(os.path.dirname(os.path.abspath(__file__)))


class Handler(http.server.SimpleHTTPRequestHandler):
    extensions_map = {**http.server.SimpleHTTPRequestHandler.extensions_map,
                      ".webmanifest": "application/manifest+json", ".js": "text/javascript"}

    def end_headers(self):
        self.send_header("Cache-Control", "no-cache")
        super().end_headers()


http.server.ThreadingHTTPServer.allow_reuse_address = True
with http.server.ThreadingHTTPServer(("127.0.0.1", PORT), Handler) as httpd:
    print(f"Vatu Convert on http://localhost:{PORT}  (phone: https://<laptop>.<tailnet>.ts.net:8444)")
    httpd.serve_forever()
