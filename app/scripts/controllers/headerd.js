if(!window.callbackset){
 socket.on('execNews',function(data){window.callback(data);});
}
window.callbackset=1;
socket.emit('exec',{ptyPayload:'readelf -h -l proba'});
window.callback=function (data){
console.log(data);
var elfH = data.data.split("\n");
var el = elfH.slice(1,21);


var s=
[
{   type:'unsigned char[16]', fName:'e_ident',              comment:'/* Magic number and other info */'      ,content:''},
{   type:'Elf32_Half',    fName:'e_type',               comment:'/* Object file type */'                 },
{   type:'Elf32_Half',    fName:'e_machine',            comment:'/* Architecture */'                     },
{   type:'Elf32_Word',    fName:'e_version',            comment:'/* Object file version */'              },
{   type:'Elf32_Addr',    fName:'e_entry',              comment:'/* Entry point virtual address */'      },
{   type:'Elf32_Off' ,    fName:'e_phoff',              comment:'/* Program header table file offset */' },
{   type:'Elf32_Off' ,    fName:'e_shoff',              comment:'/* Section header table file offset */' },
{   type:'Elf32_Word',    fName:'e_flags',              comment:'/* Processor-specific flags */'         },
{   type:'Elf32_Half',    fName:'e_ehsize',             comment:'/* ELF header size in bytes */'         },
{   type:'Elf32_Half',    fName:'e_phentsize',          comment:'/* Program header table entry size */'  },
{   type:'Elf32_Half',    fName:'e_phnum',              comment:'/* Program header table entry count */' },
{   type:'Elf32_Half',    fName:'e_shentsize',          comment:'/* Section header table entry size */'  },
{   type:'Elf32_Half',    fName:'e_shnum',              comment:'/* Section header table entry count */' },
{   type:'Elf32_Half',    fName:'e_shstrndx',           comment:'/* Section header string table index */'}
 ];
var phdr =  [
{ type:'Elf32_Word',    fName:'p_type'  ,    comment:'/* Segment type */'},
{ type:'Elf32_Off',     fName:'p_offset',    comment:'/* Segment file offset */'},
{ type:'Elf32_Addr',    fName:'p_vaddr' ,    comment:'/* Segment virtual address */'},
{ type:'Elf32_Addr',    fName:'p_paddr' ,    comment:'/* Segment physical address */'},
{ type:'Elf32_Word',    fName:'p_filesz',    comment:'/* Segment size in file */'},
{ type:'Elf32_Word',    fName:'p_memsz' ,    comment:'/* Segment size in memory */'},
{ type:'Elf32_Word',    fName:'p_flags' ,    comment:'/* Segment flags */'},
{ type:'Elf32_Word',    fName:'p_align' ,    comment:'/* Segment alignment */'}
] ;
var sl= el.slice(6);
sl.unshift(el.slice(0,5).join(' '));
sl.pop();
_.each(sl,function(v,i,l){
//console.log(v);
//console.log(s[i]);
//console.log((/\s+([^\:]+):\s+(.*?)\s*$/).exec(v));
  s[i].content=(/\s+([^\:]+):\s+(.*?)\s*$/).exec(v)[2];

});



function tSize(t){
  switch(t){
   case 'unsigned char[16]':
     return 16;
   case 'Elf32_Half':
     return 2;
   case 'Elf32_Word':
     return 4;
   case 'Elf32_Off':
     return 4;
   case 'Elf32_Addr':
     return 4;
   default:
     return 0;
  }
}
$("#holder").html('');
var r = Raphael('holder',1500,2000);
var rx=10;
var uW=70;
var spaceB=1;
var height=40;
var ry=50;
var fH=10;
_.each(s,function(el,index){
  var t = tSize(el.type);
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
   rx=10;
   ry+=51;
  }
  r.setFinish();
  //console.log(tSize(el.type));
});

console.log(parseInt(s[10].content,10));
var progH = elfH.slice(23,23+parseInt(s[10].content,10));

rx=10;
ry+=50;
_.each(progH,function(v,i,l){
 console.log(progH);
var parsed=(/\s+(\w+)\s+(\w+)\s+(\w+)\s+(\w+)\s+(\w+)\s+(\w+)\s+(.{3})\s+(\w+)/).exec(v);
if(parsed){
        _.each(phdr,function(el,ii){


  var t = tSize(el.type);
  r.setStart();
  rect = r.rect(rx,ry,uW*t,height).attr({
fill:Raphael.getColor(),
stroke:Raphael.getColor(),
'fill-opacity':0,
'stroke-width':2
});
rect.attr({title:el.comment});
  var tel=r.text(rx+1+uW*t/2,ry+1+fH/2,el.fName);
  var c = r.text(rx+1+uW*t/2,ry+height-3-fH/2arsed[ii+1]);
  c.attr({editable:"simple"});
    //$(tel).attr({'text-anchor':'baseline'})
      //$(tel).css({'text-anchor':''});
        rx+=uW*t+spaceB;
          if(rx>=16*uW){
             rx=10;
                ry+=51;
                  }
                    r.setFinish();
    
   
                           });
                           ///////////////////////
                           }
                           else{
                             var t = 16;
                               rect = r.rect(rx,ry,uW*t,height).attr({
                               fill:Raphael.getColor(),
                               stroke:Raphael.getColor(),
                               'fill-opacity':0,
                               'stroke-width':2
                               });
                             //  var tel=r.text(rx+1+uW*t/2,ry+1+fH/2,el.type);
                               var c = r.text(rx+1+uW*t/2,ry+height-3-fH/2,v);
                                 //$(tel).attr({'text-anchor':'baseline'})
                                   //$(tel).css({'text-anchor':''});
                                     rx+=uW*t+spaceB;
                                       if(rx>=16*uW){
                                          rx=10;
                                             ry+=51;
                                               }
  
                                               }
                                               });
  
                                               }
  
  
  
  
  
  
  
