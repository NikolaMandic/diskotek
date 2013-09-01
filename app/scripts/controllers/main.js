'use strict';
var supports3DTransforms =  document.body.style['webkitPerspective'] !== undefined || 
                            document.body.style['MozPerspective'] !== undefined;

function linkify( selector ) {
    if( supports3DTransforms ) {
        
        var nodes = document.querySelectorAll( selector );

        for( var i = 0, len = nodes.length; i < len; i++ ) {
            var node = nodes[i];

            if( !node.className || !node.className.match( /roll/g ) ) {
                node.className += ' roll';
                node.innerHTML = '<span data-title="'+ node.text +'">' + node.innerHTML + '</span>';
            }
        };
    }
}
var socket;
function start_command (name) {
  socket.emit('start', { name: name });
  socket.emit('command', { ptyPayload: "set arch arm" });
  socket.emit('command', { ptyPayload: "target remote :12345" });
  setTimeout(getDissasembly,500);
 
}
function getDissasembly () {
    // body...
  socket.emit('command', { ptyPayload: "disas $pc,+40" });
}
angular.module('ldApp').factory('Data',function(){
  var obj={
    data:[],
    ds:{
      result:[],
      registers:''
    },
    sock:socket  
  };

   obj.sock=socket = io.connect('http://localhost:807');

    socket.on('news', function (data) {
    console.log(data);
    //obj.sc(data.data);
    obj.ds.result=data.data.split("\n");
    if('scope' in obj)obj.scope.$apply();
  });

  return obj;
});

angular.module('ldApp')
  .controller('MainCtrl2', function ($scope,$http,Data) {
      $scope.ds=Data.ds;
  });
angular.module('ldApp')
  .controller('MainCtrl', function ($scope,$http,Data) {
   // stroll.bind( '.hero-unit ul',{ live: true } ); 
linkify( 'a' );
  
// "0x40801e14: ldr r4, [pc, #148] ; 0x40801eb0 ".split(/(\w+):\s(\w+)\s(.+)\s;\s(.+)/);
//"=> 0x40801e1c: bl 0x40805d44".split(/\=\>\s(\w+):\s(\w+)\s(.+)(\s;\s(.+))?/);
  // "0x40801e14: ldr r4, [pc, #148] ; 0x40801eb0 ".split(/(\w+):\s(\w+)\s(.+)(\s;\s(.+))?/);
  $scope.file='proba';
    $scope.ds=Data.ds;
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
      start_command($scope.file);
      getDissasembly();
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
    $scope.commandExecL('info registers','registers',1,-2);
     
   };  
   $scope.dcd = function() {
     //$scope.disasR(80,'dcd');
     var b = [];
     var c=0;
    b.push([]);
     $scope.dcd_=$scope.result.map(function(value,index,array){
       var regexp1=/\s*\=\>\s(\w+)(.*?):\s(\w+)\s(.+)(\s;\s(.+))?\s*/g;
       var regexp2=/\s*(\w+)(.*?):\s(\w+)\s(.+)(\s;\s(.+))?\s*/g;
       var s;
       if(value.match(regexp1)){
         s =  value.split(regexp1);
       }else if(value.match(regexp2)){
         s =  value.split(regexp2);
       }
       if(s){
         if(s[3].match(/^b.*/)){

           b[c].push(s);
           c++;
           b.push([]);
         }else{
         
          b[c].push(s);
         }
       }
       return s;
 //"=> 0x40801e1c: bl 0x40805d44".split(/\=\>\s(\w+):\s(\w+)\s(.+)(\s;\s(.+))?/);
  // "0x40801e14: ldr r4, [pc, #148] ; 0x40801eb0 ".split(/(\w+):\s(\w+)\s(.+)(\s;\s(.+))?/);
     
     });
     
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
