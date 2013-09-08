angular.module('ldApp')
  .controller('MainCtrl2', function ($scope,$http,Data) {
    $scope.sharedData=Data.sharedData;
    $scope.toggleBreakpoint = function(address,thing) {
      thing.hasBreakpoint = thing.hasBreakpoint?false:true;
      if(thing.hasBreakpoint){
        Data.setBreakpoint(address);
      }else{
        Date.removeBreakpoint(address);
      }
      
    };

    });

