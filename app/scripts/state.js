/*
This file is cache memory implementation in CoffeeScript
analogue to cache memory in processors that caches blocks
*/


(function() {
  angular.module('ldApp').factory('state', [
    'command', 'configState', 'DataDisassemblyParsers', 'Data', function(command, configState, parsers, data) {
      var TLBEntrySize, state;
      TLBEntrySize = configState.TLBEntrySize;
      return state = {
        registers: {
          '': ''
        },
        data: data,
        memory: {
          /*
          */

          TLB: {}
        },
        /*
        get memory from requested address
        */

        getMemory: function(addr) {
          /*
          get block number by shifting addr bits to the right addr>>>x
          */

          var c, r, _ref;
          if (state.memory.TLB[addr >>> TLBEntrySize] != null) {
            /*
            if the block is pulled from backend get content of memory
            at the requested address
            */

            c = state.memory.TLB[addr >>> TLBEntrySize].content;
            r = (_ref = _.where(c.content, {
              'address': addr
            })) != null ? _ref[0] : void 0;
            return r;
          } else {
            /*
            if content is not pulled from memory request it
            and when it is returned put it in memory object
            also return a promise so that the outside code that called getMemory
            can attach a function that will execute when a block is fetched
            */

            return command.commandExecO(configState.getMemoryCommand(addr)).then(function(contentPulled) {
              return state.memory.TLB[addr >>> TLBEntrySize] = {
                content: parsers[configState.architecture].disassemblyParser(contentPulled).instructions,
                dirty: 0
              };
            });
          }
        }
      };
    }
  ]);

}).call(this);

/*
//@ sourceMappingURL=state.js.map
*/