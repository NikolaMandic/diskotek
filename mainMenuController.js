// Generated by CoffeeScript 1.6.3
(function() {
  angular.module('ldApp').controller('MainCtrl', function(configState, command, $rootScope, $scope, $http, Data) {
    $scope.data = Data;
    /*
     * this is targets name as observable
     * following code should change
    
     old code
    */

    $scope.file = Data.sharedData.fileName;
    $scope.sharedData = Data.sharedData;
    Data.scope = $scope;
    $scope.file = configState.file;
    $scope.architecture = configState.architecture;
    /*
     * following scope functions just forward to functions on data module
    */

    $scope.commandLoad = function() {
      Data.debugData.arch = 'x86';
      Data.status = 'running';
      return Data.loadCommand($scope.file, $scope.architecture);
    };
    $scope.commandStart = function() {
      Data.debugData.arch = 'x86';
      Data.status = 'running';
      return Data.startCommand($scope.file, $scope.architecture);
    };
    $scope.commandStartVM = function() {
      return Data.startCommandVM($scope.file);
    };
    $scope.registerInfo = function() {
      return Data.getRegisterInfo();
    };
    $scope.commandDissasemble = function() {
      return Data.disassemblyData.disassemble($scope.file, $scope.architecture);
    };
    $scope.stop = function() {
      Data.stop();
      return Data.status = 'stopped';
    };
    $scope.stepOver = function() {
      return Data.debugData.stepOver();
    };
    $scope.cont = function() {
      command.commandExecO({
        ptyPayload: 'c'
      });
      Data.debugData.getDissasembly();
      Data.debugData.getRegisterInfo();
      return Data.debugData.infoBreakpoints();
    };
    return $scope.stepInto = function() {
      command.commandExecO({
        ptyPayload: 'si'
      });
      Data.debugData.getDissasembly();
      return Data.debugData.getRegisterInfo();
    };
  });

}).call(this);
