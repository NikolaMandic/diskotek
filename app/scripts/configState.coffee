angular.module('ldApp').factory 'configState', ()->
  configState =
    architecture: 'x86 elf'
    file:'hw'
    TLBEntrySize:3
    getMemoryCommand:(addr)->
      s = 1<<configState.TLBEntrySize
      h = s/2
      'disas /rm '+addr+',+'+s
