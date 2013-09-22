'use strict';

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
        controller: 'Disas'
      })
      .otherwise({
        redirectTo: '/'
      });
  }]);
