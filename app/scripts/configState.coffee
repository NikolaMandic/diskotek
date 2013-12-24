angular.module('ldApp').factory 'configState', (jsX)->
  configState =
    architecture: 'x86 elf'
    file:'hw'
    TLBEntrySize:8
    recording:false
    record:[]
    bWindows:[]
    getMemoryCommand:(addr)->
      s = 1<<configState.TLBEntrySize
      h = s/2
      'disas /rm '+addr+',+'+s
