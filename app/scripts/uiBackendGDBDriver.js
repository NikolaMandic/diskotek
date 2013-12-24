(function() {
  angular.module('ldApp').factory('DataDebug', [
    '$rootScope', 'command', 'DataDisassemblyParsers', function($rootScope, command, dataParsers) {
      var debugData;
      debugData = {
        arch: 'x86',
        commands: {
          x86: {
            disassembly: 'disas /rm $eip-40,$eip+40'
          },
          arm: {
            disassembly: 'disas /rm $pc-80,$pc+80'
          }
        },
        getDissasembly: function() {
          command.commandExecO({
            ptyPayload: debugData.commands[debugData.arch].disassembly,
            callback: function(data) {
              return debugData.disassembly = dataParsers[debugData.arch].disassemblyParser(data).combined;
            }
          });
          debugData.__lookupGetter__("disassembly", function(p) {
            return value;
          });
          obj.callbackQueue.push(debugData.dissasemblyCallback);
          return socket.emit('command', {
            ptyPayload: 'disas $pc-80,$pc+80'
          });
        }
      };
      ({
        patch: function(thing) {
          return console.log('patch', thing);
        },
        stepOver: function() {
          command.commandExecO({
            ptyPayload: 'ni'
          });
          debugData.getDissasembly();
          return debugData.getRegisterInfo();
        },
        getRegisterInfo: function() {
          var getRegInfoC;
          return command.commandExecO({
            callback: getRegInfoC = function(result) {
              debugData.registers = result.slice(0, -1).map(function(value) {
                var s;
                s = value.split(/(\w+)\s*(\w+)\s*(\w+)/);
                return {
                  name: s[1],
                  value1: s[2],
                  value2: s[3]
                };
              });
              /*
              if (_.pluck(debugData.registers,name:'eip').value1-_.pluck(debugData.registersNew,name:'eip').value1)
              */

              return $rootScope.$emit('debugDataLoaded');
            },
            ptyPayload: 'info registers'
          });
        },
        setBreakpoint: function(address) {
          return command.commandExecO({
            ptyPayload: 'break *' + address
          });
          /*
          socket.emit('command',
            ptyPayload: 'break *' + address
          )
          */

        },
        removeBreakpoint: function(address) {
          return command.commandExecO({
            ptyPayload: 'clear *' + address
          });
        },
        infoBreakpoints: function() {
          var infoBreakpointsC;
          infoBreakpointsC = function(result) {
            if (result[0].match(/^No.*/)) {

            } else {
              debugData.breakpoints = result.slice(1).map(function(value) {
                var split;
                split = value.split(/\s*(\w+)\s*(\w+)\s*(\w+)\s*(\w+)\s*(\w*)\s*/);
                return {
                  num: split[1],
                  type: split[2],
                  disp: split[3],
                  enb: split[4],
                  address: split[5],
                  what: split[6]
                };
              });
              if (debugData.disassembly) {
                _.each(debugData.breakpoints, function(value) {
                  var elem, indexDest;
                  elem = _.findWhere(debugData.disassembly, {
                    'address': value.address
                  });
                  if (elem) {
                    indexDest = _.indexOf(debugData.disassembly, elem);
                    if (indexDest !== -1) {
                      return elem.hasBreakpoint = true;
                    }
                  }
                });
              }
            }
            return $rootScope.$emit('debugDataLoaded');
          };
          return command.commandExecO({
            callback: infoBreakpointsC,
            ptyPayload: 'info break'
          });
        }
      });
      return debugData;
    }
  ]);

}).call(this);

/*
//@ sourceMappingURL=uiBackendGDBDriver.js.map
*/