#!/usr/bin/python

from http.server import BaseHTTPRequestHandler, HTTPServer
from socketserver import ThreadingMixIn
from datetime import datetime
import threading
import json
import urllib.parse
import subprocess
import re
import time

class Handler(BaseHTTPRequestHandler):
  def do_POST(self):
    response = {'compute-kernel': '', 'assembly-kernel': '', 'full-kernel': '', 'error': ''}
    
    try:
      length = int(self.headers['Content-Length'])
      msg = self.rfile.read(length)

      cmd = urllib.parse.unquote(msg.decode())
      if len(cmd) > 1024:
        raise Exception

      prettyCmd = "taco " + cmd
      cmd = cmd.replace("\"", "")
      
      logFile = "/home/ubuntu/success.log"
      tacoPath = "/home/ubuntu/taco/build/bin/taco"

      prefix = "/tmp/" + str(threading.current_thread().ident) + "_"
      writePath = prefix + "taco_kernel.c"
      computePath = prefix + "taco_compute.c"
      assemblyPath = prefix + "taco_assembly.c"
      cmd = tacoPath + " " + cmd + " -write-source=" + writePath + " -write-compute=" + computePath + " -write-assembly=" + assemblyPath

      try:
        subprocess.check_output(str.split(cmd), timeout=3, stderr=subprocess.STDOUT)
        with open(writePath, 'r') as f:
          fullKernel = f.read().replace(tacoPath, "taco", 1).replace(prefix, "", 3)
          response['full-kernel'] = fullKernel
        with open(computePath, 'r') as f:
          computeKernel = f.read().replace(tacoPath, "taco", 1).replace(prefix, "", 3)
          response['compute-kernel'] = computeKernel
        with open(assemblyPath, 'r') as f:
          assemblyKernel = f.read().replace(tacoPath, "taco", 1).replace(prefix, "", 3)
          response['assembly-kernel'] = assemblyKernel
      except subprocess.TimeoutExpired:
        response['error'] = 'Server is unable to process the request in a timely manner'
        logFile = "/home/ubuntu/timeout.log"
      except subprocess.CalledProcessError as e:
        search = re.compile(':\n .*\n').search(e.output.decode())
        if search is not None: 
          response['error'] = search.group()[3:-1]
        else: 
          response['error'] = 'Expression and/or schedule is currently not supported'
        logFile = "/home/ubuntu/errors.log"
      except:
        response['error'] = 'Expression and/or schedule is currently not supported'
        logFile = "/home/ubuntu/errors.log"

      ip = ".".join(self.client_address[0].split('.')[0:-2]) + ".*.*"
      curTime = datetime.now().isoformat(' ')
      with open(logFile, 'a') as f:
        #f.write(curTime + " (" + ip + "): " + prettyCmd + "\n")
        f.write(curTime + ": " + prettyCmd + "\n")

      self.send_response(200)
    except:
      self.send_response(400)
    
    self.send_header('Access-Control-Allow-Origin', '*')
    self.send_header('Content-type', 'application/json')
    self.end_headers()
    
    self.wfile.write(str.encode(json.dumps(response)))

class ThreadedHTTPServer(ThreadingMixIn, HTTPServer):
  def finish_request(self, request, client_address):
    request.settimeout(5)
    HTTPServer.finish_request(self, request, client_address)
        
def run(serverClass=ThreadedHTTPServer, handlerClass=Handler, port=80):
  serverAddress = ('', port)
  httpd = serverClass(serverAddress, handlerClass)

  print('Starting server...')
  httpd.serve_forever()

if __name__ == "__main__":
  run()
