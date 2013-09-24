'use strict';
/*global _:false */
/*global io:false */

var supports3DTransforms =  document.body.style.webkitPerspective !== undefined ||
                            document.body.style.MozPerspective !== undefined;

/*
 * this is a linkify function from hakim.se site
 * it enables cool looking anchor tags but is commented out for now
 * */
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
/*
 * main controller is used to control the header of the page and controlls 
 * that are on display there
 * */
angular.module('ldApp')
  .controller('MainCtrl', function (command,$rootScope,$scope,$http,Data) {
    // linkify('a');

    $scope.data=Data;
    /*
     * old function not to be used
     * */
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

    /*
     * this is targets name as observable
     * following code should change
     * */
    $scope.file=Data.sharedData.fileName;
    $scope.sharedData=Data.sharedData;
    Data.scope=$scope;
    
    /*
     * following scope functions just forward to functions on data module
     * */
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
      Data.stop();
    };
    $scope.stepOver = function  () {
      command.commandExecO({ptyPayload:'ni'});
      Data.getDissasembly();
      Data.getRegisterInfo();
    };
    $scope.cont = function  () {
      command.commandExecO({ptyPayload:'c'});
      Data.getDissasembly();
      Data.getRegisterInfo();
      Data.infoBreakpoints();
    };
    $scope.stepInto = function  () {
      command.commandExecO({ptyPayload:'si'});
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
