/*
 * this is a disassembly module that contains state for disassembly of 
 * a target also contains commands for disassembling a target
 *
 * it returns an object with following fields:
 * fileHeaders: contains elf header and program header
 *    { ehdr //elfheader
 *      phdr //program header
 *    }
 * sectionHeaders: // this is array of section headers
 * [
 *  //fields correspond to the output of objdump command
 *   { 
 *       name:, name of a section
 *       size:,
 *       VMA:,  //virtual mem addr
 *       LMA:,  //load addr 
 *       fOff:, //file offset
 *       align:,
 *       flags:,       
 *  
 *   },
 *   {
 *      name
 *      ....
 *   },
 * ]
 * */
angular.module('ldApp').factory('DataDisassembly',['$rootScope','command','DataDisassemblyParsers',
                                function($rootScope,command,dataParsers){
  var disassemblyData={};
  /*
   * variable parsers is put there to make writing shorter   
   * it is a collection of functions for parsing output of 
   * utilities that do the work 
   * * */
  var parsers=dataParsers;
  /*
   * this command gets elf and program headers
   * */
  disassemblyData.getFileHeaders=function(file){
    //get file headers
    function fileHeadersC (data){
      disassemblyData.fileHeaders=parsers.parseHeaders(data);
    }
    command.commandExecO({
      ptyPayload:'readelf -h -l ' + file,
      callback:fileHeadersC,
      msgType:'exec'
    });
  };

  /*
   * sends command to invoke objdump to get headers
   * registers a callback that will call the parser function to parse output
   * and put everything in an array called sectionHeaders 
   * also calls function that will get hexdump and that is the last function
   * called when getting disassembly 
   * 
   * */
  disassemblyData.getSectionHeaders=function(file){
    function sectionHeadersC (data){
      disassemblyData.sectionHeaders=parsers.parseSHeaders(data);

      disassemblyData.getHexDump(file,disassemblyData.sectionHeaders);
    }
    command.commandExecO({
      ptyPayload:'arm-linux-gnueabi-objdump -h ' + file,
      callback:sectionHeadersC,
      msgType:'exec'
    });
  };

  /*
   *
   * */
  disassemblyData.getHeaders = function (file){
    disassemblyData.getFileHeaders(file);
    disassemblyData.getSectionHeaders(file);
  };

  /*
   *get disassembly function
   * */
  disassemblyData.getSectionDisassembly=function(file){
    command.commandExecO({
      callback: function(result){
        //parse result of a -D command
        disassemblyData.sectionData=parsers.processData(result);
      },
      msgType: 'exec',
      ptyPayload:'arm-linux-gnueabi-objdump -D ' + file

    });
  };

  /*
   * gets output of hex dump from readelf utility
   * and puts result in hexDump field of every section in sectionData array
   * since this is the last function called in getting disassembly 
   * it will call the doneLoading function
   * it it stops being last function than this will have to change
   * */
  disassemblyData.getHexDump=function(file,sectionHeaders){
    _.each(sectionHeaders,function(v,i){
      function hd(data){
        disassemblyData.sectionData[i].hexDump=parsers.parseXD(data.split("\n").slice(2,-2));
        if(i==sectionHeaders.length-1){
          disassemblyData.doneLoading(); 
        }
      }
      command.commandExecO({
        ptyPayload:'readelf -x '+v.name+' '+file,
        callback:hd,
        msgType:'exec'
      });
    });
 
  };
  /*
   * triggers event that signals that a view should be updated since
   * data arived
   * */
  disassemblyData.doneLoading=function(){
     $rootScope.$emit("disassemblyDataLoaded",{
      disassemblyData:disassemblyData
    });
  };
  /*
   * this function calls functions that get data from backend
   * 
   * */
  disassemblyData.disassemble = function(file) {
    disassemblyData.getSectionDisassembly(file);
    disassemblyData.getHeaders(file);
  };
  
  //transforms command output recived from server into array of instructions
  disassemblyData.dissasemblyCallback= function 
    dissasemblyCallback(disassemblyRaw){
    
    var dissasembly= disassemblyRaw.slice(0,-1);
    var b = [];
    b.push([]);
    var basicBlocks=[];
    basicBlocks.push([]);

    var disasArr = [];
    var disasObjArr = [];
    //bbBoundaryArr.push({from:0,to:0});
    var boundaries=[];
    var branchPreviousInst=false;

    var branchArray=[];
    _.each(dissasembly,function(value){
      //detects disassembly line with => in it
      var disasLineCurrent=/^\=\>\s*(.*):\s+(\w+)([^;]*)(;(.*))?$/;
      //detects line from gdb output
      var disasLine=/^\s*(.*):\s+(\w+)([^;]*)(;(.*))?$/;

      var splitedInstruction;
      var typeOfReg ;
      var instObj ;
      if(value.match(disasLineCurrent)){
        splitedInstruction =  value.split(disasLineCurrent);
        typeOfReg=1;
        instObj ={
          current:true,
          address: splitedInstruction[1],
          opcode:  splitedInstruction[2],
          operands:splitedInstruction[3],
          comment: splitedInstruction[4],
        };
      }else if(value.match(disasLine)){
        splitedInstruction =  value.split(disasLine);
        typeOfReg=2;
        instObj ={
          current:false,
          address: splitedInstruction[1],
          opcode:  splitedInstruction[2],
          operands:splitedInstruction[3],
          comment: splitedInstruction[4],
          uppperBoundary:false,//true if it is upper boundary of basic block
          downBoundary:false,//bottom boundary
        };
      }

      if(splitedInstruction){
        if (branchPreviousInst){
          instObj.uppperBoundary=true;
          boundaries.push(instObj);
          branchPreviousInst=false;
        }
        if(splitedInstruction[2].match(/^b.*/)){
          branchPreviousInst=true;
          instObj.bottomBoundary=true;
          boundaries.push(instObj);
          branchArray.push(instObj);
        }else{
          if(boundaries.length===0){
            instObj.uppperBoundary=true;
            boundaries.push(instObj);
          }
        }
        disasArr.push(splitedInstruction);
        disasObjArr.push(instObj);

      }else{

      }


    });
   disassemblyData.disassembly=disasObjArr;
  };

  //return array of basic blocks from array of instructions
  disassemblyData.bbfd=function basicBlocksFromDisassembly(data){
    var disassembly = data;
    var b = [];
    b.push([]);
    var basicBlocks=[];
    basicBlocks.push([]);
    var disasArr = [];
    var disasObjArr = [];
    var boundaries=[];
    var branchPreviousInst=false;
    var branchArray=[];
    
    _.each(disassembly,function(value){
      if (branchPreviousInst){
        value.uppperBoundary=true;
        boundaries.push(value);
        branchPreviousInst=false;
      }
      if(value.op.match(/^b.*/)){
        branchPreviousInst=true;
        value.bottomBoundary=true;
        if(!branchPreviousInst){
          boundaries.push(value);
        }
        branchArray.push(value);
      }else{
        if(boundaries.length===0){
          value.uppperBoundary=true;
          boundaries.push(value);
        }
      }
      disasArr.push(value);
      disasObjArr.push(value);
    });


    //find instructions that are jumped on and put it in boundaries
    _.each(branchArray,function(value){
      var elem = _.findWhere(disasObjArr,{'address':(/\s*(\w+).*/).exec(value.operands)[1]});
      if(elem){
        var indexDest = _.indexOf(boundaries,elem);
        if(indexDest===-1){
          elem.up=true;
          boundaries.push(elem);
        }
      }

    });
    var boundariesSorted=_.sortBy(boundaries,'address');
    var boundaryArrC=0;
    _.each(disasObjArr,function(value){
      if(value===boundariesSorted[boundaryArrC]){
        if(value.uppperBoundary && value.bottomBoundary){
          basicBlocks.push([]);
          basicBlocks[basicBlocks.length-1].push(value);

          basicBlocks.push([]);
        }else{
          if(value.uppperBoundary===true){
            if(basicBlocks[basicBlocks.length-1].length!==0){
              basicBlocks.push([]);
            }
            basicBlocks[basicBlocks.length-1].push(value);

          }
          if(value.bottomBoundary===true){
            basicBlocks[basicBlocks.length-1].push(value);
          }
        }
        boundaryArrC+=1;

      }else{
        basicBlocks[basicBlocks.length-1].push(value);
      }
    });
    return basicBlocks;
  };

  return disassemblyData;
}]);
