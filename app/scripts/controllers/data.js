'use strict';
/*global _:false */
/*global io:false */
/*global confirm:false */
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

  //obj.bbfd=DisasData.bbfd;

  



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
  return obj;
}]);


