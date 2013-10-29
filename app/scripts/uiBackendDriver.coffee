angular.module('ldApp')
.factory 'uiGDBDriver',['$rootScope','command','DataDebug','DataDisassembly',($rootScope,command,DataDebug,DataDisassembly)->
  ###
  #
  ###
  obj =
      
    ###
     * start command is going to start qemu user emulator that will 
     * run this target and wait for a debuger to attach on 12345 port 
     * also it will start gdb that will load target from disk and then
     * commands set arch arm will be sent to the gdb
     * and target remote command to connect to the emulator
     *
    ###
    loadCommand : (name,architecture)->

      command.commandExecO({
        msgType:'start',
        payload:{
          name:name,
          architecture:architecture,
          initSteps:['set disassembly-flavor intel\n']
        },
        callback:null
      })
    
    startCommand : (name,architecture)->
      command.commandExecO({
        msgType:'start',
        payload:{
          name:name,
          architecture:architecture,
          initSteps:['set disassembly-flavor intel\n','break _start\n','run\n']
        },
        callback:null
      })
      obj.debugData.getDissasembly()
      obj.debugData.getRegisterInfo()
      obj.debugData.infoBreakpoints()

    
    
    ###
     * stop command will send command to the gdb that will detach the debugger
     * qemu emulator exits at that point
     * then a quit command is sent and gdb exits
     * 
    ###
    stop : ()->
    
      command.commandExecO({
        ptyPayload:'detach',
        callback:()->
          obj.debugData.status='detached'
          obj.debugData.registers=[]
          obj.data=[]
        
      })
      
      command.commandExecO({
        ptyPayload:'quit',
        callback:null
      })
      


]
