
angular.module('ldApp').factory('bboxF',function(){
  var obj = {};

  var Data={};
  function r(o){
    var el;
    var dragger = function () {
      if(this.type!='rect') return;

      var item = this;var i=0;
      for (var i = 0; (i==0 || item.type!='rect');i++, item=item.next) {
        
        item.ox = item.type == "rect" ? item.attr("x") : item.attr("x");
        item.oy = item.type == "rect" ? item.attr("y") : item.attr("y");
        //  item.animate({"fill-opacity": .2}, 500);

      };
    },
    move = function (dx, dy) {
      if(this.type!='rect') return;
      var item = this;
      var i=0;
      for (var i = 0;( i==0 || (item && 'type' in item && item.type!='rect'));i++, item=item.next) {
        
        // var att = item.type == "rect" ? {x: item.ox + dx, y: item.oy + dy} : {x: item.ox + dx, y: item.oy + dy};
        
        item.transform('t'+dx+','+dy);
      };
      for (var i = connections.length; i--;) {
        r.connection(connections[i]);
      }
      r.safari();


    },
    up = function () {

      if(this.type!='rect') return;
      var item = this;var i=0;
      for (var i = 0; (i==0 || item.type!='rect');i++, item=item.next) {

        // item.animate({"fill-opacity": 0}, 500);
      };
    },
    r = Raphael(o.id, o.w, o.h),
    connections = [],
    shapes=[];
    function drawBB(bbox,x,y){
      r.setStart();
      
      r.rect(rx,ry,250,Data.data[i].length*15+20);
      for (var j = 0; j < Data.data[i].length; j++) {
          
        var a=  r.text(rx+25, ry+15*(j+1), Data.data[i][j].address+": "+ Data.data[i][j].opcode+" "+ Data.data[i][j].operands);
        $(a).attr({'text-anchor':'baseline'});
        $(a).css({'text-anchor':''});
      };
      var st = r.setFinish();
      return st;
     
    };
    var rx=o.w/2-250/2;
    var ry=20;
    Data.data = o.data;
    for (var i = 0; i < Data.data.length; i++) {
      var shape = drawBB(Data.data[i],rx,ry);
      shapes.push(shape[0]);
      ry+=20+(2+Data.data[i].length)*15;

    };
    for (var i = 0, ii = shapes.length; i < ii; i++) {
      var color = Raphael.getColor();
      $(shapes[i][0]).attr({fill: color, stroke: color, "fill-opacity": 0, "stroke-width": 2, cursor: "move"});
      shapes[i].drag(move/*, dragger, up*/);
    }

    for (var i = 0; i < shapes.length-1; i++) {

      connections.push(r.connection(shapes[i], shapes[i+1], "#070"));
    };

    $('#hld text').attr({'text-anchor':'baseline'});
    $('#hld text').css({'text-anchor':''});
  }
  obj.r=r;
  return obj;
});
