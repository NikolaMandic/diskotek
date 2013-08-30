from bottle import route, run, template, request
import sys, os, time, getopt
import pty
import subprocess
import telnetlib
from bottle import static_file
procc=None
HOST="localhost"
@route('/hello/<name>')
def index(name='World'):# 
  return static_file("index.html",root='/home/uname/ld/app/',mimetype='html')
@route('/static/<filename:path>')
def send_static(filename):
    return static_file(filename, root='/home/uname/ld/app/')
  
@route('/o/<name>',method='POST')
def ndex(name='World'):# 
  import urllib.request
  print("name: "+urllib.parse.unquote(name))
  print("cmd: "+ request.forms.get('cmd') )
  f = urllib.request.urlopen(url='http://localhost:5823/',data=urllib.parse.urlencode(request.forms).encode('utf-8'))
  return f.read().decode('utf-8')
  
@route('/start/<name>',method='POST')
def ndex(name='World'):# 
  env=os.environ
  env['QEMU_LD_PREFIX']='/usr/arm-linux-gnueabi/'
  #os.spawnle(os.P_WAIT,'qemu-arm-static -g 12345 '+name ,env)
  #subprocess.Popen(['qemu-arm-static','-g', '12345',name],shell=True)
  subprocess.Popen(['qemu-arm-static','-g','12345',name,'-E QEMU_LD_PREFIX=/usr/arm-linux-gnueabi'],close_fds=True,env=env)
  #subprocess.Popen(['python2.7','/home/uname/rpty.py'],shell=True)
  import time
  time.sleep(1)
  import urllib.request
  print("name: "+urllib.parse.unquote(name))
  print("cmd: "+ request.forms.get('cmd') )
  f = urllib.request.urlopen(url='http://localhost:5823/',data=urllib.parse.urlencode({'cmd':'gdb-multiarch '+ name}).encode('utf-8'))
  time.sleep(1)
  f = urllib.request.urlopen(url='http://localhost:5823/',data=urllib.parse.urlencode({'cmd':'set arch arm'}).encode('utf-8'))
  time.sleep(1)
  f = urllib.request.urlopen(url='http://localhost:5823/',data=urllib.parse.urlencode({'cmd':'target remote :12345'}).encode('utf-8'))
  return f.read().decode('utf-8')
  




run(host='localhost', port=8080)
