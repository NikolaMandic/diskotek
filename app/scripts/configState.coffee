angular.module('ldApp').factory 'configState', ()->
  configState =
    architecture: 'x86'
    TLBEntrySize:3
    getMemoryCommand:(addr)->
      s = 1<<configState.TLBEntrySize
      h = s/2
      'disas /rm *'+addr+'-'+h+','+'*'+addr+'+'+h
