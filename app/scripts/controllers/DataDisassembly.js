
angular.module('ldApp').factory('DataDisassembly',['$rootScope','command','DataDisassemblyParsers',
                                function($rootScope,command,dataParsers){
  var disassemblyData={};
  var parsers=dataParsers;
  
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
  disassemblyData.getSectionHeaders=function(file){
    //get section headers
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
  disassemblyData.getHeaders = function (file){
    disassemblyData.getFileHeaders(file);
    disassemblyData.getSectionHeaders(file);
  };
  disassemblyData.getSectionDisassembly=function(file){
    command.commandExecO({
      callback: function(result){
        //parse result of a -D command
        disassemblyData.sectionData=parsers.processData(result);
        //var texts = _.findWhere(obj.sharedData.disasViewData.sectionD,{sectionName:'.text'});
        //obj.bbfd(_.flatten(_.pluck(texts.sectionContent,'symContent')));
      },
      msgType: 'exec',
      ptyPayload:'arm-linux-gnueabi-objdump -D ' + file

    });
  };
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
  disassemblyData.doneLoading=function(){
    
    $rootScope.$emit("disassemblyDataLoaded",{
      disassemblyData:disassemblyData
    });
  };
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
