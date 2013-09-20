
angular.module('ldApp').factory('DisasData',['DataHeaders',function(dataHeaders){
  var obj={};
  obj.parsers=dataHeaders;
  obj.dissasemblyCallback= function dissasemblyCallback(){
    obj.sharedData.dissasembly= obj.sharedData.result.slice(0,-1);
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
    _.each(obj.sharedData.dissasembly,function(value){
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


    obj.sharedData.disasArr=disasObjArr;

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

    obj.data=basicBlocks;

  };
  obj.bbfd=function basicBlocksFromDisassembly(data){
    var disassembly = data;
    //obj.sharedData.dissasembly = data;
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


    //obj.sharedData.disasArr=disasObjArr;

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

    obj.data=basicBlocks;
    return basicBlocks;

  };

  return obj;
}]);
