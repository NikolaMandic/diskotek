/**
 * @name headersModule
 * @fileOverview Various tool functions. 
 * @description 
 * this module contains functions for parsing headers
 *
 */
angular.module('ldApp').factory('DataHeaders',function(){
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
  return parsers;
});
