"""
DHPA-India Backend Service Entrypoint for Vercel.
Exposes a standard WSGI application serving service health and metadata.
"""

import json

def app(environ, start_response):
    path = environ.get('PATH_INFO', '/')
    
    headers = [
        ('Content-Type', 'application/json'),
        ('Access-Control-Allow-Origin', '*'),
        ('Access-Control-Allow-Methods', 'GET, OPTIONS')
    ]
    
    if environ.get('REQUEST_METHOD') == 'OPTIONS':
        start_response('204 No Content', headers)
        return [b'']
    
    if path in ('/', '/api', '/api/health', '/health'):
        status = '200 OK'
        start_response(status, headers)
        payload = {
            "status": "healthy",
            "service": "dhpa-backend",
            "version": "1.0.0",
            "description": "District Healthcare Profiling & Analytics API"
        }
        return [json.dumps(payload, indent=2).encode('utf-8')]
    
    status = '404 Not Found'
    start_response(status, headers)
    return [json.dumps({"error": "Endpoint not found", "path": path}).encode('utf-8')]

