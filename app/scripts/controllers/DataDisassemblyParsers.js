/**
 * @name dataDisassemblyParsersModule
 * @fileOverview Various parsing functions. 
 * @description 
 * this module contains functions for parsing headers when disassembling file
 *
 */
angular.module('ldApp').factory('DataDisassemblyParsers',function(){
  var parsers = {};
  parsers.parseXD = function (data){
    return _.map(data,function(v){
      var s = (/\s+(\w+)\s*((\w+\s+){1,4})(.*)/).exec(v);
      return {
        address:s[1],
        hex:s[2],
        stringDump:s[4]
      }
    });
  };
  parsers.parseHeaders = function parseHeaders(data){
    var parsedHeaders={};
    var elfH = data.split("\n");
    var el = elfH.slice(1,20);


    var ehdr= [
      {   type:'unsigned char[16]', fName:'e_ident',          comment:'/* Magic number and other info */'      ,content:''},
      {   type:'Elf32_Half',    fName:'e_type',               comment:'/* Object file type */'                 },
      {   type:'Elf32_Half',    fName:'e_machine',            comment:'/* xArchitecture */'                     },
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
    var sl= el.slice(6);//magic number etc.
    sl.unshift(el.slice(0,5).join(' ')); // put info related to magic number as first element
    _.each(ehdr,function(v){
      v.size = tSize(v.type);
    });
    _.each(phdr,function(v){
      v.size=tSize(v.type);
    });

    _.each(sl,function(v,i,l){
      var splited = (/\s+([^\:]+):\s+(.*?)\s*$/).exec(v);
      ehdr[i].content=splited[2];
    });
    parsedHeaders.ehdr=ehdr;
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
    var progH = elfH.slice(23,23+parseInt(ehdr[10].content,10));

    parsedHeaders.phdr=[];
    _.each(progH,function(v,i,l){
      var parsed=(/\s+(\w+)\s+(\w+)\s+(\w+)\s+(\w+)\s+(\w+)\s+(\w+)\s+(.{3})\s+(\w+)/).exec(v);
      if(parsed){
       ///////////////////////
        //
        parsedHeaders.phdr.push(_.map(phdr,function(v,i,l){
          v.content=parsed[i+1];
          return v;
        }));
      }
      else{
        parsedHeaders.phdr.push([{
          type:'unsigned char[16]',
          content: v,
          size:16
        }]);
      }
    });
    return parsedHeaders;
  }
  parsers.parseSHeaders = function(data){
    var parsed;
    var elfH = data.split("\n");
    var el = elfH.slice(5);
    var j = el.join("\n");
    var jj= j.split(/\s{2}[0-9]{1,3}\s{1}/);
    jj = jj.slice(1);
    //console.log(jj);
    jj = jj.map(function(v,i,l){
      v=v.replace("\n",'');
      var vs = /([\w\.\-]+)\s+(\w+)\s+(\w+)\s+(\w+)\s+(\w+)\s+([\w*]+)\s+(.+)/.exec(v);
      //console.log(vs);
      return {
        name: vs[1],
        size: vs[2],
        VMA: vs[3],
        LMA: vs[4],
        fOff: vs[5],
        align: vs[6],
        flags: vs[7],       
      };
    });
    return jj;
  }
  parsers.processData = function processData(data){
    return _.map(data.split('\n\nD').splice(1),function(item,index){
      var split = item.split('\n\n');
      //console.log("splited");
      //console.log(split);
      var re = /([\w\.\-]+)\:$/g;
      //var re = /(\.?\w+)\:$/g;
      var sectionName = re.exec(split[0])[1];
      var sectionContentRaw=split[1];
      var cont=split.splice(1);

      var sectionContent = cont.map(function(sitem,sindex){
        var c = sitem.split('\n');
        //console.log(c);
        var symName = (/<(.+)>\:$/g).exec(c[0])[1];
        //console.log(symName);
        var cs=c.slice(1,-1);
        var symContent = cs.map(function(vitem,vindex){
          // console.log(vitem);
          //console.log('vindex'+vindex);
          var re = (/\s*(\w+):\s*([a-f0-9]+)\s*(\w+)\s+([^;]+)\s*(;.*)?/g);
          var instr = re.exec(vitem);
          if(vitem.match(re)){
            return {
              address:instr[1],
              memraw:instr[2],
              op: instr[3] +' '+ instr[4],
              opcode:instr[3],
              operands:instr[4],
              comments: instr[5]
            };
          }else{
            return{
              address:'',
              memraw:'',
              op:'',
              comments:''
            };
          }
        });
        //console.log('sindex'+sindex);
        return {
          symName:symName,
          symContent:symContent
        };
      });
      return {
        sectionName:sectionName,
        sectionContentRaw:sectionContentRaw,
        sectionContent:sectionContent
      };
    });
  };
  parsers.disassemblyParser=function dissasemblyCallback(){
    obj.sharedData.dissasembly= obj.sharedData.result.slice(0,-1);
    var b = [];
    b.push([]);
    var basicBlocks=[];
    basicBlocks.push([]);

    var disasArr = [];
    var disasObjArr = [];
    //bbBoundaryArr.push({from:0,to:0});
    var boundaries=[];
    var branchPreviousInst=false;

    var branchArray=[];
    _.each(obj.sharedData.dissasembly,function(value){
      //detects disassembly line with => in it
      var disasLineCurrent=/^\=\>\s*(.*):\s+(\w+)([^;]*)(;(.*))?$/;
      //detects line from gdb output
      var disasLine=/^\s*(.*):\s+(\w+)([^;]*)(;(.*))?$/;

      var splitedInstruction;
      var typeOfReg ;
      var instObj ;
      if(value.match(disasLineCurrent)){
        splitedInstruction =  value.split(disasLineCurrent);
        typeOfReg=1;
        instObj ={
          current:true,
          address: splitedInstruction[1],
          opcode:  splitedInstruction[2],
          operands:splitedInstruction[3],
          comment: splitedInstruction[4],
        };
      }else if(value.match(disasLine)){
        splitedInstruction =  value.split(disasLine);
        typeOfReg=2;
        instObj ={
          current:false,
          address: splitedInstruction[1],
          opcode:  splitedInstruction[2],
          operands:splitedInstruction[3],
          comment: splitedInstruction[4],
          uppperBoundary:false,//true if it is upper boundary of basic block
          downBoundary:false,//bottom boundary
        };
      }

      if(splitedInstruction){
        if (branchPreviousInst){
          instObj.uppperBoundary=true;
          boundaries.push(instObj);
          branchPreviousInst=false;
        }
        if(splitedInstruction[2].match(/^b.*/)){
          branchPreviousInst=true;
          instObj.bottomBoundary=true;
          boundaries.push(instObj);
          branchArray.push(instObj);
        }else{
          if(boundaries.length===0){
            instObj.uppperBoundary=true;
            boundaries.push(instObj);
          }
        }
        disasArr.push(splitedInstruction);
        disasObjArr.push(instObj);

      }else{

      }


    });


    obj.sharedData.disasArr=disasObjArr;

    //find instructions that are jumped on and put it in boundaries
    _.each(branchArray,function(value){
      var elem = _.findWhere(disasObjArr,{'address':value.operands.substring(1)});
      if(elem){
        var indexDest = _.indexOf(boundaries,elem);
        if(indexDest===-1){
          elem.up=true;
          boundaries.push(elem);
        }
      }

    });
    var boundariesSorted=_.sortBy(boundaries,'address');
    var boundaryArrC=0;
    _.each(disasObjArr,function(value){
      if(value===boundariesSorted[boundaryArrC]){
        if(value.uppperBoundary===true){
          basicBlocks.push([]);
          basicBlocks[basicBlocks.length-1].push(value);

        }
        if(value.bottomBoundary===true){
          basicBlocks[basicBlocks.length-1].push(value);
        }
        boundaryArrC+=1;

      }else{
        basicBlocks[basicBlocks.length-1].push(value);
      }
    });
    //legacy code :-D 
    obj.data=basicBlocks;

  };
  return parsers;
});
