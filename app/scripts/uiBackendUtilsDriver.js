(function() {
  angular.module('ldApp').factory('uiBackendUtilsDriver', [
    '$rootScope', 'command', 'DataDisassemblyParsers', 'state', function($rootScope, command, dataParsers, state) {
      var parsers, utilsDriver;
      parsers = dataParsers;
      utilsDriver = {
        /*
         * variable parsers is put there to make writing shorter
         * it is a collection of s for parsing output of
         * utilities that do the work
         * *
        */

        /*
         * this command gets elf and program headers
         *
        */

        getFileHeaders: function(file) {
          var fileHeadersiC;
          fileHeadersiC = function(data) {
            return state.fileHeaders = parsers.parseHeaders(data);
          };
          return command.commandExecO({
            ptyPayload: 'readelf -h -l ' + file,
            callback: fileHeadersC,
            msgType: 'exec'
          });
        },
        /*
         * sends command to invoke objdump to get headers
         * registers a callback that will call the parser  to parse output
         * and put everything in an array called sectionHeaders
         * also calls  that will get hexdump and that is the last
         * called when getting disassembly
         *
         *
        */

        getSectionHeaders: function(file) {
          var sectionHeadersC;
          sectionHeadersC = function(data) {
            state.sectionHeaders = parsers.parseSHeaders(data);
            return utilsDriver.getHexDump(file, utilsDriver.sectionHeaders);
          };
          return command.commandExecO({
            ptyPayload: 'arm-linux-gnueabi-objdump -h ' + file,
            callback: sectionHeadersC,
            msgType: 'exec'
          });
        },
        /*
         *
         *
        */

        getHeaders: function(file) {
          utilsDriver.getFileHeaders(file);
          return utilsDriver.getSectionHeaders(file);
        },
        /*
         * get disassembly
         *
        */

        getSectionDisassembly: function(file) {
          return command.commandExecO({
            callback: function(result) {
              return state.sectionData = parsers.processData(result);
            },
            msgType: 'exec',
            ptyPayload: 'arm-linux-gnueabi-objdump -D ' + file
          });
        },
        /*
         * gets output of hex dump from readelf utility
         * and puts result in hexDump field of every section in sectionData array
         * since this is the last  called in getting disassembly
         * it will call the doneLoading
         * it it stops being last  than this will have to change
         *
        */

        getHexDump: function(file, sectionHeaders) {
          return _.each(sectionHeaders, function(v, i) {
            var hd;
            hd = function(data) {
              state.sectionData[i].hexDump = parsers.parseXD(data.split("\n").slice(2, -2));
              if (i === sectionHeaders.length - 1) {
                return utilsDriver.doneLoading();
              }
            };
            return command.commandExecO({
              ptyPayload: 'readelf -x ' + v.name + ' ' + file,
              callback: hd,
              msgType: 'exec'
            });
          });
        },
        /*
         * triggers event that signals that a view should be updated since
         * data arived
         *
        */

        doneLoading: function() {
          return $rootScope.$emit("disassemblyDataLoaded", {
            utilsDriver: utilsDriver
          });
        },
        /*
         * this  calls s that get data from backend
         *
         *
        */

        disassemble: function(file, architecture) {
          this.getSectionDisassembly(file);
          return this.getHeaders(file);
        }
      };
      return utilsDriver;
    }
  ]);

}).call(this);

/*
//@ sourceMappingURL=uiBackendUtilsDriver.js.map
*/