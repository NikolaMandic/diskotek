angular.module('ldApp').factory 'uiBackendUtilsDriver',['$rootScope','command','DataDisassemblyParsers', 'state' , ($rootScope,command,dataParsers,state) ->

  parsers=dataParsers
  utilsDriver=
    ###
     * variable parsers is put there to make writing shorter
     * it is a collection of s for parsing output of
     * utilities that do the work
     * * ###

    ###
     * this command gets elf and program headers
     * ###
    getFileHeaders:(file)->
      # callback for puting them in state
      fileHeadersiC = (data)->
        state.fileHeaders=parsers.parseHeaders(data)

      # get file headers
      command.commandExecO(
        ptyPayload:'readelf -h -l ' + file,
        callback:fileHeadersC,
        msgType:'exec'
      )


    ###
     * sends command to invoke objdump to get headers
     * registers a callback that will call the parser  to parse output
     * and put everything in an array called sectionHeaders
     * also calls  that will get hexdump and that is the last
     * called when getting disassembly
     *
     * ###
    getSectionHeaders:(file)->
      sectionHeadersC = (data)->
        state.sectionHeaders=parsers.parseSHeaders(data)

        utilsDriver.getHexDump(file,utilsDriver.sectionHeaders)

      command.commandExecO(
        ptyPayload:'arm-linux-gnueabi-objdump -h ' + file,
        callback:sectionHeadersC,
        msgType:'exec'
      )


    ###
     *
     * ###
    getHeaders : (file)->
      utilsDriver.getFileHeaders(file)
      utilsDriver.getSectionHeaders(file)


    ###
     * get disassembly
     * ###
    getSectionDisassembly:(file)->
      command.commandExecO(
        callback: (result)->
          # parse result of a -D command
          state.sectionData=parsers.processData(result)
        ,
        msgType: 'exec',
        ptyPayload:'arm-linux-gnueabi-objdump -D ' + file

      )


    ###
     * gets output of hex dump from readelf utility
     * and puts result in hexDump field of every section in sectionData array
     * since this is the last  called in getting disassembly
     * it will call the doneLoading
     * it it stops being last  than this will have to change
     * ###
    getHexDump:(file,sectionHeaders)->
      _.each(sectionHeaders,(v,i)->
        hd=(data)->
          state.sectionData[i].hexDump=parsers.parseXD(data.split("\n").slice(2,-2))
          if(i==sectionHeaders.length-1)
            utilsDriver.doneLoading()


        command.commandExecO({
          ptyPayload:'readelf -x '+v.name+' '+file,
          callback:hd,
          msgType:'exec'
        })
      )


    ###
     * triggers event that signals that a view should be updated since
     * data arived
     * ###
    doneLoading:()->
      $rootScope.$emit("disassemblyDataLoaded",{
        utilsDriver:utilsDriver
      })

    ###
     * this  calls s that get data from backend
     *
     * ###
    disassemble : (file,architecture)->
      @getSectionDisassembly(file)
      @getHeaders(file)



  return utilsDriver
]
