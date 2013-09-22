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
angular.module('ldApp')
  .controller('MainCtrl', function ($scope,$http,Data) {
    // linkify('a');

    $scope.dUI=Data.sharedData.dUI;
    $scope.commandExecL=function(cmnd,resultVariable,splice1,splice2){
     // $scope.result=cmnd;
      if(_.isFunction(resultVariable)){
      
          Data.callbackQueue.push(resultVariable);
      }else{
        if(resultVariable){
          Data.callbackQueue.push(function putStuffinResultC() {
            Data.sharedData[resultVariable]=Data.sharedData.result;
          });
        }else{
          if(resultVariable!==null ){
            Data.callbackQueue.push(function anonCallback() {});
          }
        }
      }
      Data.sock.emit('command',{
        ptyPayload:cmnd
      });

    };
    $scope.file=Data.sharedData.fileName;
    $scope.sharedData=Data.sharedData;
    Data.scope=$scope;
    
    $scope.commandStart=function(){
      Data.startCommand($scope.file);
    };
    $scope.commandStartVM=function() {
      Data.startCommandVM($scope.file);
    };
    $scope.registerInfo = function() {
      Data.getRegisterInfo();

    };
    $scope.commandDissasemble = function() {
      Data.disassemblyData.disassemble($scope.file);
    };
    $scope.stop = function() {
      $scope.commandExecL('detach',function detachC(){
        Data.sharedData.disasArr=['detached'];
        Data.sharedData.registers=[];
        Data.data=[];
      });
      $scope.commandExecL('quit',null);
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

