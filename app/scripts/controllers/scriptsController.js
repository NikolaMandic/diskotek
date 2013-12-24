(function() {
  angular.module('ldApp').controller("scriptsController", function(configState, command, $rootScope, $scope, $http, Data, store) {
    var search;
    $scope.bWindows = configState.bWindows;
    $scope.scriptName = '';
    $scope.scriptsList = [
      {
        scriptName: 'name',
        scriptDescription: 'desc',
        scriptContent: 'asdasd'
      }
    ];
    $scope.windowBarShowFlag = true;
    $scope.toggleWindowBar = function() {
      return $scope.windowBarShowFlag = !$scope.windowBarShowFlag;
    };
    $scope.newScript = function() {
      var name;
      name = "newScript" + (store.store.getAll().length || '');
      return $scope.bWindows.push('this is a script placeholder');
    };
    search = function(termList, stringList) {
      return _.filter(stringList, function(el) {
        var r, result;
        result = true;
        r = _.each(termList, function(v) {
          return result = result && el.scriptName.match(v);
        });
        return result;
      });
    };
    $scope.$watch('scriptName', function(n, o) {
      return $scope.scriptsList = search(n.split(" "), _.values(store.store.getAll()));
    });
    $scope.scriptSearch = false;
    $scope.toggleScriptSearch = function() {
      return $scope.scriptSearch = !$scope.scriptSearch;
    };
    return $scope.openScript = function(script) {
      return $scope.bWindows.push(script.scriptContent);
    };
  });

}).call(this);

/*
//@ sourceMappingURL=scriptsController.js.map
*/