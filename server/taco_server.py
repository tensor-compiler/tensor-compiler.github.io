#!/usr/bin/python

from http.server import BaseHTTPRequestHandler, HTTPServer
import json
import urllib.parse
import subprocess

class Server(BaseHTTPRequestHandler):
  def do_POST(self):
    response = {'error': ''}
    
    try:
      length = int(self.headers['Content-Length'])
      msg = self.rfile.read(length)

      cmd = urllib.parse.unquote(msg.decode())
      if len(cmd) > 1024:
        raise Exception
      
      cmd = "taco " + cmd + " -write-source=kernel.c"
      ret = subprocess.call(str.split(cmd))
      
      logFile = "success.log"

      if ret != 0:
        response['error'] = 'Input expression is currently not supported by taco'
        logFile = "errors.log"
      else:
        with open('kernel.c', 'r') as f:
          response['compute-kernel'] = f.read()

      with open(logFile, 'a') as f:
        f.write(cmd + "\n")

      self.send_response(200)
    except:
      self.send_response(400)
    
    self.send_header('Content-type', 'application/json')
    self.end_headers()
    
    self.wfile.write(str.encode(json.dumps(response)))
        
def run(serverClass=HTTPServer, handlerClass=Server, port=80):
  serverAddress = ('', port)
  httpd = serverClass(serverAddress, handlerClass)
  print('Starting httpd...')
  httpd.serve_forever()

if __name__ == "__main__":
  run()
