'use strict';
var supports3DTransforms =  document.body.style['webkitPerspective'] !== undefined || 
                            document.body.style['MozPerspective'] !== undefined;
/*
function linkify( selector ) {
    if( supports3DTransforms ) {
       $(selector).each(function(value){
         if( !value.className || !value.className.match( /roll/g ) ) {
            value.className += ' roll';
            value.innerHTML = '<span data-title="'+ value.text +'">' + value.innerHTML + '</span>';
         }

       }); 
    }
}
*/
var socket;
angular.module('ldApp').factory('Data',function(){
  //gdb service
  var obj={
    //idata:[],
    sharedData:{
      result:[],
      result_raw:[],
      registers:''
    },
    sock:socket  
  };

  obj.callbackQueue=[];
  function dissasemblyCallback(){
    obj.sharedData.dissasembly= obj.sharedData.result.slice(0,-1);
//$scope.disasR(80,'dcd');
       var b = [];
       var c=0;
      b.push([]);
       var dissasmArr = [];
       var dissamObj = [];
       var r=obj.sharedData.dissasembly.map(function(value,index,array){
         //decode outpu
         var regexp1=/^\=\>\s*(.*):\s(\w+)([^;]*)(;(.*))?$/;

         //addr inst opcodes ; comment
         var regexp2=/^\s*(.*):\s(\w+)([^;]*)(;(.*))?$/;
         ////\s*(\w+)(.*?):\s+(\w+)\s(.+?)\s*;\s(.+)\s*/g; ///\s*(\w+)(.*?):\s(\w+)\s(.+?)(\s;\s(.+))?\s*/g;
         var regexp3=/\s*(\w+)(.*?):\s+(\w+)\s(.+)\s*/g;
         var s;
         var typeOfReg ;
         var inst_obj ;
         if(value.match(regexp1)){
           s =  value.split(regexp1);
           typeOfReg=1;
          inst_obj ={
              current:true,
              address: s[1],
              opcode:  s[2],
              operands:s[3],
              comment: s[4],
             };

         }else if(value.match(regexp2)){
           s =  value.split(regexp2);
           typeOfReg=2;
           inst_obj ={
              current:false,
              address: s[1],
              opcode:  s[2],
              operands:s[3],
              comment: s[4],
             };

         }

         
         if(s){
           if(s[3].match(/^b.*/)){
             b[c].push(s);
             c++;
             b.push([]);
           }else{
           
             b[c].push(s);
           }
           dissasmArr.push(s);
           dissamObj.push(inst_obj);

         }else{
           
         }
         
         return s;
   //"=> 0x40801e1c: bl 0x40805d44".split(/\=\>\s(\w+):\s(\w+)\s(.+)(\s;\s(.+))?/);
    // "0x40801e14: ldr r4, [pc, #148] ; 0x40801eb0 ".split(/(\w+):\s(\w+)\s(.+)(\s;\s(.+))?/);
       
       });
      // _.each(b,function(element,index,list){
      //   if(_.find( element[-1][0]) )
      // });
       obj.sharedData.dissArr=dissamObj;
       obj.data=b;

  };
  obj.getDissasembly = function getDissasembly () {
    
    obj.callbackQueue.push(dissasemblyCallback);
    socket.emit('command', { ptyPayload: "disas $pc-40,$pc+40" });
  }
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

    socket.emit('command', { ptyPayload: "info registers" });
   // $scope.commandExecL('info registers','registers',1,-2);
  }
  obj.start_command = function start_command (name) {

    
    obj.callbackQueue.push(function() {});
    obj.callbackQueue.push(function() {});
    obj.callbackQueue.push(function() {});
    socket.emit('start', { name: name });
    var f=function(){socket.emit('command', { ptyPayload: "set arch arm" });
    };
    setTimeout(f,2000);
    var f2=function(){
      socket.emit('command', { ptyPayload: "target remote :12345" });
    };
    setTimeout(f2,2100);
    setTimeout(obj.getDissasembly,2300);

    setTimeout(obj.getRegisterInfo,2350);
    
    setTimeout(function(){ obj.scope.$apply(); },2400);
  }
   var decod=function decode(result){
       };


  obj.sock=socket = io.connect('http://localhost:807');

  socket.on('news', function (data) {
    console.log(data);
    //obj.sc(data.data);
    var dataSplited = data.data.split("\n") ;
    obj.sharedData.result_raw = obj.sharedData.result_raw.concat(dataSplited);
    obj.sharedData.result=obj.sharedData.result_raw;
    var last = obj.sharedData.result_raw[obj.sharedData.result_raw.length-1];
    if(last ==="(gdb) " /*|| last ===""*/ ){
      var callback = obj.callbackQueue.shift();
      if(callback)callback();
      obj.sharedData.result_raw=[];

    }    
   /* 
    if(obj.sharedData.result.length>0){
      if('match' in obj.sharedData.result[obj.sharedData.result.length-1]){
        if(obj.sharedData.result[obj.sharedData.result.length-1].match("/^(gdb).+/")){
              }
      }else{
        console.log("match not found");
        console.log(obj.sharedData );
      }
    }
    */
    if('scope' in obj)obj.scope.$apply();
  });

  return obj;
});

angular.module('ldApp')
  .controller('MainCtrl2', function ($scope,$http,Data) {
      $scope.sharedData=Data.sharedData;
  });
