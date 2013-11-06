angular.module('ldApp').factory 'state',['command','configState','DataDisassemblyParsers', (command,configState,parsers) ->
  TLBEntrySize = configState.TLBEntrySize
  state =
    registers:

      '':''
    memory:
      ###
      
      
      ###
      TLB:{

      }
    getMemory:(addr)->
      if state.memory.TLB[addr>>>TLBEntrySize]?
        c = state.memory.TLB[addr>>>TLBEntrySize].content
        r=_.where( c.content,{'address':addr})?[0]

        return r
      else
        
        #debugData.disassembly=dataParsers[debugData.arch].disassemblyParser(data).combined;
        command.commandExecO(configState.getMemoryCommand(addr)).then (contentPulled)->
          state.memory.TLB[addr>>>TLBEntrySize]=
            content: parsers[configState.architecture].disassemblyParser(contentPulled).instructions
            dirty:0

]