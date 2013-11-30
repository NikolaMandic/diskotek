

angular.module('ldApp')
  .controller('disassemblyController', function ($rootScope,$scope,$http,Data,bboxF) {

    $(document).trigger("routeChanged");

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
    /*
      fileHeaders: {
       ehdr:[
       {
        size:3
        fName:    
        content:
        comment:
       
       }]
       phdr:[
       {
        size:3
        fName:    
        content:
        comment:
       
       }]

       
       }



       */
     

    $scope.renderDisasembly=function(disassembly){
     // Data.getHeaders();
      var disassemblyData=Data.disassemblyData;
      (new File(0,0,disassemblyData)).render();
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
    
return;

        
         
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
      $("#dwindow").draggable({handle:'.whandle'});
      $scope.$apply();
    };


    $scope.postRenderSetup=function(){
   // renderDisasembly
    };


    $rootScope.$on("disassemblyDataLoaded",$scope.renderDisasembly);

    $rootScope.$on("disassemblyDataLoaded",$scope.postRenderSetup);


});
function File(x,y,file){
  this.x=x;
  this.y=y;
  this.width=100;
  this.height=200;
  this.fileHeaderHeight = 50;
  this.currentY=0;
  var s=null;
  this.fileColor = '#00ff00'; 
  this.fileHeaderColor = '#ff0000';
  this.fileHeaderHeight = 0;
  this.sectionHeaderHeight = 0;
  this.sectionHeaderColor = '#0000ff';

  this.rFileRepresentation = function(){
  
    s.rect(this.x,this.y,this.width,this.height).attr({fill:this.fileColor});
    
  };

  this.rFileHeader = function(){
  
    s.rect(this.x,this.y,this.width,this.fileHeaderHeight).attr({fill:this.fileHeaderColor});
    this.currentY+=this.fileHeaderHeight;
  };

  this.rSectionHeaders = function(){
    _.each(file.fileHeaders.phdr,(function(ii,index,list){

      var phdr = s.rect(this.x,this.y+this.currentY,this.width,this.sectionHeaderHeight).attr({
        fill:this.sectionHeaderColor
      });
      this.currentY+=this.sectionHeaderHeight;
    }).bind(this));
  };

  this.render = function(){
    // render file representation
    s = Snap();
    // render file header
    this.fileHeaderHeight=10;
    this.sectionHeaderHeight =10;
  
    this.rFileRepresentation();
    this.rFileHeader();
    this.rSectionHeaders();
    // render file header
    // render section/program headers


  }

}
