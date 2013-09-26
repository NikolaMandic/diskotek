

angular.module('ldApp')
  .controller('Disas', function ($rootScope,$scope,$http,Data,bboxF) {

    //$(document).trigger("routeChanged");

    $scope.sharedData=Data.sharedData;
    $scope.data=Data;
    $scope.$watch('Data.sharedData.disasViewData.sectionD[0]',function(n,o){
      $scope.selectedSection=n;
      $scope.selected='section';
    });
    $scope.selectSection={};
    $scope.selected='none';
    $scope.scrollToSection = function(section) {
     // $scope.selectedSection=section;
     // $scope.selected='section';
     $('html, body').animate({
        scrollTop: section.position.y
      }, 2000);
    };
    $scope.scrollToHeader = function (header) {
        // body...
       $('html, body').animate({
        scrollTop: header.position.y
      }, 2000);
    }
    $scope.dViewSwitch = function(view,x,y){
      
      if (view===$scope.hldView){
        if($("#dwindow").css('visibility')==='visible'){
          $("#dwindow").css({
            visibility:'hidden'
          });
        }else{

          $("#dwindow").css({
            visibility:'visible'
          });
        }
      }else{
        $scope.hldView=view;

        $("#dwindow").css({
          visibility:'visible'
        });

      }
      $("#dwindow").css({
        width:'1000px',
        position:'absolute',
        top:y,//g.attrs.y,
        left:x,// srx+8*uW+'px',
        background:'rgba(0,110,0,0.9)'
      });
         
    };
    $scope.graphView=function(section,index){
       if(section.view==='G'){
        section.view='hidden';
       }else{   
          section.view='G';

          $scope.$apply();
          //$scope.dViewSwitch(section.view='G',srx+8*uW-500,g.attrs.y );

          //$scope.hldViewSection=section.name;
          //$scope.$apply();
          //$scope.headerC();,
          var disas=_.flatten(_.pluck(section.sectionContent,'symContent'));
          var bboxes=Data.disassemblyData.bbfd(disas);
          var height=disas.length*15+bboxes.length*50+200;
          $('#graphViewPlace'+index).html('');
          bboxF.r({
            id:'graphViewPlace'+index,
            w:$("#sectionContainer").width(),
            h:height,
            data:bboxes
          });
       }
        
    };
    $scope.disasView=function(section){
      if(section.view==='D'){
        section.view='hidden';

      }else{
        section.view="D";

        //$scope.$apply();
      }
      //$scope.dViewSwitch(v.view='D',srx+8*uW-500,g.attrs.y );
      //var sections= Data.sharedData.disasViewData.sectionD;
      //$scope.selectedSection=section;//_.findWhere(sections,{sectionName:v.name});
    };
    $scope.hexView=function(section){
      if(section.view==='H'){
        section.view='hidden';

       // $scope.$apply();
      }else{
        section.view="H";

       // $scope.$apply();
      }
   
      
    };
    $scope.renderDisasembly=function(disassembly){
     // Data.getHeaders();
      var disassemblyData=Data.disassemblyData;
      $scope.selected='header';
      $scope.$apply();
     // $scope.$watch('Data.sharedData.disasViewData.sheaders',function(n,o){
        var sheaders = disassemblyData.sectionHeaders;
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
        var ehdr = disassemblyData.fileHeaders.ehdr;
        var phdr = disassemblyData.fileHeaders.phdr;
        var r;

        r = Raphael('holder',1500,50*3+phdr.length*(50*2)+200);
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
    


        
         
// start of section header drawing
        rx=srx;
        ry+=51;
        offc++;
        r.text(srx/2,ry+1+fH/2,""+16*offc);
        _.each(phdr,function(ii,index,list){
          //for each section header in file
          _.each(ii,function(i){
            //draw that section header by drawing all fields
            var el = i;
            var t = el.size;
            //r.setStart();
            rect = r.rect(rx,ry,uW*t,height).attr({
              fill:'#ff00ff',//Raphael.getColor(),
              stroke:'#00ff00',//Raphael.getColor(),
              'fill-opacity':0,
              'stroke-width':2
            });
            rect.attr({title:el.comment});
            var tel=r.text(rx+1+uW*t/2,ry+1+fH/2,el.fName);

            sheaders[index].position={y:tel.attrs.y};
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
            //r.setFinish();

          });
      });

// end of section header drawing


      var sectionHeaders = disassemblyData.sectionHeaders;
      var ss = disassemblyData.sectionD;

      //sort sections by offset in file
      var sectionHeadersSorted=_.sortBy(sectionHeaders,'fOff');
      //set default view of sections
      _.each(sectionHeadersSorted,function(v){v.view='D'});

      // draw each section in file
      /*
      _.each(sectionHeadersSorted,function(v,i,l){

        //if(i==0){
        rx=srx;
        ry+=51;
        var sectionNameDrawed=r.text(srx/2,ry+1-fH/2+height,v.name);
        

        var sections = Data.sharedData.disasViewData.sectionD;
        _.findWhere(sections,{sectionName:v.name}).position={
          //x:,
          y:sectionNameDrawed.attrs.y
        };

        offc++;
        r.text(srx/2,ry+1+fH/2,""+16*offc);
        var d = r.text(srx/2+10,ry+height/2,"D");
        d.click(function(){

         // $scope.head,
          // erC();,

          $scope.dViewSwitch(v.view='D',srx+8*uW-500,g.attrs.y );
          var sections= Data.sharedData.disasViewData.sectionD;
          $scope.selectedSection=_.findWhere(sections,{sectionName:v.name});
          $scope.$apply();

         // $scope.headerC();
          //
          // $('#hld').html();
          //window handling 

        });
        var h = r.text(srx/2,ry+height/2,"H");
        h.click(function(){
          v.view='H';

          $scope.dViewSwitch(v.view='H');
          var sections= Data.sharedData.disasViewData.sectionD;
          $scope.selectedSection=_.findWhere(sections,{sectionName:v.name});
          $scope.$apply();

         // $scope.headerC();
          //
          // $('#hld').html();
          //window handling 
        });
        var g = r.text(srx/2-10,ry+height/2,"G");
        g.click(function(){
          v.view='G';

          $scope.dViewSwitch(v.view='G',srx+8*uW-500,g.attrs.y );

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


        });
        var s = _.findWhere(ss,{sectionName:v.name});
        var fa = _.flatten(_.pluck(s.sectionContent,'symContent'));

        _.each(fa,function(v){
          var t = 4;
          //r.setStart();
          rect = r.rect(rx,ry,uW*t,height).attr({
            fill:'#ff00ff',//Raphael.getColor(),
            stroke:'#00FF00',//Raphael.getColor(),
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
          //r.setFinish();
        });
        //}

              });

*/

     // });

      //$scope.$apply();

      $("#dwindow").draggable({handle:'.whandle'});
      $scope.$apply();
    };


    $scope.postRenderSetup=function(){
   // renderDisasembly
    };


    $rootScope.$on("disassemblyDataLoaded",$scope.renderDisasembly);

    $rootScope.$on("disassemblyDataLoaded",$scope.postRenderSetup);


});

