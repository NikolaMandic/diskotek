'use strict';
angular.module('ldApp')
  .controller('Ch',['$scope','$http','Data',"bboxF", function ($scope,$http,Data,bboxF) {
    $('#holder').html(''); 
    bboxF.r({
      id:'holder',
      w:1200,
      h:900,
      data:Data.data
    });
  }]);
