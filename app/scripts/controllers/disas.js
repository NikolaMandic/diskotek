angular.module('ldApp')
  .controller('Disas', function ($rootScope,$scope,$http,Data,bboxF) {


    $scope.sharedData=Data.sharedData;

    $scope.$watch('Data.sharedData.disasViewData.sectionD[0]',function(n,o){
      $scope.selectedSection=n;
      $scope.selected='section';
    });
    $scope.selectSection={};
    $scope.selected='none';
    $scope.selectSection = function(section) {
      $scope.selectedSection=section;
      $scope.selected='section';

    };

    $scope.renderDisasembly=function(){
     // Data.getHeaders();
      $scope.selected='header';
      $scope.$apply();
     // $scope.$watch('Data.sharedData.disasViewData.sheaders',function(n,o){
        var sheaders = Data.sharedData.disasViewData.sheaders;
        var tsheaders = _.reject(_.sortBy(sheaders,'VMA'),function(v){
          return v.VMA==='00000000';
        });
        $("#holder").html(''); //teardown

        var srx=100;
        var rx=srx;
        var uW=70;
        var spaceB=1;
        var height=40;
        var ry=50;
        var fH=10;
        var offc =-1;
        var ehdr =Data.sharedData.disasViewData.headers.ehdr;
        var phdr = Data.sharedData.disasViewData.headers.phdr;
        var r;

        r = Raphael('holder',1500,9000);
        /** 
         * this part will render ehdr structure
         *
         * */
     
        d3.select("#holder").select(function(){
          return ;
        }).data(ehdr).enter().call(function(ii){
          offc+=1;
          r.text(srx/2,ry+1+fH/2,16*offc);

          _.each(ii[0],function(i){
            var elW = i.__data__.size;
            var el = i.__data__;
            r.setStart();
            rect = r.rect(rx,ry,uW*elW,height).attr({
              fill:Raphael.getColor(),
              stroke:Raphael.getColor(),
              'fill-opacity':0,
              'stroke-width':2
            });
            rect.attr({title:el.comment});
            var tel=r.text(rx+1+uW*elW/2,ry+1+fH/2,el.fName);
            var c = r.text(rx+1+uW*elW/2,ry+height-3-fH/2,el.content);
            c.attr({editable:"simple"});
            //$(tel).attr({'text-anchor':'baseline'})
            //$(tel).css({'text-anchor':''});
            rx+=uW*elW+spaceB;
            if(rx>=16*uW){
              rx=srx;
              ry+=51;
              offc+=1;
              r.text(srx/2,ry+1+fH/2,16*offc);


            }
            r.setFinish();

           // window.r.rect(10*i.__data__,10,50,50);
            console.log(i);
          });
        });
    


        /**
         * 
         */
        rx=srx;
        ry+=51;
        offc++;
        r.text(srx/2,ry+1+fH/2,""+16*offc);
        _.each(phdr,function(ii){
          //for each section header in file
          _.each(ii,function(i){
            //draw that section header by drawing all fields
            var el = i;
            var t = el.size;
            r.setStart();
            rect = r.rect(rx,ry,uW*t,height).attr({
              fill:Raphael.getColor(),
              stroke:Raphael.getColor(),
              'fill-opacity':0,
              'stroke-width':2
            });
            rect.attr({title:el.comment});
            var tel=r.text(rx+1+uW*t/2,ry+1+fH/2,el.fName);
            var c = r.text(rx+1+uW*t/2,ry+height-3-fH/2,el.content);
            c.attr({editable:"simple"});
            //$(tel).attr({'text-anchor':'baseline'})
            //$(tel).css({'text-anchor':''});
            rx+=uW*t+spaceB;
            if(rx>=16*uW){

             rx=srx;
             ry+=51;
              offc++;
              r.text(srx/2,ry+1+fH/2,""+16*offc);
            }
            r.setFinish();

          });
      });




      var sectionHeaders = Data.sharedData.disasViewData.sheaders;
      var ss = Data.sharedData.disasViewData.sectionD;

      //sort sections by offset in file
      var sectionHeadersSorted=_.sortBy(sectionHeaders,'fOff');
      //set default view of sections
      _.each(sectionHeadersSorted,function(v){v.view='D'});

      // draw each section in file
      _.each(sectionHeadersSorted,function(v,i,l){

        //if(i==0){
        rx=srx;
        ry+=51;
        r.text(srx/2,ry+1-fH/2+height,v.name);
        offc++;
        r.text(srx/2,ry+1+fH/2,""+16*offc);
        var d = r.text(srx/2+10,ry+height/2,"D");
        d.click(function(){
          v.view='D';
         // $scope.headerC();
        });
        var h = r.text(srx/2,ry+height/2,"H");
        h.click(function(){
          v.view='H';

          $scope.hldView='H';
          var sections= Data.sharedData.disasViewData.sectionD;
          $scope.selectedSection=_.findWhere(sections,{sectionName:v.name});
          $scope.$apply();

         // $scope.headerC();
          //
          // $('#hld').html();
          //window handling 
          $("#dwindow").css({
            position:'absolute',
            top:g.attrs.y,
            left: srx+8*uW+'px',
            background:'rgba(220,220,220,0.9)'
          });
          if($("#dwindow").css('visibility')==='visible'){
            $("#dwindow").css({
              visibility:'hidden'
            });
          }else{

            $("#dwindow").css({
              visibility:'visible'
            });
          }
        });
        var g = r.text(srx/2-10,ry+height/2,"G");
        g.click(function(){
          v.view='G';
          $scope.hldView='G';
          $scope.hldViewSection=v.name;
          $scope.$apply();
          //$scope.headerC();,
          var disas=_.flatten(_.pluck(s.sectionContent,'symContent'));
          var bboxes=Data.bbfd(disas);
          var height=disas.length*15+bboxes.length*20+200;
          $('#hldd').html('');
          bboxF.r({
            id:'hldd',
            w:500,
            h:height,
            data:bboxes
          });


          //window handling 
          $("#dwindow").css({
            position:'absolute',
            top:g.attrs.y,
            left: srx+8*uW+'px',
            background:'rgba(220,220,220,0.9)'
          });
          if($("#dwindow").css('visibility')==='visible'){
            $("#dwindow").css({
              visibility:'hidden'
            });
          }else{

            $("#dwindow").css({
              visibility:'visible'
            });
          }
        });
        var s = _.findWhere(ss,{sectionName:v.name});
        var fa = _.flatten(_.pluck(s.sectionContent,'symContent'));

        _.each(fa,function(v){
          var t = 4;
          r.setStart();
          rect = r.rect(rx,ry,uW*t,height).attr({
            fill:Raphael.getColor(),
            stroke:Raphael.getColor(),
            'fill-opacity':0,
            'stroke-width':2
          });
          // rect.attr({title:el.comment});
          var tel=r.text(rx+1+uW*t/2,ry+1+fH/2,v.memraw);
          tel=r.text(rx+1+uW*t/2,ry-1-fH/2+height,v.op);

          //$(tel).attr({'text-anchor':'baseline'})
          //$(tel).css({'text-anchor':''});
          rx+=uW*t+spaceB;
          if(rx>=16*uW){

            rx=srx;
            ry+=51;
            offc++;
            r.text(srx/2,ry+1+fH/2,""+16*offc);
          }
          r.setFinish();
        });
        //}

        /* $("#holder").append("div").attr({"id":"hld"}).css({
              position:'absolute',
              left:'0px',
              right:'0px',
            });
            */
       });



     // });

      //$scope.$apply();

      $("#dwindow").draggable({handle:'.whandle'});
    };





    $rootScope.$on("disassemblyDataLoaded",$scope.renderDisasembly);



});

