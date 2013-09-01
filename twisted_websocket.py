#!usr/bin/python
from twisted.internet import reactor, protocol
class ProcessProtocol(protocol.ProcessProtocol):

    def __init__(self, pr):
        self.pr = pr

    def outReceived(self, data):
        #self.pr.transport.write(data)
        print "============================="
        print "out recived \n"
        print data
        print len(data)
  
        
        global propro
        if req != None:
          print "request"
          print req
          if data.find('---Type <return> to continue, or q <return> to quit---')!=-1:
            self.transport.write("\n");
          else:
            import re
            if(not re.search(re.compile('/^\s*$/'),data)):
              self.pr.write(data)
            #if data.find("$ ")!=-1 or data.find("(gdb)")!=-1 :
            #  print "finish"
            #  req.finish()
          #propro.tranport.loseConnection()
	
        print "==================================="
    def processEnded(self, reason):
        global req 
        print 'protocol conection lost'
       # self.pr.transport.loseConnection()

from twisted.internet import reactor


#from twisted.web.websocket import WebSocketHandler,WebSocketSite
from twisted.python import log
from twisted.internet.protocol import Protocol, Factory
import json
import subprocess
from twisted.web.static import File
commandToRun = ['/bin/sh'] # could have args too,,
dirToRunIn = './'
def start_arm(name):
  env=os.environ
  env['QEMU_LD_PREFIX']='/usr/arm-linux-gnueabi/'
  subprocess.Popen(['qemu-arm-static','-g','12345',name,'-E QEMU_LD_PREFIX=/usr/arm-linux-gnueabi'],close_fds=True,env=env)


from websocket import WebSocketHandler, WebSocketSite


class Testhandler(WebSocketHandler):
    def __init__(self, transport):
        WebSocketHandler.__init__(self, transport)
        self.processProtocol = ProcessProtocol(self)
        WebSocketHandler.__init__(self,transport,self.processProtocol )
        reactor.spawnProcess(self.processProtocol,
                       commandToRun[0], 
                       commandToRun, 
                       {},
                       dirToRunIn, 
                       usePTY=1)


    def __del__(self):
        print 'Deleting handler'

    def frameReceived(self, frame):
      command = json.loads(frame)
      if(command.ctype == 'start'):
          #do starting
        name=command.ptyPayload.targetName
        #switch arch based on type
        start_arm(name)
        import time
        time.sleep(1)
     
        debbuger='gdb_multiarch'
        self.processProtocol.transport.write(debugger + ' ' + name  + "\n")
      else:
        self.processProtocol.transport.write(command.ptyPayload)


    def connectionMade(self):
        print 'Connected to client.'
        # here would be a good place to register this specific handler
        # in a dictionary mapping some client identifier (like IPs) against
        # self (this handler object)

    def connectionLost(self, reason):
        print 'Lost connection.'
        # here is a good place to deregister this handler object


class FlashSocketPolicy(Protocol):
    """ A simple Flash socket policy server.
    See: http://www.adobe.com/devnet/flashplayer/articles/socket_policy_files.html
    """
    def connectionMade(self):
        policy = '<?xml version="1.0"?><!DOCTYPE cross-domain-policy SYSTEM ' \
                 '"http://www.macromedia.com/xml/dtds/cross-domain-policy.dtd">' \
                 '<cross-domain-policy><allow-access-from domain="*" to-ports="*" /></cross-domain-policy>'
        self.transport.write(policy)
        self.transport.loseConnection()





class WebSocketRemotePTY(WebSocketHandler):
  def __init__(self,transport):
    self.processProtocol = ProcessProtocol(self)
    WebSocketHandler.__init__(self,transport,self.processProtocol )
    reactor.spawnProcess(self.processProtocol,
                       commandToRun[0], 
                       commandToRun, 
                       {},
                       dirToRunIn, 
                       usePTY=1)

   
  def frameReceived(self,frame):
    print frame
    command = json.loads(frame)
    if(command.ctype == 'start'):
      #do starting
      name=command.ptyPayload.targetName
      #switch arch based on type
      start_arm(name)
      import time
      time.sleep(1)
   
      debbuger='gdb_multiarch'
      self.processProtocol.transport.write(debugger + ' ' + name  + "\n")
    else:
      self.processProtocol.transport.write(command.ptyPayload)


print "asdasd"
root = File('.')
site = WebSocketSite(root)
site.addHandler('/o',Testhandler)
reactor.listenTCP(8080, site)
reactor.run()









