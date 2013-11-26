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
        result = result && el.scriptName.match(v)
      result

  $scope.$watch('scriptName',(n,o)->
    $scope.scriptsList= search(n.split(" "),$scope.scriptsListO)

  )
  $scope.scriptSearch = false
  $scope.toggleScriptSearch = ()->
    $scope.scriptSearch = !$scope.scriptSearch
  $scope.scriptsListO= [
       scriptName:'name', scriptDescription:'desc a',
         scriptName:'name one', scriptDescription:'desc bb',
       scriptName:'name two', scriptDescription:'descer wer',
         scriptName:'tree two', scriptDescription:'desc qwe',
       scriptName:' one five ', scriptDescription:'desc 23',
        scriptName:'xis seven', scriptDescription:'desc lk'

  ]
