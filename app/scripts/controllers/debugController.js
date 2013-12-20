angular.module('ldApp')
  .controller('debugController', function ($rootScope,$scope,$http,Data) {
    $(document).trigger("routeChanged");
    $scope.data=Data;
    $scope.toggleBreakpoint = function(address,thing) {
      thing.hasBreakpoint = thing.hasBreakpoint?false:true;
      if(thing.hasBreakpoint){
        Data.debugData.setBreakpoint(address);
      }else{
        Date.debugData.removeBreakpoint(address);
      }
      
    };

    $rootScope.$on("debugDataLoaded",function(){
      $scope.$apply();
      $("#disassembly span").on("mousemove",function(e){
        e.stopPropagation();
      });
      $("#disassembly span").on("click",function(e){
        e.stopPropagation();
      });
      $("#disassembly span").on("mousedown",function(e){
        e.stopPropagation();
      });
      $("#disassembly span").on("mouseup",function(e){
        e.stopPropagation();
      });
      $("#wrapermain").css({height:'500px'});
      $(".nano").nanoScroller();
    });
  });

