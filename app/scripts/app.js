'use strict';

angular.module('ldApp', ['ngRoute'])
  .config(['$routeProvider',function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl2'
      }).when('/ch',{
        templateUrl: 'views/ch.html',
        controller: 'Ch'
      })
      .otherwise({
        redirectTo: '/'
      });
  }]);
