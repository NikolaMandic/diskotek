
angular.module('ldApp').factory('DataDebug',['command','DataDisassemblyParsers',
                                function(command,dataParsers){
 var debugData = {};
  //transforms command output recived from server into array of instructions
  debugData.dissasemblyCallback= function dissasemblyCallback(disassemblyRaw){
    
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
   debugData.disassembly=disasObjArr;
/*    
    disassemblyData.sharedData.disasArr=disasObjArr;

    //find instructions that are jumped on and put it in boundaries
    _.each(branchArray,function(value){
      var elem = _.findWhere(disasObjArr,{'address':value.operands.substring(1)});
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
        if(value.uppperBoundary===true){
          basicBlocks.push([]);
          basicBlocks[basicBlocks.length-1].push(value);

        }
        if(value.bottomBoundary===true){
          basicBlocks[basicBlocks.length-1].push(value);
        }
        boundaryArrC+=1;

      }else{
        basicBlocks[basicBlocks.length-1].push(value);
      }
    });

    disassemblyData.data=basicBlocks;
*/
  };
 debugData.getDissasembly = function getDissasembly () {

    obj.callbackQueue.push(debugData.dissasemblyCallback);
    socket.emit('command', { ptyPayload: 'disas $pc-80,$pc+80' });
  };
  debugData.getRegisterInfo = function (){
    debugData.callbackQueue.push(function getRegInfoC(result){
       debugData.registers = result.slice(0,-1).map(function(value){
        var s=value.split(/(\w+)\s*(\w+)\s*(\w+)/);
        return {
          name:s[1],
          value1:s[2],
          value2:s[3],

        };
      });
    });

    socket.emit('command', { ptyPayload: 'info registers' });
  };
  debugData.setBreakpoint = function(address) {
    obj.callbackQueue.push(function setBreakpointC() {});

    socket.emit('command',{
      ptyPayload: 'break *' + address
    });

  };

  debugData.removeBreakpoint = function(address) {
    obj.callbackQueue.push(function removeBreakpointC() {});
    socket.emit('command',{
      ptyPayload : 'clear *' + address
    });

  };
  debugData.infoBreakpoints = function(){
    command.callbackQueue.push(function infoBreakpointsC(result) {
      if(result[0].match(/^No.*/)){
        return;
      }
      debugData.breakpoints = result.slice(1).map(function(value) {
        var split = value.split(/\s*(\w+)\s*(\w+)\s*(\w+)\s*(\w+)\s*(\w*)\s*/);
        return{
          num:split[1],
          type:split[2],
          disp:split[3],
          enb:split[4],
          address:split[5],
          what:split[6]
        };
      });
      if(debugData.disassembly){
        _.each(debugData.breakpoints,function(value){
          var elem = _.findWhere(debugData.disassembly,{'address':value.address});
          if(elem){
            var indexDest = _.indexOf(debugData.disassembly,elem);
            if(indexDest!==-1){
              elem.hasBreakpoint=true;
            }
          }

        });

      }
     });
    socket.emit('command',{
      ptyPayload : 'info break'
    });
    
  };
  return debugData;
                                
                               
                                
}]);
