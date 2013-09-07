'use strict';
/*global _:false */
/*global io:false */

var supports3DTransforms =  document.body.style.webkitPerspective !== undefined ||
                            document.body.style.MozPerspective !== undefined;


function linkify( selector ) {
  if( supports3DTransforms ) {

    var nodes = document.querySelectorAll( selector );
    for(var i=0,len=nodes.length; i<len;i++){
      var node=nodes[i];
      if( !node.className || !node.className.match( /roll/g ) ) {
        node.className += ' roll';
        node.innerHTML = '<span data-title="'+ node.text +'">' + node.innerHTML + '</span>';
      }
    }
  }
}

var socket;
angular.module('ldApp').directive('draggable', function() {
  var ddo = {
    link: function(scope,iElement,iAttrs) {
      $(iElement).draggable({
        snap:true,
        grid:[20,20]
      });

    }
  };
  return ddo;
});
angular.module('ldApp').directive('resizable', function() {
  var ddo = {
    link: function(scope,iElement,iAttrs) {
      $(iElement).resizable({
        
        grid:[20,20]
      });

    }
  };
  return ddo;
});

angular.module('ldApp').factory('Data',function(){
  //gdb service
  var obj={
    data:[],
    sharedData:{
      result:[],
      resultRaw:[],
      registers:'',
      breakpoints:[]
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
  obj.getDissasembly = function getDissasembly () {

    obj.callbackQueue.push(dissasemblyCallback);
    socket.emit('command', { ptyPayload: 'disas $pc-80,$pc+80' });
  };
  obj.getRegisterInfo = function (){
    obj.callbackQueue.push(function (){
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
    obj.callbackQueue.push(function() {});
    
    socket.emit('command',{
      ptyPayload: 'break *' + address       
    });
    
  };
  obj.removeBreakpoint = function(address) {
    obj.callbackQueue.push(function() {});
    socket.emit('command',{
      ptyPayload : 'clear *' + address
    });
  
  };
  obj.infoBreakpoints = function(){
    obj.callbackQueue.push(function() {
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
  obj.startCommand = function (name) {


    obj.callbackQueue.push(function() {});
    obj.callbackQueue.push(function() {});
    obj.callbackQueue.push(function() {});
    socket.emit('start', { name: name });
    socket.emit('command', { ptyPayload: 'set arch arm' });
    socket.emit('command', { ptyPayload: 'target remote :12345' });
    obj.getDissasembly();
    obj.getRegisterInfo();
    obj.infoBreakpoints();
    
  };
  obj.sock=socket = io.connect('http://localhost:807');

  socket.on('news', function (data) {
    console.log(data);
    var dataSplited = data.data.split('\n') ;
    obj.sharedData.resultRaw = obj.sharedData.resultRaw.concat(dataSplited);
    obj.sharedData.result=obj.sharedData.resultRaw;
    var last = obj.sharedData.resultRaw[obj.sharedData.resultRaw.length-1];
    if(last ==='(gdb) '){
      var callback = obj.callbackQueue.shift();
      if(callback){
        callback();
      }
      obj.sharedData.resultRaw=[];

    }
    if('scope' in obj){
      obj.scope.$apply();
    }
  });

  return obj;
});

angular.module('ldApp')
  .controller('MainCtrl2', function ($scope,$http,Data) {
    $scope.sharedData=Data.sharedData;
    $scope.toggleBreakpoint = function(address,thing) {
      thing.hasBreakpoint = thing.hasBreakpoint?false:true;
      if(thing.hasBreakpoint){
        Data.setBreakpoint(address);
      }else{
        Date.removeBreakpoint(address);
      }
      
    };

    });
angular.module('ldApp')
  .controller('MainCtrl', function ($scope,$http,Data) {

    $scope.commandExecL=function(cmnd,resultVariable,splice1,splice2){
     // $scope.result=cmnd;
      if(resultVariable){
        Data.callbackQueue.push(function() {
          Data.sharedData[resultVariable]=Data.sharedData.result;
        });
      }else{
        Data.callbackQueue.push(function() {});
      }
      Data.sock.emit('command',{
                         ptyPayload:cmnd
      });
    }
    $scope.file='proba';
    $scope.sharedData=Data.sharedData;
    Data.scope=$scope;
    $scope.commandStart=function(){
      Data.startCommand($scope.file);
    };
    $scope.registerInfo = function() {
      Data.getRegisterInfo();

    };
    $scope.stepOver = function  () {
      $scope.commandExecL('ni');
      Data.getDissasembly();
      Data.getRegisterInfo();
    };
    $scope.cont = function  () {
      $scope.commandExecL('c');
      Data.getDissasembly();
      Data.getRegisterInfo();
      Data.infoBreakpoints();
    };
    $scope.stepInto = function  () {
      $scope.commandExecL('si');
      Data.getDissasembly();
      Data.getRegisterInfo();
    };
    $scope.command='';
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma',
    ];
  });

