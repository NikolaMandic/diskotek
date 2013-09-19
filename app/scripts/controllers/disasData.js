
angular.module('ldApp').factory('DisasData',['DataHeaders',function(dataHeaders){
  var obj={};
  obj.parsers=dataHeaders;
  return obj;
}]);
