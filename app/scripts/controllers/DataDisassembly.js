/*
 * this is a disassembly module that contains state for disassembly of 
 * a target also contains commands for disassembling a target
 *
 * it returns an object with following fields:<br/>
 * fileHeaders: contains elf header and program header<br/>
 * &nbsp; &nbsp; {<br/>
 * &nbsp; &nbsp;&nbsp; &nbsp;ehdr //elfheader<br/>
 * &nbsp; &nbsp; &nbsp; &nbsp;  phdr //program header<br/>
 *  &nbsp; &nbsp;  }<br/>
 * sectionHeaders: // this is array of section headers<br/>
 * &nbsp; &nbsp;[<br/>
 * &nbsp; &nbsp;&nbsp; &nbsp;//fields correspond to the output of objdump command<br/>
 * &nbsp; &nbsp;&nbsp; &nbsp;{ <br/>
 *  &nbsp; &nbsp;&nbsp; &nbsp;&nbsp; &nbsp;name:, name of a section<br/>
 * &nbsp; &nbsp;&nbsp; &nbsp;&nbsp; &nbsp;size:,<br/>
 * &nbsp; &nbsp;&nbsp; &nbsp;&nbsp; &nbsp;VMA:,  //virtual mem addr<br/>
 *  &nbsp; &nbsp;&nbsp; &nbsp;&nbsp; &nbsp;LMA:,  //load addr <br/>
 *  &nbsp; &nbsp;&nbsp; &nbsp;&nbsp; &nbsp;fOff:, //file offset<br/>
 * &nbsp; &nbsp;&nbsp; &nbsp;&nbsp; &nbsp;align:,<br/>
 * &nbsp; &nbsp;&nbsp; &nbsp;&nbsp; &nbsp;flags:,       <br/>
 *  <br/>
 *  &nbsp; &nbsp;&nbsp; &nbsp; },<br/>
 *  &nbsp; &nbsp; &nbsp; &nbsp;{<br/>
 *  &nbsp; &nbsp;&nbsp; &nbsp;&nbsp; &nbsp;    name<br/>
 *   &nbsp; &nbsp;&nbsp; &nbsp;&nbsp; &nbsp;   ....<br/>
 *  &nbsp; &nbsp;&nbsp; &nbsp; },<br/>
 * &nbsp; &nbsp;]<br/>
 * */
