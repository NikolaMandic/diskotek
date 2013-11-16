###
This file is cache memory implementation in CoffeeScript
analogue to cache memory in processors that caches blocks
###
angular.module('ldApp').factory 'state',['command','configState','DataDisassemblyParsers','Data', (command,configState,parsers,data) ->
  TLBEntrySize = configState.TLBEntrySize
  state =
    registers:
      '':''
    data: data
    memory:
      ###
      
      ###
      TLB:{

      }

    ###
    get memory from requested address
    ###
    getMemory:(addr)->
      ###
      get block number by shifting addr bits to the right addr>>>x
      ###
      if state.memory.TLB[addr>>>TLBEntrySize]?
        ###
        if the block is pulled from backend get content of memory
        at the requested address
        ###
        c = state.memory.TLB[addr>>>TLBEntrySize].content
        r=_.where( c.content,{'address':addr})?[0]

        return r
      else
        ###
        if content is not pulled from memory request it
        and when it is returned put it in memory object
        also return a promise so that the outside code that called getMemory
        can attach a function that will execute when a block is fetched
        ###
        #debugData.disassembly=dataParsers[debugData.arch].disassemblyParser(data).combined;
        command.commandExecO(configState.getMemoryCommand(addr)).then (contentPulled)->
          state.memory.TLB[addr>>>TLBEntrySize]=
            content: parsers[configState.architecture].disassemblyParser(contentPulled).instructions
            dirty:0

]
