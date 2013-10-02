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


  


  /*
   * this command will switch to vagrant directory and
   * check output of vagrant status if it's not created it will warn user
   * that a vm should be first downloaded and then provisioned
   * it can take a long time and can use up a lot of cpu installing
   * all of the stuff needed on a clean system like node bower and
   * modules and all of the components needed
   * */
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
  /*
   * start command is going to start qemu user emulator that will 
   * run this target and wait for a debuger to attach on 12345 port 
   * also it will start gdb that will load target from disk and then
   * commands set arch arm will be sent to the gdb
   * and target remote command to connect to the emulator
   *
   * */
  obj.startCommand = function (name,architecture) {
    command.commandExecO({
      msgType:'start',
      payload:{
        name:name,
        architecture:architecture
      },
      callback:null
    });

    /*
    command.commandExecO({
      ptyPayload:'set arch arm'
    });
    command.commandExecO({
      ptyPayload:'target remote :12345'
    });
    */
    obj.debugData.getDissasembly();
    obj.debugData.getRegisterInfo();
    obj.debugData.infoBreakpoints();

  };
  /*
   * stop command will send command to the gdb that will detach the debugger
   * qemu emulator exits at that point
   * then a quit command is sent and gdb exits
   * */
  obj.stop = function(){
  
    command.commandExecO({
      ptyPayload:'detach',
      callback:function detachC(){
      obj.debugData.status='detached';
      obj.debugData.registers=[];
      obj.data=[];
      }
    });
    
    command.commandExecO({
      ptyPayload:'quit',
      callback:null
    });
    
    //$scope.commandExecL('quit',null);
  }
  return obj;
}]);


