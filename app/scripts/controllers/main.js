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
angular.module('ldApp').factory('Data',function(){
  //gdb service
  var obj={
    //idata:[],
    sharedData:{
      result:[],
      resultRaw:[],
      registers:''
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

    obj.data=obj.sharedData.disassebmly;//basicBlocks;

  }
  obj.getDissasembly = function getDissasembly () {

    obj.callbackQueue.push(dissasemblyCallback);
    socket.emit('command', { ptyPayload: 'disas $pc,$pc+1000' });
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
  obj.startCommand = function (name) {


    obj.callbackQueue.push(function() {});
    obj.callbackQueue.push(function() {});
    obj.callbackQueue.push(function() {});
    socket.emit('start', { name: name });
    socket.emit('command', { ptyPayload: 'set arch arm' });
    socket.emit('command', { ptyPayload: 'target remote :12345' });
    obj.getDissasembly();
    obj.getRegisterInfo();

    
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
    });
angular.module('ldApp')
  .controller('MainCtrl', function ($scope,$http,Data) {

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
      $scope.disasR();
      $scope.registerInfo();
    };
    $scope.stepInto = function  () {
      $scope.commandExecL('si');
      $scope.disasR().always(function(){
        $scope.dcd();
      });

      $scope.registerInfo();
    };

    $scope.command='';
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma',
    ];
  });

