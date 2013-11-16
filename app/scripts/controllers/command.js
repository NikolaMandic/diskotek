/*
 * command is a module that enables other components to comunicate to 
 * a server on top of socket.io
 *
 * main function used is commandExecO. 
 * It works by: 
 * 1. sending command 
 * 2. registering a callback that will be put in callback queue
 * and that callback will be called on latter when the result comes
 *
 * */
angular.module('ldApp').factory('command',[
                                function(){
  var obj={
    resultRaw:[],
    result:'',
  };
  /* 
   * this is array where callbacks will be pushed for each command a callback 
   * is expected so if callback is not specified anonimous callback will be 
   * pushed 
   * */
  obj.callbackQueue=[];



  /* old function variation of commandExecO
   * not to be used. 
   * */
  obj.commandExecL=function(cmnd,resultVariable){
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

  /* old function variation of commandExecO
   * not to be used. maybe commandExecO will evolve more so looks better
   * if this stays here 
   *
   * */
  obj.commandExecLO=function(args){

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
    if(args.ptyPayload){
      obj.sock.emit(commandType,{
        ptyPayload:args.cmnd
      });
    }else{
      obj.sock.emit(commandType,payload);
    }
  };

  /**
   * this function accepts object as argument that can have following fields:
   * [callback]: represents callback that is invoked on result 
   *    it is passed one parametar that is result splited by newline
   *    example:
   *    function (data){
   *        data is array of lines 
   *    }
   *    if omitted empty callback will be inserted in callback queue
   * [resultVariable]: this 
   *
   *    if omitted 'result' variable will be used
   *
   * [scope]:
   *    if present $apply will be called on that scope after callback
   *    if callback argument is not present then it will still be called
   *
   * [msgType]:
   *    this is string that what will go in socket.emit(msgType...)
   *    if omitted default is 'command'
   * [payload]:
   *    if present this is the object/data sent in socket.emit(msgType,cmd)
   *    if omited ptyPayload is used
   * [ptyPayload] alias [cmnd]
   *    if present data that is sent trough socket io 
   *    is socket.emit(msgType,{ptyPayload:ptyPayload})
   *
   * */
  obj.commandExecO=function(args){
    if (typeof args === 'string'){
      args = {ptyPayload:args}
    }
    var dfd = new jQuery.Deferred();
    console.log('send: ' ,args);
    var callback;

    if(_.isFunction(args.callback)){
      callback = args.callback;
    }else{
      if(args.resultVariable){
          callback=function putStuffinResultC(r) {
          obj.sharedData[args.resultVariable]=obj.sharedData.result;

          dfd.resolve(d);
        };
      }else{
        if(args.resultVariable!==null ){
            callback=function anonCallback(r) {
              dfd.resolve(r);
            };
        }
      }
    }
    if(args.scope){
      callback = function(d){
        callback(d);
        dfd.resolve(d);
        scope.$apply();
      }
    }
    if(args.callback!==null){
      obj.callbackQueue.push(callback);
    }
    

    var msgType = (args.msgType)?args.msgType : 'command';
    var cmd = (args.ptyPayload)?args.ptyPayload : args.payload;
    obj.sock.emit(msgType,{
      ptyPayload:cmd
    });
    return dfd.promise();
  };
  var socket = io.connect('http://localhost:8070');
  //socket.
  // for debugging and rad
  window.socket=socket;
  window.command = obj.commandExecO;
  obj.sock=socket;

  /*
   * this is a 'channel' that recives results of commands executed on shell
   * for example someone sends a command to be executed on shell
   * and registers a callback
   * and when the result returns this function triggers that callback
   * and passes the result to function
   *
   * */
  socket.on('execNews',function (data) {

    console.log('in: exec ',data);
    var cdata = data.data;
    var callback = obj.callbackQueue.shift();

    if(callback){
      callback(cdata);
    }else{

    }
  });
  /*
   * when vm is fully bootstraped and everything is up and runnig
   * server will push a message trough this 'debugInVMNews' channel
   * as a signal to switch to server running inside a VM that was just started
   * it runs on the same ports but vagrant is configured to forward them
   * to different ones so port 3000 in VM is 8080 on the host
   *
   * */
  socket.on('debugInVMNews',function (argument) {
    window.location('localhost:8080/index.html#/');
  });
  /*
   * this is channel to which result of 'command's are pushed
   * everything that is sent as 'command' command is what gets
   * executed in gdb and the result of that pops up here.
   * Also callback is called.
   * since data is pushed in chunks it is stored in resultRaw
   * until '(gdb) ' is found. Then everything that was recived so far
   * is transfered in result and resultRaw is reseted.
   *
   * */
  socket.on('news', function (data) {
    console.log('in: ',data);
    var dataSplited = data.data.split('\n') ;
    obj.resultRaw = obj.resultRaw.concat(dataSplited);
    obj.result=obj.resultRaw;
    var last = obj.resultRaw[obj.resultRaw.length-1];
    if(last ==='(gdb) '){
      var callback = obj.callbackQueue.shift();
      console.log('callbackQueue length: ',obj.callbackQueue.length);
      console.log(callback);
      if(callback){
        callback(obj.result);
      }
      obj.resultRaw=[];

    }
    if('scope' in obj){
      obj.scope.$apply();
    }
  });
//  var assembleNewsStream = socket.asEventStream('assembleNews');

 /*
  socket.on('assembleNews',function (argument) {
    window.location('localhost:8080/index.html#/');
  });
*/
  return obj;
}]);

