angular.module('ldApp').controller "scriptsController", (configState,command,$rootScope,$scope,$http,Data) ->
  $scope.bWindows=configState.bWindows
  $scope.scriptName=''
  $scope.scriptsList= [
       scriptName:'name', scriptDescription:'desc'

  ]
  $scope.newScript = ()->
    $scope.bWindows.push('this is a script placeholder')
  search = (termList, stringList)->
    _.filter stringList, (el)->
      result = true
      
      r =  _.each termList,(v)->
        result = result && el.match(v)
      result

  $scope.$watch('scriptName',(n,o)->
    console.log search(n.split(" "),_.pluck($scope.scriptsList,'scriptName'))

  )
  $scope.scriptsList= [
       scriptName:'name', scriptDescription:'desc a',
         scriptName:'name one', scriptDescription:'desc bb',
       scriptName:'name two', scriptDescription:'descer wer',
         scriptName:'tree two', scriptDescription:'desc qwe',
       scriptName:' one five ', scriptDescription:'desc 23',
        scriptName:'xis seven', scriptDescription:'desc lk'

  ]
