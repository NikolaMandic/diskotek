angular.module('ldApp').factory('Data',function(){
  //gdb service
  var obj={
    data:[],
    sharedData:{
      result:[],
      resultRaw:[],
      registers:'',
      breakpoints:[],
      disasViewData:{sectionD:[{}]}
    },
    sock:socket
  };

  obj.callbackQueue=[];

  function dissasemblyCallback(){
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

  }
  obj.commandExecL=function(cmnd,resultVariable,splice1,splice2){
    // $scope.result=cmnd;
    if(_.isFunction(resultVariable)){
    
        obj.callbackQueue.push(resultVariable);
    }else{
      if(resultVariable){
        obj.callbackQueue.push(function putStuffinResultC() {
          obj.sharedData[resultVariable]=obj.sharedData.result;
        });
      }else{
        if(resultVariable!==null ){
          obj.callbackQueue.push(function anonCallback() {});
        }
      }
    }
    obj.sock.emit('command',{
      ptyPayload:cmnd
    });

  };
  obj.commandExecLO=function(args){//cmnd,resultVariable,splice1,splice2){

    // $scope.result=cmnd;
    if(_.isFunction(args.resultVariable)){
    
        obj.callbackQueue.push(args.resultVariable);
    }else{
      if(args.resultVariable){
        obj.callbackQueue.push(function putStuffinResultC() {
          obj.sharedData[args.resultVariable]=obj.sharedData.result;
        });
      }else{
        if(args.resultVariable!==null ){
          obj.callbackQueue.push(function anonCallback() {});
        }
      }
    }
    obj.sock.emit(args.msgType|'command',{
      ptyPayload:args.cmnd
    });

  };
  obj.commandExecO=function(args){//cmnd,resultVariable,splice1,splice2){

    // $scope.result=cmnd;
    if(_.isFunction(args.callback)){
    
        obj.callbackQueue.push(args.callback);
    }else{
      if(args.resultVariable){
        obj.callbackQueue.push(function putStuffinResultC() {
          obj.sharedData[args.resultVariable]=obj.sharedData.result;
        });
      }else{
        if(args.resultVariable!==null ){
          obj.callbackQueue.push(function anonCallback() {});
        }
      }
    }
    var msgType = (args.msgType)?args.msgType : 'command';
    var cmd = (args.ptyPayload)?args.ptyPayload : args.cmnd;
    socket.emit(msgType,{
      ptyPayload:cmd
    });

  };

  obj.getDissasembly = function getDissasembly () {

    obj.callbackQueue.push(dissasemblyCallback);
    socket.emit('command', { ptyPayload: 'disas $pc-80,$pc+80' });
  };
  obj.getRegisterInfo = function (){
    obj.callbackQueue.push(function getRegInfoC(){
      obj.sharedData.registers = obj.sharedData.result.slice(0,-1).map(function(value){
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
  obj.setBreakpoint = function(address) {
    obj.callbackQueue.push(function setBreakpointC() {});
    
    socket.emit('command',{
      ptyPayload: 'break *' + address       
    });
    
  };
  obj.removeBreakpoint = function(address) {
    obj.callbackQueue.push(function removeBreakpointC() {});
    socket.emit('command',{
      ptyPayload : 'clear *' + address
    });
  
  };
  obj.disassemble = function(file) {
    function processData(data){
      return _.map(data.split("\n\nD").splice(1),function(item,index){
        var split = item.split("\n\n");
        //console.log("splited");
        //console.log(split);
        var re = /(\.?\w+)\:$/g;
        var sectionName = re.exec(split[0])[1];
        var sectionContentRaw=split[1];
        var cont=split.splice(1);

        var sectionContent = cont.map(function(sitem,sindex){
          var c = sitem.split('\n');
          //console.log(c);
          var symName = (/<(.+)>\:$/g).exec(c[0])[1];
          //console.log(symName);
          var cs=c.slice(1,-1);
          var symContent = cs.map(function(vitem,vindex){
            // console.log(vitem);
            //console.log('vindex'+vindex);
            var re = (/\s*(\w+):\s*([a-f0-9]+)\s*(\w+)\s+([^;]+)\s*(;.*)?/g);
            var instr = re.exec(vitem);
            if(vitem.match(re)){
              return {
                address:instr[1],
                memraw:instr[2],
                op: instr[3] +' '+ instr[4],
                comments: instr[5]
              };
            }else{
              return{
                address:'',
                memraw:'',
                op:'',
                comments:''
              };
            }
          });
          //console.log('sindex'+sindex);
          return {
            symName:symName,
            symContent:symContent
          };
        });
        return {
          sectionName:sectionName,
          sectionContentRaw:sectionContentRaw,
          sectionContent:sectionContent
        };
      })
    }
    obj.commandExecO({
      callback: function(result){
        obj.sharedData.disasViewData.sectionD=processData(result);
      },
      msgType: 'exec',
      ptyPayload:'arm-linux-gnueabi-objdump -D proba'

    });
    
  };
  obj.infoBreakpoints = function(){
    obj.callbackQueue.push(function infoBreakpointsC() {
      if(obj.sharedData.result[0].match(/^No.*/)){
      return;
      }
      obj.sharedData.breakpoints = obj.sharedData.result.slice(1).map(function(value) {
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
      if(obj.sharedData.disasArr){
        _.each(obj.sharedData.breakpoints,function(value){
          var elem = _.findWhere(obj.sharedData.disasArr,{'address':value.address});
          if(elem){
            var indexDest = _.indexOf(obj.sharedData.disasArr,elem);
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
  obj.startCommandVM = function(name) {
    socket.emit('debugInVM',{
      name:name
    });
  };
  obj.startCommand = function (name) {


    obj.callbackQueue.push(function callbackForStart() {});
    obj.callbackQueue.push(function callbackForArchSet() {});
    obj.callbackQueue.push(function callbackForTarget() {});
    socket.emit('start', { name: name });
    socket.emit('command', { ptyPayload: 'set arch arm' });
    socket.emit('command', { ptyPayload: 'target remote :12345' });
    obj.getDissasembly();
    obj.getRegisterInfo();
    obj.infoBreakpoints();
    
  };
  obj.sock=socket = io.connect('http://localhost:807');
  socket.on('execNews',function (data) {
      var data = data.data;
      var callback = obj.callbackQueue.shift();
      if(callback){
        callback(data);
      }
  });
  socket.on('debugInVMNews',function (argument) {
     window.location('localhost:8080/index.html#/'); 
  });
  socket.on('news', function (data) {
    console.log(data);
    var dataSplited = data.data.split('\n') ;
    obj.sharedData.resultRaw = obj.sharedData.resultRaw.concat(dataSplited);
    obj.sharedData.result=obj.sharedData.resultRaw;
    var last = obj.sharedData.resultRaw[obj.sharedData.resultRaw.length-1];
    if(last ==='(gdb) '){
      var callback = obj.callbackQueue.shift();
      if(callback){
        callback(obj.sharedData.result);
      }
      obj.sharedData.resultRaw=[];

    }
    if('scope' in obj){
      obj.scope.$apply();
    }
  });

  return obj;
});


