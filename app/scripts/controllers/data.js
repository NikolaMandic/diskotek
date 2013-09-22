'use strict';
/*global _:false */
/*global io:false */
/*global confirm:false */
/*
 * this is the main module that keeps state of the application on the frontend
 *
 */
angular.module('ldApp')
.factory('Data',['$rootScope','command','DataDebug','DataDisassembly',
         function($rootScope,command,DataDebug,DataDisassembly){
  //gdb service
  var obj={
    debugData:DataDebug,
    disassemblyData:DataDisassembly,


    data:[],
    sharedData:{
      fileName:'proba',
      dUI:{
        statusLine:''
      },
      result:[],
      resultRaw:[],
      registers:'',
      breakpoints:[],
      disasViewData:{sectionD:[{}]}
    },
    sock:null
  };


  



  obj.startCommandVM = function(name) {
    command.commandExecO({
      msgType:'exec',
      ptyPayload:'cd vdir; vagrant status; cd ../',
      callback:function(data){
        var status = (/.*default\s+(\w+\s*\w+).*/).exec(data)[1];
        if(status==='not created'){
          if(confirm('VM is not created. If you click ok then background software will download 300+MB and do a bunch of CPU intensive config. Continue? ')){
            socket.emit('debugInVM',{
              name:name
            });
            socket.on('debugInVMStatus',function(data){
              obj.sharedData.dUI.statusLine=data.data;
              if('scope' in obj){
                obj.scope.$apply();
              }
            });
          }else{

          }
        }
      }
    });
  };
  obj.startCommand = function (name) {


    command.commandExecO({
      msgType:'start',
      payload:{name:name}
    });
    command.commandExecO({
      ptyPayload:'set arch arm'
    });
    command.commandExecO({
      ptyPayload:'target remote :12345'
    });
    obj.debugData.getDissasembly();
    obj.debugData.getRegisterInfo();
    obj.debugData.infoBreakpoints();

  };
  obj.stop = function(){
  
    command.commandExecO({
      ptyPayload:'detach',
      callback:function detachC(){
      obj.debugData.disassembly=['detached'];
      obj.debugData.registers=[];
      obj.data=[];
      }
    });
    command.commandExecO({
      ptyPayload:'quit'
    });
    //$scope.commandExecL('quit',null);
  }
  return obj;
}]);


