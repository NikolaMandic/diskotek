(function() {
  angular.module('ldApp').factory('configState', function(jsX) {
    var configState;
    return configState = {
      architecture: 'x86 elf',
      file: 'hw',
      TLBEntrySize: 8,
      recording: false,
      record: [],
      bWindows: [],
      getMemoryCommand: function(addr) {
        var h, s;
        s = 1 << configState.TLBEntrySize;
        h = s / 2;
        return 'disas /rm ' + addr + ',+' + s;
      }
    };
  });

}).call(this);

/*
//@ sourceMappingURL=configState.js.map
*/