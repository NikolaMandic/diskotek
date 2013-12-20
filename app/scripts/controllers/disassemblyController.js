

angular.module('ldApp')
  .controller('disassemblyController', function ($rootScope,$scope,$http,Data,bboxF) {

    $(document).trigger("routeChanged");

    $scope.sharedData=Data.sharedData;
    $scope.data=Data;
    
    $scope.miniViewShown=false;
    
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
function estimateTextSize(text){
  
  
}
function ToolTip(options){
  this.on = true;
  this.width = options.width || 0;
  this.height = options.height || 50;
  this.x = options.x || 0;
  this.y = options.y || 0;
  var s = this.s = options.s ;
  this.el = options.el;
  this.overEl=false;
  this.overTT=false;
  this.textWidth=10;
  this.textHeight=15;
  this.widthLimit=300;
  if ((typeof options.text) === "string"){
    options.text = options.text.replace(/[ ]+/g," ");
    if (options.text.length*this.textWidth>this.widthLimit){
      this.width = this.widthLimit;
      var num = (options.text.length*this.textWidth/this.widthLimit);
      this.height = this.textHeight * num+50;
      this.text = [];
      var x = 0;
      var numOfChars = this.width/this.textWidth;
      for (x = 0;x<num;x++){
        this.text.push(options.text.slice(x*numOfChars,(x+1)*numOfChars));
      }
      
    }else{
      this.width=options.text.length*this.textWidth;
      this.height = this.textHeight+20;
      this.text = [options.text];
    }
  }else{
    this.text = options.text;
    this.height = this.textHeight+20;
    for (line in options.text){
      if (options.text[line].length*this.textWidth>this.widthLimit){
        //TODO fix
        this.width = this.widthLimit;
        var num = (options.text[line].length*this.textWidth/this.widthLimit);
        this.height = this.textHeight * num+50;
        this.text = [];
        var x = 0;
        var numOfChars = this.width/this.textWidth;
        for (x = 0;x<num;x++){
          this.text.push(options.text[line].slice(x*numOfChars,(x+1)*numOfChars));
        }
        
      }else{
        this.width=(options.text[line].length*this.textWidth>this.width)?(options.text[line].length*this.textWidth):this.width;

      }
    }
  }
  var proto = Object.getPrototypeOf(this);
  proto.currentElement=0;
  this.render = function(){
    var bbox = this.el.getBBox();
    var ax,ay,bx,by,cx,cy;
    ax = bbox.cx;
    ay = bbox.cy-bbox.height/2;
    bx = ax-2;
    by = ay-3
    cx = ax+2;
    cy = ay+3;
    
    this.polygon = s.polygon([ax,ay,bx,by,cx,cy]);
    this.toolt = s.rect(ax-2-this.width/2,ay-this.height,this.width,this.height);
    //var ar=[];
    //_.each(this.text,function(v){ar.push(v);});
    var i = 0;
    var toolTipGroup=[];
    toolTipGroup.push(this.polygon);
    toolTipGroup.push(this.toolt);
    for (line in this.text){
      
      var textEl = s.text (ax-2-this.width/2+5,ay+this.textHeight-this.height + i*this.textHeight,this.text[i]).attr({
        fill:'#0f0'
      });
      toolTipGroup.push(textEl);
      i++;
    }

    var g = proto.g = s.g.apply(s,toolTipGroup);
    proto.g.hover(function(){
      proto.overTT=true;
      console.log("true");
      //this.render();
    },function(){
      proto.overTT=false;
      console.log("false");
      setTimeout((function(){
        if (!proto.overEl && !proto.overTT){
          this.close();
          proto.currentElement=0;
        }
      
      }).bind(this),500);
    },this,this);
  };
  this.close = function(){
    proto.g.remove();  
    
  };
  
  this.el.hover(function(){
    if(proto.currentElement!=this.el){
      if(proto.g){
        proto.g.remove();
      }
      proto.currentElement=this.el;
      //if (!this.overEl && !this.overTT){
      
        proto.overEl=true;
        this.render();
      //}
    }else{
      
      
    }

  },function(){
    proto.overEl=false;
    setTimeout((function(){
      if (!proto.overEl && !proto.overTT){
        this.close();
        proto.currentElement=0;
      }
      
    }).bind(this),500);
  },this,this);

  
}
function File(x,y,file){
  this.x=x=200;
  this.y=y=200;
  this.width=100;
  this.height=200;
  this.fileHeaderHeight = 50;
  this.currentY=0;
  var s=null;
  this.fileColor = '#00ff00'; 
  this.fileHeaderColor = '#ff0000';
  this.fileHeaderHeight = 20;
  this.sectionHeaderHeight = 20;
  this.sectionHeaderColor = '#0000ff';
  this.byteSizeInPixels = 5;
  this.rowHeight = 5;
  this.rFileRepresentation = function(){
  
    s.rect(this.x,this.y,this.width,this.height).attr({fill:this.fileColor});
    
  };

  this.rFileHeader = function(){
  
    s.rect(this.x,this.y,this.width,this.fileHeaderHeight).attr({fill:this.fileHeaderColor});
    var ehdr=file.fileHeaders.ehdr;
    var currentX=0;
    var fieldSizeInPixels;
    
    for (field in ehdr){
      fieldSizeInPixels=(ehdr[field].size>>>0)*this.byteSizeInPixels;
      if(currentX+fieldSizeInPixels>this.width){
        this.currentY+=this.rowHeight+2;
        currentX=0;
        
      }
      
      
      var el = s.rect(this.x+currentX,this.y+this.currentY,fieldSizeInPixels,this.rowHeight).attr({
          fill:'#FFFFFF'
        });
      var toolTipText;
      if(field === "0"){
        toolTipText=ehdr[field].content.slice(3,-3);
      }else{
        toolTipText = [ehdr[field].fName,ehdr[field].content];
      }
      new ToolTip({el:el,s:s,text:toolTipText});
      
      currentX += fieldSizeInPixels + 3;

    }
    this.currentY+=this.fileHeaderHeight;
  };

  this.rSectionHeaders = function(){
    _.each(file.fileHeaders.phdr,(function(ii,index,list){

      var phdr = s.rect(this.x,this.y+this.currentY,this.width,this.sectionHeaderHeight).attr({
        fill:this.sectionHeaderColor
      });
      var c=0;
      for (field in ii){
        s.rect(this.x+ii[field].size*c+1*c,this.y+this.currentY,ii[field].size*this.byteSizeInPixels,5).attr({
          fill:'#FFFFFF'
        });
        c++;
      }
      this.currentY+=this.sectionHeaderHeight;
    }).bind(this));
  };

  this.render = function(){
    // render file representation
    $('svg').remove();
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