angular.module('ldApp').factory('DataDisassembly',['$rootScope','command','DataDisassemblyParsers','configState',
                                function($rootScope,command,dataParsers,configState){
  var disassemblyData={};
  var commands={
   'x86 elf':{
     getSectionDisassembly: 'objdump -M intel -D ',

     getSectionHeaders: 'objdump -M intel -h '
   },
   'arm elf':{
   
     getSectionDisassembly: 'arm-linux-gnueabi-objdump -D ',

     getSectionHeaders: 'arm-linux-gnueabi-objdump -h '
   }
  };
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
    // get file headers
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
      if(!data.match(/no loadable/g)){
        disassemblyData.sectionHeaders=parsers.parseSHeaders(data);

        disassemblyData.getHexDump(file,disassemblyData.sectionHeaders);
      }
    }
    command.commandExecO({
      ptyPayload:commands[configState.architecture].getSectionHeaders  + file,
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
   * get disassembly function
   * */
  disassemblyData.getSectionDisassembly=function(file){
    command.commandExecO({
      callback: function(result){
        // parse result of a -D command
        disassemblyData.sectionData=parsers.processData(result);
      },
      msgType: 'exec',
      ptyPayload:commands[configState.architecture].getSectionDisassembly + file

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
    if(sectionHeaders.length===0){
    
      disassemblyData.doneLoading(); 
    } 
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
  disassemblyData.disassemble = function(file,architecture) {
    disassemblyData.getSectionDisassembly(file);
    disassemblyData.getHeaders(file);
  };
  
  // transforms command output recived from server into array of instructions
  disassemblyData.dissasemblyCallback= function 
    dissasemblyCallback(disassemblyRaw){
    
    var dissasembly= disassemblyRaw.slice(0,-1);
    var b = [];
    b.push([]);
    var basicBlocks=[];
    basicBlocks.push([]);

    var disasArr = [];
    var disasObjArr = [];
    // bbBoundaryArr.push({from:0,to:0});
    var boundaries=[];
    var branchPreviousInst=false;

    var branchArray=[];
    //f or each disassembly line 
    _.each(dissasembly,function(value){
      // detects disassembly line with => in it
      var disasLineCurrent=/^\=\>\s*(.*):\s+(\w+)([^;]*)(;(.*))?$/;
      // detects line from gdb output
      var disasLine=/^\s*(.*):\s+(\w+)([^;]*)(;(.*))?$/;

      var splitedInstruction;
      var typeOfReg ;
      var instObj ;
      // if line has =>
      if(value.match(disasLineCurrent)){
        splitedInstruction =  value.split(disasLineCurrent);
        typeOfReg=1;
        // create object representing instruction
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
        // create object representing instruction
        instObj ={
          current:false,
          address: splitedInstruction[1],
          opcode:  splitedInstruction[2],
          operands:splitedInstruction[3],
          comment: splitedInstruction[4],
          uppperBoundary:false,// true if it is upper boundary of basic block
          downBoundary:false,// bottom boundary
        };
      }
      // if instructon detected
      if(splitedInstruction){
        disasObjArr.push(instObj);
      }


    });
   disassemblyData.disassembly=disasObjArr;
  };

  // return array of basic blocks from array of instructions
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
    // for each instruction 
    _.each(disassembly,function(value){
      // check if last instruction in loop was branch
      if (branchPreviousInst){
        // if so then mark this instruction as first in basic block
        value.uppperBoundary=true;
        // and push it in array of instructions that are boundaries of blocks
        boundaries.push(value);
        // set this indicator to false; following part sets it right
        branchPreviousInst=false;
      }
      // is it branch
      if(value.op.match(/^b.*/)){
        // if it is set indicator for next time
        branchPreviousInst=true;
        // if it is branch it means it is last in a  basic block
        value.bottomBoundary=true;
        // it is branch so put it in boundaries array
        boundaries.push(value);
        // and in special branch array to be used latter
        branchArray.push(value);
      }else{
        // if it is first instruction mark it as boundary of block
        if(boundaries.length===0){
          value.uppperBoundary=true;
          boundaries.push(value);
        }
      }
      // push instruction in arrays
      disasArr.push(value);
      disasObjArr.push(value);
    });


    // find instructions that are jumped on and put it in boundaries
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
    // sort boundaries by addresses this is needed because
    // maybe some are inserted in the last step
    var boundariesSorted=_.sortBy(boundaries,'address');
    var boundaryArrC=0;
    /* now step trough each instruction and figure out 
    * should a new basic be made or should it be put in current one
    * algo goes instruction one by one while doing special work
    * when it encounters boundary of basic block
    */
    _.each(disasObjArr,function(value){
      // if current instruction is the boundary we did not processed
      if(value===boundariesSorted[boundaryArrC]){
        /* check to se if it is both upper and bottom boundary
        * which is the case when a branch is jumped on by
        * some other branch
         */
        if(value.uppperBoundary && value.bottomBoundary){
          // in that case just create new basic block put this one instruction 
          basicBlocks.push([]);
          basicBlocks[basicBlocks.length-1].push(value);
          // and create new basic block
          basicBlocks.push([]);
        }else{
          // if just upper boundary and not upper and bottom
          if(value.uppperBoundary===true){
            /** this should check for edge case for like first block
            * to make algorithm easier
            * if upper boundary and last basic block not empty
            * create new basic block where instructions will be put
            */
            if(basicBlocks[basicBlocks.length-1].length!==0){
              basicBlocks.push([]);
            }
            
            basicBlocks[basicBlocks.length-1].push(value);

          }
          // if bottom boundary push it in current basic block
          if(value.bottomBoundary===true){
            basicBlocks[basicBlocks.length-1].push(value);
          }
        }
        // increase counter that marks the boundary that is next to be 
        // processed
        
        boundaryArrC+=1;

      }else{
        // non boundary instructions just go in current basic block
        basicBlocks[basicBlocks.length-1].push(value);
      }
    });
    return basicBlocks;
  };

  return disassemblyData;
}]);
