"""Tiny local web server that behaves like GitHub Pages: unknown URLs get 404.html (with a real 404 status).
Run from the portfolio folder:   python3 tools/serve.py        (then open http://localhost:8000)
Optional port:                   python3 tools/serve.py 8080
"""
import http.server, os, sys, socketserver
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
os.chdir(ROOT)

class Handler(http.server.SimpleHTTPRequestHandler):
    def send_error(self, code, message=None, explain=None):
        if code == 404 and os.path.exists('404.html'):
            body = open('404.html', 'rb').read()
            self.send_response(404); self.send_header('Content-Type', 'text/html; charset=utf-8')
            self.send_header('Content-Length', str(len(body))); self.end_headers()
            if self.command != 'HEAD': self.wfile.write(body)
        else:
            super().send_error(code, message, explain)
    def log_message(self, *a): pass

socketserver.TCPServer.allow_reuse_address = True
port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
with socketserver.ThreadingTCPServer(('', port), Handler) as httpd:
    print(f'Serving {ROOT} at http://localhost:{port}  (Ctrl+C to stop)')
    try: httpd.serve_forever()
    except KeyboardInterrupt: pass
