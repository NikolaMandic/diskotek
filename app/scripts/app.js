'use strict';

require.config({
    packages:[{
      name:'ace',
      location:'../bower_components/ace/lib/ace',
      main:'ace'
    },{
      name:'bScript',
      location:'../bower_components/beeScript',
      main:'beeScriptRunner'
    }],
    paths:{
      //'es5-shim':'../bower_components/ace/lib/ace/lib'
      //
      'sprintf':'../bower_components/sprintf/src/sprintf'
    }
});

angular.module('ldApp', ['ngRoute'])
  .config(['$routeProvider',function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'debugController'
      }).when('/ch',{
        templateUrl: 'views/ch.html',
        controller: 'Ch'
      })
      .when('/disas',{
        templateUrl:'views/disas.html',
        controller: 'disassemblyController'
      })
      .otherwise({
        redirectTo: '/'
      });
  }]);


angular.module('ldApp').factory('store', function() {
  var store={
    store:null
  };

  require(['store'],function(store){
      store.store=store;
  });
  //factory function body that constructs shinyNewServiceInstance
  return store;
});
angular.module('ldApp').factory('beeScript', function() {
  var bScript={
    beeScript:null
  };

  require(['bScript','sprintf'],function(BScript){
      bScript.beeScript=BScript;
  });
  //factory function body that constructs shinyNewServiceInstance
  return bScript;
});
angular.module('ldApp').factory('ace', function() {
  var ace={
    ace:null
  };
  require(['ace'],function(_ace){
      ace.ace=_ace;
  });
  //factory function body that constructs shinyNewServiceInstance
  return ace;
});