angular.module('ldApp')
  .controller('MainCtrl', function ($scope,$http,Data) {
   // stroll.bind( '.hero-unit ul',{ live: true } ); 
  
//linkify( '#debugMenu a' );
// "0x40801e14: ldr r4, [pc, #148] ; 0x40801eb0 ".split(/(\w+):\s(\w+)\s(.+)\s;\s(.+)/);
//"=> 0x40801e1c: bl 0x40805d44".split(/\=\>\s(\w+):\s(\w+)\s(.+)(\s;\s(.+))?/);
  // "0x40801e14: ldr r4, [pc, #148] ; 0x40801eb0 ".split(/(\w+):\s(\w+)\s(.+)(\s;\s(.+))?/);
  
    $scope.file='proba';
    $scope.sharedData=Data.sharedData;
  Data.scope=$scope;
 /*Data.sc=function(r){
  $scope.result=r?[r] :[] ;
 };
 */
    $scope.commandExec=function(cmnd){
      $scope.result=cmnd;
     
      $.ajax({
        method:'POST',
        url:'http://localhost:8080/o/a',
        data: {cmd:cmnd}}).always(function(data){
          $scope.result=data;
          $scope.resultSplit=data.split("\n")
          $scope.resultSplit=$scope.resultSplit.splice(2,$scope.resultSplit.length)
          $scope.$apply();
      });
    };
    $scope.commandExecL=function(cmnd,resultVariable,splice1,splice2){
     // $scope.result=cmnd;
      if(resultVariable){ 
        Data.callbackQueue.push(function() {
          Data.sharedData[resultVariable]=Data.sharedData.result;
        });
      }else{
        Data.callbackQueue.push(function() {});
      }
      Data.sock.emit('command',{
                         ptyPayload:cmnd
      });
     /*
      return $.ajax({
        method:'POST',
        url:'http://localhost:8080/o/a',
        data: {cmd:cmnd}}).always(function(data){
          if(resultVariable){
            $scope[resultVariable+"_raw"]=data;
            $scope[resultVariable]=data.split("\n");
            if($scope[resultVariable] instanceof Array){
              if(splice1 & splice2){
               $scope[resultVariable]=$scope[resultVariable].slice(splice1,splice2);
              }
            }else{
             $scope[resultVariable]=[];
            }
            Data.ds[resultVariable]=$scope[resultVariable];

              $scope.$apply();
          }
      });
      */
    };
    $scope.commandStart=function(cmnd){
      Data.start_command($scope.file);
      //Data.getDissasembly();
      /*
      $.ajax({
        method:'POST',
        url:'http://localhost:8080/start/'+$scope.file,
        data: {cmd:cmnd}}).always(function(data){
              
          $scope.result=data;
      }).success(function(){
        $scope.commandExecL('disas $pc-40,$pc+40','result',2,-1).always(function(){
        $scope.dcd();
        });
        $scope.registerInfo();
      });
      */
    };
   $scope.registerInfo = function() {
    Data.getRegisterInfo();
     
   };  
   $scope.dcd = function() {
     //$scope.disasR(80,'dcd');
     var b = [];
     var c=0;
    b.push([]);
     var dissasmArr = [];
     var dissamObj = [];
     $scope.dcd_=$scope.result.map(function(value,index,array){
       //decode outpu
       var regexp1=/\s*\=\>\s(\w+)(.*?):\s(\w+)\s(.+)(\s;\s(.+))?\s*/g;

       //addr inst opcodes ; comment
       var regexp2=/\s*(\w+)(.*?):\s(\w+)\s(.+)(\s;\s(.+))?\s*/g;
       var s;
       var typeOfReg ;
       if(value.match(regexp1)){
         s =  value.split(regexp1);
         typeOfReg=1;
       }else if(value.match(regexp2)){
         s =  value.split(regexp2);
         typeOfReg=2;
       }
       
       if(s){
         if(s[3].match(/^b.*/)){
           b[c].push(s);
           c++;
           b.push([]);
         }else{
         
           b[c].push(s);
         }
         dissasmArr.push(s);
         if(typeOfReg==1){
           dissamObj.push({
            address: s[0],
            opcode:  s[1],
            operands:s[3],
            comment: s[4],
           });
         }else{
           
         }
       }
       return s;
 //"=> 0x40801e1c: bl 0x40805d44".split(/\=\>\s(\w+):\s(\w+)\s(.+)(\s;\s(.+))?/);
  // "0x40801e14: ldr r4, [pc, #148] ; 0x40801eb0 ".split(/(\w+):\s(\w+)\s(.+)(\s;\s(.+))?/);
     
     });
    // _.each(b,function(element,index,list){
    //   if(_.find( element[-1][0]) )
    // });
     Data.sharedData.dissArr=dissamObj;
     Data.data=b;
   };
   $scope.disasR = function(span,variable) {
     span = span | 80; 
     variable = variable? variable : 'result';
     $scope.commandExecL('disas $pc-'+span+',$pc+'+span,variable,2,-2).always(function(){
        $scope.dcd();
        });


   };
   $scope.stepOver = function  () {
     $scope.commandExecL('ni');
     Data.getDissasembly();
     Data.getRegisterInfo();
     //$scope.disasR();
    // $scope.registerInfo();
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
   }

   $scope.command=''; 
   // $http({method: 'OPTIONS', url: 'http://localhost:5823/ls'}).success(function(data){
   //   $scope.a=data;
   //   alert(data);
   // });
   $scope.awesomeThings = [
        'HTML5 Boilerplate',
        'AngularJS',
        'Karma',
        


   ];
});
