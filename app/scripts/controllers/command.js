angular.module('ldApp').factory('command',[
                                function(){
  var obj={
    resultRaw:[],
    result:'',
  };
  obj.callbackQueue=[];
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
    if(args.ptyPayload){
      obj.sock.emit(commandType,{
        ptyPayload:args.cmnd
      });
    }else{
      obj.sock.emit(commandType,payload);
    }
  };
  obj.commandExecO=function(args){//cmnd,resultVariable,splice1,splice2){

    // $scope.result=cmnd;
    var callback;
    if(_.isFunction(args.callback)){
/*
        obj.callbackQueue.push({
          id:obj.callbackQueue.length+1,
          c:args.callback
        });
        */
      //obj.callbackQueue.push(args.callback);
      callback = args.callback;
    }else{
      if(args.resultVariable){
          // obj.callbackQueue.push(
          callback=function putStuffinResultC() {
          obj.sharedData[args.resultVariable]=obj.sharedData.result;
        };
        //);
      }else{
        if(args.resultVariable!==null ){
          //obj.callbackQueue.push(
            callback=function anonCallback() {};
          //);
        }
      }
    }
    if(args.scope){
      callback = _.wrap(callback,function(f){
        f();
        scope.$apply();
      });
    }
    obj.callbackQueue.push(callback);
    var msgType = (args.msgType)?args.msgType : 'command';
    var cmd = (args.ptyPayload)?args.ptyPayload : args.cmnd;
    obj.sock.emit(msgType,{
      //id:obj.callbackQueue.length,
      ptyPayload:cmd
    });

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
    obj.resultRaw = obj.resultRaw.concat(dataSplited);
    obj.result=obj.resultRaw;
    var last = obj.resultRaw[obj.resultRaw.length-1];
    if(last ==='(gdb) '){
      var callback = obj.callbackQueue.shift();
      if(callback){
        callback(obj.result);
      }
      obj.resultRaw=[];

    }
    if('scope' in obj){
      obj.scope.$apply();
    }
  });

  return obj;
}]);

