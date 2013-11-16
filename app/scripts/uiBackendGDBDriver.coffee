angular.module('ldApp').factory 'DataDebug',['$rootScope','command','DataDisassemblyParsers', ($rootScope,command,dataParsers) ->
  debugData =
    arch:'x86'

    #transforms command output recived from server into array of instructions
    commands:
      x86:
        disassembly:'disas /rm $eip-40,$eip+40'#$eip,$eip+40'
      ,
      arm:
        disassembly:'disas /rm $pc-80,$pc+80'


    getDissasembly: () ->

      command.commandExecO(
        ptyPayload:debugData.commands[debugData.arch].disassembly,
        callback:(data) ->
          debugData.disassembly=dataParsers[debugData.arch].disassemblyParser(data).combined
      )
      debugData.__lookupGetter__("disassembly", (p) ->
        return value
      )
      obj.callbackQueue.push(debugData.dissasemblyCallback)
      socket.emit('command',  ptyPayload: 'disas $pc-80,$pc+80' )

   patch: (thing) ->
     console.log('patch',thing)

   stepOver: () ->
     command.commandExecO(ptyPayload:'ni')

     debugData.getDissasembly()
     debugData.getRegisterInfo()

   getRegisterInfo: () ->
     command.commandExecO(
       callback:getRegInfoC = (result) ->
         debugData.registers = result.slice(0,-1).map((value) ->
           s=value.split(/(\w+)\s*(\w+)\s*(\w+)/)
           name:s[1],
           value1:s[2],
           value2:s[3],

         )
         ###
         if (_.pluck(debugData.registers,name:'eip').value1-_.pluck(debugData.registersNew,name:'eip').value1)
         ###
         $rootScope.$emit('debugDataLoaded')
       ,
       ptyPayload:'info registers'
     )
      #debugData.callbackQueue.push()

      #socket.emit('command',  ptyPayload: 'info registers' )

    setBreakpoint: (address) ->
      #obj.callbackQueue.push(setBreakpointC = () -> )
      command.commandExecO(
        ptyPayload:'break *' + address
      )
      ###
      socket.emit('command',
        ptyPayload: 'break *' + address
      )
     ###


    removeBreakpoint: (address) ->
      command.commandExecO(
        ptyPayload: 'clear *' + address
      )

    infoBreakpoints: () ->
      #command.callbackQueue.push(
      infoBreakpointsC = (result) ->
        if(result[0].match(/^No.*/))
        else
          debugData.breakpoints = result.slice(1).map((value) ->
            split = value.split(/\s*(\w+)\s*(\w+)\s*(\w+)\s*(\w+)\s*(\w*)\s*/)
            num:split[1],
            type:split[2],
            disp:split[3],
            enb:split[4],
            address:split[5],
            what:split[6]

          )
          if(debugData.disassembly)
            _.each(debugData.breakpoints,(value) ->
              elem = _.findWhere(debugData.disassembly,'address':value.address)
              if(elem)
                indexDest = _.indexOf(debugData.disassembly,elem)
                if(indexDest!=-1)
                  elem.hasBreakpoint=true
            )
        $rootScope.$emit('debugDataLoaded')
      command.commandExecO(
        callback:infoBreakpointsC,
        ptyPayload:'info break'
      )
                                 #)
      #    socket.emit('command',
      #  ptyPayload : 'info break'
      #)
    return debugData

]
