angular.module('ldApp').controller "scriptsController", (configState,command,$rootScope,$scope,$http,Data) ->
  $scope.bWindows=configState.bWindows
  $scope.newScript = ()->
    $scope.bWindows.push('this is a script placeholder')
