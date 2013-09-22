angular.module('ldApp')
  .controller('debugController', function ($rootScope,$scope,$http,Data) {
    $scope.data=Data;
    $scope.toggleBreakpoint = function(address,thing) {
      thing.hasBreakpoint = thing.hasBreakpoint?false:true;
      if(thing.hasBreakpoint){
        Data.setBreakpoint(address);
      }else{
        Date.removeBreakpoint(address);
      }
      
    };

    $rootScope.$on("debugDataLoaded",function(){
      $scope.$apply();
    });
  });

