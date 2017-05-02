#!/usr/bin/python

from http.server import BaseHTTPRequestHandler, HTTPServer
import json
import urllib.parse
import subprocess

class Server(BaseHTTPRequestHandler):
  def do_POST(self):
    response = {'compute-kernel': '', 'assembly-kernel': '', 'full-kernel': '', 'error': ''}
    
    try:
      length = int(self.headers['Content-Length'])
      msg = self.rfile.read(length)

      cmd = urllib.parse.unquote(msg.decode())
      if len(cmd) > 1024:
        raise Exception

      prettyCmd = "taco \"" + cmd.replace(" ", "\" ", 1)
      
      cmd = "/home/ubuntu/taco/build/bin/taco " + cmd
      ret = subprocess.call(str.split(cmd + " -write-source=taco_kernel.c"), timeout=2)
      
      logFile = "success.log"

      if ret != 0:
        response['error'] = 'Input expression is currently not supported by taco'
        logFile = "errors.log"
      else:
        with open('taco_kernel.c', 'r') as f:
          response['full-kernel'] = f.read()
        
        response['compute-kernel'] = subprocess.check_output(str.split(cmd + " -nocolor")).decode()
        response['assembly-kernel'] = subprocess.check_output(str.split(cmd + " -nocolor -print-assembly")).decode()

      with open(logFile, 'a') as f:
        f.write(prettyCmd + "\n")

      self.send_response(200)
    except:
      self.send_response(400)
    
    self.send_header('Content-type', 'application/json')
    self.end_headers()
    
    self.wfile.write(str.encode(json.dumps(response)))
        
def run(serverClass=HTTPServer, handlerClass=Server, port=80):
  serverAddress = ('', port)
  httpd = serverClass(serverAddress, handlerClass)

  print('Starting server...')
  httpd.serve_forever()

if __name__ == "__main__":
  run()
