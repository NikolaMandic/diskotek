angular.module('ldApp').directive('draggable', function() {
  var ddo = {
    link: function(scope,iElement,iAttrs) {
      $(iElement).draggable({
        snap:true,
        grid:[20,20]
      });

    }
  };
  return ddo;
});
angular.module('ldApp').directive('resizable', function() {
  var ddo = {
    link: function(scope,iElement,iAttrs) {
      $(iElement).resizable({
        
        grid:[20,20]
      });

    }
  }
  return ddo;
})
angular.module('ldApp').directive('editable',['command',function(command){
  var selected = [];
  var instInputBig=$('#instInputBig');
  var content;
  var rootScope;
  var editing;
  var data;
  function processBig(){
    var bytes;
    var rawStringCommand='';
    if (editing === 'raw') {
      var memlines = _.pluck(selected,'memraw');
      bytes=/\w.*\w/.exec(memlines.join('\n').replace(/\n/g,' '))[0].match(/\w{2}/g);

      bytesNew = /\w.*\w/.exec(instInputBig.val().replace(/\n/g,' '))[0].match(/\w{2}/g);
      if(bytes.length< bytesNew.length){
        alert('no space for extra bytes');
      }else{
        var reversed = _.map(/\w.*\w/.exec(instInputBig.val().replace(/\n/g,' '))[0].match(/\w{2}/g),function(v,i,l){
          return l[l.length-i-1];
        }).join("");
     

        rawStringCommand = 'set {char[' + 
                            bytesNew.length + 
                            ']}'+ 
                            selected[0].address  + 
                            '=0x' + reversed
                            ;
        command.commandExecO({
          ptyPayload:rawStringCommand
        });
        data.debugData.getDissasembly();
        data.debugData.infoBreakpoints();
      }
    }else{
    
    }
  };
  function process(){
  
  };
  $(window).keyup(function(e){
    if(e.which===13){
      if(selected.length>0){
        if(e.shiftKey){
          editing = 'raw';
          var memlines = _.pluck(selected,'memraw');
          content=memlines.join('\n');
          instInputBig.attr({
            rows:memlines.length
          }); 
          instInputBig.val(content);
          instInputBig.css({
            position:'absolute',
            left: selected[0].leftmr,
            top: selected[0].topmr,
          });
          instInputBig.show();

          instInputBig.focus();
        }else{
          editing = 'op';
          var opcodes = _.pluck(selected,'opcode');
          var operands = _.pluck(selected,'operands');
          var instructions = _.zip(opcodes,operands).map(function(v){
            return v.join(" ");
          });
          content=instructions.join('\n');
          instInputBig.attr({
            rows:instructions.length
          }); 
          instInputBig.val(content);
          instInputBig.css({

            position:'absolute',
            left: selected[0].leftop+'px',
            top: selected[0].topop+'px',
          });
          instInputBig.show();       
          instInputBig.focus();
        }
      }
    }
  });
  instInputBig.keyup(function(e) {
    e.stopPropagation();
    if(e.which == 13 && e.ctrlKey) {
      processBig(content);
      instInputBig.hide();
      _.each(selected,function(v){
        v.selected=false;
      });

      selected=[];
      rootScope.$apply();
    }
    if(e.which == 27) {
      //$scope.process($scope.content);
      instInputBig.hide();
      content='';
      _.each(selected,function(v){
        v.selected=false;
      });
      selected=[];
      rootScope.$apply();
    }

  }); 

  $('#instInput').keyup(function(e) {
    e.stopPropagation();
    if(e.which == 13) {
      process(content);
      $('#instInput').hide();
    }
    if(e.which == 27) {
      //$scope.process($scope.content);
      $('#instInput').hide();
    }

  });
  var ddo = {
    scope:true,
    // replace:true,
    //transclude:true,
    //template:$('#editTemplate').html(),
    controller: function dcOnt($scope, $element,$attrs, $transclude,$rootScope, $compile,Data,$controller) {
      //fix inject dependency on declaration level
      data=Data;
      rootScope=$rootScope;
      $scope.mode = "display";
      $scope.process = function(content){
        console.log($attrs); 
        Data.debugData.patch(scope.thing);
        console.log("console edited",content);
      };



    },
    link: function lf(scope,iElement,iAttrs) {
      var offset = $(iElement).offset();
        if(iAttrs.editable==="raw"){
          scope.thing.leftmr = offset.left;
          scope.thing.topmr = offset.top;
        }else{
          scope.thing.leftop = offset.left;
          scope.thing.topop = offset.top;
        }

      $(iElement).click(function(){
        selected.push(scope.thing);
        scope.thing.selected=!scope.thing.selected;
        if (!scope.thing.selected) {
         selected = _.without(selected,scope.thing);
        }
        selected = _.sortBy(selected,'topmr');
        scope.$apply();
      });
      $(iElement).dblclick(function(){
        scope.mode = "edit";
        scope.content=$(iElement).html();
        $('#instInput').val(scope.content);
        var offset = $(iElement).position();
        $('#instInput').offset({
          left: offset.left,
          top: offset.top,
        });
        $('#instInput').show();
       
      });
    }
  };
  return ddo;
}]);
angular.module('ldApp').directive('commandwind',function() {
  var ddo = {
    scope:{},
    template: '<div >'+
                '<div>commandPanel</div>'+
                '<div>'+
                  '<input type="text" size="10" ng-model="command">'+
                  '<a ng-click="sendCommand(command)">sendCommand</a>&nbsp<a ng-click="clone()">new</a>&nbsp<a ng-click="destroy()">X</a></div>'+
                  ' <div ng-repeat="thing in things">{{thing}}</div>'+
              '</div>',
    controller: function dcOnt($scope, $element,$attrs, $transclude,$rootScope, $compile,Data,$controller,command) {
      //var Data = $injector.get("Data");
     // dcOnt.$new=function(){};
      $scope.sendCommand=function(cmd){
        command.commandExecO({
          ptyPayload:cmd,
          callback:function(result){
            $scope.things=result;
            $scope.$apply();
          }
        });
      }
      $scope.clone = function() {
        var html = '<div commandWind draggable resizable > </div>';
        var template = angular.element(html);
        // var elt= $element.parent().append(template);
        var linkFn = $compile(template);
        //var nscope ={$n,$parent:$scope.$parent};
        //dcOnt(nscope,template,$compile,Data,$controller);
        var el = linkFn($rootScope.$new() ,function(clonedEl,scope){
          var e=$element.parent().append(clonedEl);
          $(clonedEl).css({
            width:'300px',
            height:'100px',
            color:'#ff0000',
            background:"rgba(00,00,24,0.2)",
            position:"absolute",
          });
        });
        //$scope.$apply();
      };
      $scope.destroy = function() {
        //$element.$destroy();
        $element.remove();
      };
    },
    link: function lf(scope,iElement,iAttrs) {
      $(iElement).css({
        width:'300px',
        height:'100px',
        color:'#ff0000',
        position:"absolute",
        background:"rgba(00,00,24,0.02)",
      });
    }
  };
  return ddo;
});

