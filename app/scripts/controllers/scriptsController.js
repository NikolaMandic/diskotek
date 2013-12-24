(function() {
  angular.module('ldApp').controller("scriptsController", function(configState, command, $rootScope, $scope, $http, Data, store, jsX) {
    var search, windFact;
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
    windFact = null;
    $scope.newScript = function() {
      var name, windNew;
      name = "newScript" + (store.store.getAll().length || '');
      if (!windFact) {
        windFact = jsX.module();
      }
      windNew = windFact({
        title: name,
        contents: '//' + name + '\n'
      });
      return $scope.bWindows.push(windNew);
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