
angular.module('ldApp').factory('DataDebug',['$rootScope','command','DataDisassemblyParsers',
                                function($rootScope,command,dataParsers){
 var debugData = {
   arch:'x86'
 };
  //transforms command output recived from server into array of instructions
  debugData.commands = {
    x86:{
      disassembly:'disas /rm $eip-40,$eip+40'//$eip,$eip+40'
    },
    arm:{
      disassembly:'disas /rm $pc-80,$pc+80'
    }
  };
  debugData.getDissasembly = function getDissasembly () {
   
   command.commandExecO({
     ptyPayload:debugData.commands[debugData.arch].disassembly,
     callback:function(data){
       debugData.disassembly=dataParsers[debugData.arch].disassemblyParser(data).combined;
     }

   });
   debugData.__lookupGetter__("disassembly", function(p){
     return value;
   });
              /*       
   debugData.__defineSetter__("disassembly", function(val){
     value = val;
   });
   debugData.__defineGetter__("registers", function(){
     return value;
   });
                     
   debugData.__defineSetter__("registers", function(val){
     value = val;
   });
   */
   /*
   obj.callbackQueue.push(debugData.dissasemblyCallback);
   socket.emit('command', { ptyPayload: 'disas $pc-80,$pc+80' });
   */
 };
 debugData.patch = function(thing){
   console.log('patch',thing);
 };
 debugData.stepOver = function(){
   command.commandExecO({ptyPayload:'ni'});

   debugData.getDissasembly();
   debugData.getRegisterInfo();
 }
 debugData.getRegisterInfo = function (){
   command.commandExecO({
     callback:function getRegInfoC(result){
       debugData.registers = result.slice(0,-1).map(function(value){
         var s=value.split(/(\w+)\s*(\w+)\s*(\w+)/);
         return {
           name:s[1],
           value1:s[2],
           value2:s[3],
         };
       });
       /*
      if (_.pluck(debugData.registers,{name:'eip'}).value1-_.pluck(debugData.registersNew,{name:'eip'}).value1){

      } 
      */
      $rootScope.$emit('debugDataLoaded');
     },
     ptyPayload:'info registers'
   });
    //debugData.callbackQueue.push();

    //socket.emit('command', { ptyPayload: 'info registers' });
  };
  debugData.setBreakpoint = function(address) {
    //obj.callbackQueue.push(function setBreakpointC() {});
    command.commandExecO({
      ptyPayload:'break *' + address
    });
    /*
    socket.emit('command',{
      ptyPayload: 'break *' + address
    });
    */
  };

  debugData.removeBreakpoint = function(address) {
    //obj.callbackQueue.push(function removeBreakpointC() {});
    command.commandExecO({
      ptyPayload: 'clear *' + address
    });
    /*
    socket.emit('command',{
      ptyPayload :    });
    */
  };
  debugData.infoBreakpoints = function(){
    //command.callbackQueue.push(
    function infoBreakpointsC(result) {
      if(result[0].match(/^No.*/)){
       
      }else{

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
      }
      $rootScope.$emit('debugDataLoaded');
    };
    command.commandExecO({
      callback:infoBreakpointsC,
      ptyPayload:'info break'

    });
                               //);
    //    socket.emit('command',{
    //  ptyPayload : 'info break'
    //});
    
  };
  return debugData;
                                
                               
                                
}]);
