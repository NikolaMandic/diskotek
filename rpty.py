#!usr/bin/python
from twisted.internet import reactor, protocol
req=None
class ProcessProtocol(protocol.ProcessProtocol):

    def __init__(self, pr):
        self.pr = pr

    def outReceived(self, data):
        #self.pr.transport.write(data)
        print "============================="
        print "out recived \n"
        print data
        print len(data)
  
        global req
        
        global propro
        if req != None:
          print "request"
          print req
          if data.find('---Type <return> to continue, or q <return> to quit---')!=-1:
            propro.transport.write("\n");
          else:
            import re
            if(not re.search(re.compile('/^\s*$/'),data)):
              req.write(data)
            if data.find("$ ")!=-1 or data.find("(gdb)")!=-1 :
              print "finish"
              req.finish()
          #propro.tranport.loseConnection()
	
        print "==================================="
    def processEnded(self, reason):
        global req 
        print 'protocol conection lost'
       # self.pr.transport.loseConnection()

commandToRun = ['/bin/sh'] # could have args too,,
dirToRunIn = './'
propro = None


from twisted.web.server import Site
from twisted.web.resource import Resource
from twisted.internet import reactor
from twisted.web.server import NOT_DONE_YET
propro=ProcessProtocol(None)

reactor.spawnProcess(propro, commandToRun[0], commandToRun, {},
                             dirToRunIn, usePTY=1)

class DelaydPTY(Resource):
  def __init__(self,name):
    import urllib
    print name
    self.name=urllib.unquote(name)
  def render_POST(self,request):
    global req
    req=request
    self.name = request.args["cmd"][0]
    global propro 
    propro.transport.write(self.name + "\n")
    return NOT_DONE_YET
class PTY(Resource):
  def getChild(self,name,request):
    return DelaydPTY(name)
root = PTY()
factory = Site(root)
reactor.listenTCP(5823, factory)
reactor.run()
