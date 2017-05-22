#!/usr/bin/python

from http.server import BaseHTTPRequestHandler, HTTPServer
import json
import urllib.parse
import subprocess
from datetime import datetime

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
      
      logFile = "/home/ubuntu/success.log"
      tacoPath = "/home/ubuntu/taco/build/bin/taco"
      writePath = "/tmp/taco_kernel.c"
      cmd = tacoPath + " " + cmd

      try:
        ret = subprocess.call(str.split(cmd + " -write-source=" + writePath), timeout=4)
        
        if ret != 0:
          response['error'] = 'Input expression is currently not supported by taco'
          logFile = "/home/ubuntu/errors.log"
        else:
          with open('/tmp/taco_kernel.c', 'r') as f:
            fullKernel = f.read().replace(tacoPath, "taco", 1).replace(writePath, "taco_kernel.c", 1)
            response['full-kernel'] = fullKernel
          
          response['compute-kernel'] = subprocess.check_output(str.split(cmd + " -nocolor")).decode()
          response['assembly-kernel'] = subprocess.check_output(str.split(cmd + " -nocolor -print-assembly")).decode()
      except subprocess.TimeoutExpired:
        response['error'] = 'Server currently does not have sufficient resource to process the request' 
        logFile = "/home/ubuntu/timeout.log"
      except:
        raise

      ip = self.client_address[0]
      time = datetime.now().isoformat(' ')
      with open(logFile, 'a') as f:
        f.write(time + " (" + ip + "): " + prettyCmd + "\n")

      self.send_response(200)
    except:
      self.send_response(400)
    
    self.send_header('Access-Control-Allow-Origin', '*')
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
