#!/usr/bin/python

from http.server import BaseHTTPRequestHandler, HTTPServer
import json
import urllib.parse
import subprocess
import re
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
      computePath = "/tmp/taco_compute.c"
      assemblyPath = "/tmp/taco_assembly.c"
      cmd = tacoPath + " " + cmd + " -write-source=" + writePath + " -write-compute=" + computePath + " -write-assembly=" + assemblyPath

      try:
        subprocess.check_output(str.split(cmd), timeout=3, stderr=subprocess.STDOUT)
        with open('/tmp/taco_kernel.c', 'r') as f:
          fullKernel = f.read().replace(tacoPath, "taco", 1).replace("/tmp/", "", 3)
          response['full-kernel'] = fullKernel
        with open('/tmp/taco_compute.c', 'r') as f:
          computeKernel = f.read()
          response['compute-kernel'] = computeKernel
        with open('/tmp/taco_assembly.c', 'r') as f:
          assemblyKernel = f.read()
          response['assembly-kernel'] = assemblyKernel
      except subprocess.TimeoutExpired:
        response['error'] = 'Server is unable to process the request in a timely manner'
        logFile = "/home/ubuntu/timeout.log"
      except subprocess.CalledProcessError as e:
        response['error'] = re.compile(':\n .*\n').search(e.output.decode()).group()[3:-1]
        if response['error'].strip() == "":
          response['error'] = 'Expression is currently not supported'
        logFile = "/home/ubuntu/errors.log"
      except:
        response['error'] = 'Expression is currently not supported'
        logFile = "/home/ubuntu/errors.log"

      ip = ".".join(self.client_address[0].split('.')[0:-2]) + ".*.*"
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
