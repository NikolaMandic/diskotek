'use strict';
/*global _:false */
/*global io:false */
/*global confirm:false */
angular.module('ldApp')
.factory('Data',['$rootScope','DisasData',function($rootScope,DisasData){
  //gdb service
  var obj={
    data:[],
    sharedData:{
      fileName:'proba',
      dUI:{statusLine:''},
      result:[],
      resultRaw:[],
      registers:'',
      breakpoints:[],
      disasViewData:{sectionD:[{}]}
    },
    sock:null
  };

  obj.callbackQueue=[];
  obj.bbfd=DisasData.bbfd;
  obj.getHexDump=function(name){
  
  }
  obj.getHeaders = function (){
    function callbh (data){
      obj.sharedData.disasViewData.headers=DisasData.parsers.parseHeaders(data);
      function callbb (data){
        var sh=obj.sharedData.disasViewData.sheaders=DisasData.parsers.parseSHeaders(data);
        _.each(sh,function(v,i){
        function hd(data){
          obj.sharedData.disasViewData.sectionD[i].hexDump=DisasData.parsers.parseXD(data.split("\n").slice(2,-2));
        }
          obj.commandExecO({
            ptyPayload:'readelf -x '+v.name+' '+obj.sharedData.fileName,
            callback:hd,
            msgType:'exec'
          });
 
        });
        $rootScope.$emit("disassemblyDataLoaded");
      }

      obj.commandExecO({
        ptyPayload:'arm-linux-gnueabi-objdump -h ' + obj.sharedData.fileName,
        callback:callbb,
        msgType:'exec'
      });
    }
    obj.commandExecO({
      ptyPayload:'readelf -h -l ' + obj.sharedData.fileName ,
      callback:callbh,
      msgType:'exec'
    });
  };
  obj.commandExecL=function(cmnd,resultVariable/*,splice1,splice2*/){
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
    var commandType = args.msgType || 'command';
    /*
    if(args.msgType){
      commandType = args.msgType;
    }else{
      commandType= 'command';
    }*/
    obj.sock.emit(commandType,{
      ptyPayload:args.cmnd
    });

  };
  obj.commandExecO=function(args){//cmnd,resultVariable,splice1,splice2){

    // $scope.result=cmnd;
    if(_.isFunction(args.callback)){
/*
        obj.callbackQueue.push({
          id:obj.callbackQueue.length+1,
          c:args.callback
        });
        */
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
      //id:obj.callbackQueue.length,
      ptyPayload:cmd
    });

  };

  obj.getDissasembly = function getDissasembly () {

    obj.callbackQueue.push(DisasData.dissasemblyCallback);
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
      return _.map(data.split('\n\nD').splice(1),function(item,index){
        var split = item.split('\n\n');
        //console.log("splited");
        //console.log(split);
        var re = /([\w\.\-]+)\:$/g;
        //var re = /(\.?\w+)\:$/g;
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
                opcode:instr[3],
                operands:instr[4],
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
      });
    }
    obj.commandExecO({
      callback: function(result){
        obj.sharedData.disasViewData.sectionD=processData(result);
        var texts = _.findWhere(obj.sharedData.disasViewData.sectionD,{sectionName:'.text'});
        obj.bbfd(_.flatten(_.pluck(texts.sectionContent,'symContent')));

        obj.getHeaders();
      },
      msgType: 'exec',
      ptyPayload:'arm-linux-gnueabi-objdump -D '+obj.sharedData.fileName

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
    obj.commandExecO({
      msgType:'exec',
      ptyPayload:'cd vdir; vagrant status; cd ../',
      callback:function(data){
        var status = (/.*default\s+(\w+\s*\w+).*/).exec(data)[1];
        if(status==='not created'){
          if(confirm('VM is not created if you click ok then background software will download 300+MB and do a bunch of CPU intensive config. Continue? ')){
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
  var socket = io.connect('http://localhost:807');
  obj.sock=socket;
  socket.on('execNews',function (data) {
    var cdata = data.data;
/*
 * if(data.id){
       var c = _.findWhere(obj.callbackQueue,{id:data.id});
       _.without(obj.callbackQueue,c);
       c.c();
      }
      */
    var callback = obj.callbackQueue.shift();

    //if(typeof callback === "function"){
    if(callback){
      callback(cdata);
    }else{

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
}]);


