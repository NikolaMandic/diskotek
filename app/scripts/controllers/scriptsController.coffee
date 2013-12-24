angular.module('ldApp').controller "scriptsController", (configState,command,$rootScope,$scope,$http,Data,store) ->
  $scope.bWindows=configState.bWindows
  $scope.scriptName=''
  $scope.scriptsList= [
       scriptName:'name', scriptDescription:'desc',scriptContent:'asdasd'

  ]
  
  
  $scope.windowBarShowFlag=true
  $scope.toggleWindowBar = ()->
    $scope.windowBarShowFlag=!$scope.windowBarShowFlag
  $scope.newScript = ()->
    name = "newScript"+(store.store.getAll().length ||'' )
    $scope.bWindows.push('this is a script placeholder')
  search = (termList, stringList)->
    _.filter stringList, (el)->
      result = true
      
      r =  _.each termList,(v)->
        result = result && el.scriptName.match(v)
      result



  $scope.$watch('scriptName',(n,o)->
    $scope.scriptsList= search(n.split(" "),_.values(store.store.getAll()))

  )

  $scope.scriptSearch = false
  
  $scope.toggleScriptSearch = ()->
    $scope.scriptSearch = !$scope.scriptSearch
  $scope.openScript = (script)->
    $scope.bWindows.push script.scriptContent
