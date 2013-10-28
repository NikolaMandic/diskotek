angular.module('ldApp').controller "scriptsController", (command,$rootScope,$scope,$http,Data) ->
  $scope.bWindows=[]
  $scope.newScript = ()->
    $scope.bWindows.push({})
