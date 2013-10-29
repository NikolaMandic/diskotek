angular.module('ldApp')
  .controller 'MainCtrl', (configState,command,$rootScope,$scope,$http,Data) ->

    $scope.data=Data


    ###
     * this is targets name as observable
     * following code should change

     old code
    ###
    $scope.file=Data.sharedData.fileName
    $scope.sharedData=Data.sharedData
    Data.scope=$scope
    


    $scope.file = configState.file
    $scope.architecture =configState.architecture
    ###
     * following scope functions just forward to functions on data module
    ###
    $scope.commandLoad = ()->
      Data.debugData.arch='x86'
      Data.status='running'
      Data.loadCommand($scope.file,$scope.architecture)
    
    $scope.commandStart=()->
      Data.debugData.arch='x86'
      Data.status='running'
      Data.startCommand($scope.file,$scope.architecture)
    
    $scope.commandStartVM=()->
      Data.startCommandVM($scope.file)
    $scope.registerInfo = ()->
      Data.getRegisterInfo()

    
    $scope.commandDissasemble = ()->
      Data.disassemblyData.disassemble($scope.file,$scope.architecture)
   
    $scope.stop = ()->
      Data.stop()
      Data.status='stopped'
   
    $scope.stepOver = ()->
      Data.debugData.stepOver()
  
    $scope.cont =()->
      command.commandExecO({ptyPayload:'c'})
      Data.debugData.getDissasembly()
      Data.debugData.getRegisterInfo()
      Data.debugData.infoBreakpoints()
    
    $scope.stepInto = ()->
      command.commandExecO({ptyPayload:'si'})
      Data.debugData.getDissasembly()
      Data.debugData.getRegisterInfo()
    

