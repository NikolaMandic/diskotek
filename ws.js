/*
 *
 * this module is the backend code for the gui
 * it is a proxy that accepts commands from the frontend trough socket.io
 * invokes the utility
 * and sends output back to the ui
 *
 *
*/
// express is used to serve static content for app and also for togetherjs
var express = require('express');
var app = express();
var _=require('underscore');
app.use(express.static('./' + '/app'));
app.use(express.static('./' + '/app/static-myapp'));

app.listen(process.env.PORT || 3000);

var io = require('socket.io').listen(8070);
var cp = require('child_process');
io.set('log level',1);

// instance of emulator environment
var qemuStatic;
// instance of gdb that is used
var gdb;

var started=0;

var execCommandCount=0;
var execCommandStack=[];
// this instantates object responsible of multiplexing and runnig gdb commands
function gdbCommandRunnerC(){

  this.commandStack=[],
  this.commandCount=0;
  this.initialisationState=1;
  this.runningState=2;
  this.stopedState=3;
  this.status=0;
  var self=this;
  this.skipState=0;
  this.initialisationSteps=[
    'set arch arm'+'\n',
    'target remote :12345'+'\n'
  ];
  this.commandPush = function (data){
    console.log('\n ==========command push======');
    console.log('command arrived '+ data.ptyPayload);
    this.commandCount+=1;
    this.commandStack.push(function() {
      console.log('executing '+data.ptyPayload +'\n');
      gdb.stdin.write(data.ptyPayload+'\n');
      if(data.ptyPayload==='quit'){
        //socket.emit('news','quited\n(gdb)');
        self.status=0;
        self.commandCount=0;
        self.commandStack=[];
        // global state
        started=0;
        console.log('gdb stopped');
      }
    });

    console.log('status ' + this.status);

    console.log('command count '+ this.commandCount);

    if(this.status===2){
      if (this.commandCount===1  ){
        console.log('executing right away command');

        this.commandNext();
      }
    }else{
      console.log(' not executing');
    }

  };
  this.commandFinished = function(){
    console.log('status: '+this.status);
    if(this.status===0){
      console.log('switching to initialistation\n');

      this.status=1;
      console.log('status when in initialisation '+this.status);
    }
    if(this.status === 1){
      if(this.initialisationSteps.length>0){
        var nextStep = this.initialisationSteps.shift();
        gdb.stdin.write(nextStep);
        console.log('executing init command: ' + nextStep  + '\n');
      }else{

        this.switchToRunningState();
      }
    }else{

      this.commandCount--;
      this.commandNext();
    }
  };
  this.switchToRunningState = function(){
    console.log('switching to running\n');
    this.status=2;
    console.log('status when running '+this.status);
    this.commandNext();
  };
  this.commandNext = function(){
    if(this.commandCount>0){
      var c = this.commandStack.shift();
      if (c!==undefined){
        c();
      }
    }
  };
}
// not only a runner but a multiplexer also :-D
var gdbCommandRunner=new gdbCommandRunnerC();

var backendState={

};

function gdbstdErr(socket,chunk) {
  socket.emit('news',{
    type:'output',
    data:chunk
  });
}
var currentOutputBuffer='';
function gdbStdoutCallback(socket,chunk) {
  //console.log(chunk+'\n');
  // if gdb is initialized
  if(gdbCommandRunner.status===2){
    //console.log('this chunk is sent\n');
    currentOutputBuffer+=chunk;
  }

  if(chunk.match(/.*\(gdb\)\s.*/g)){
    console.log('found gdb string that is used as separator\n');
     socket.emit('news',{
      type:'output',
      data:currentOutputBuffer
    });
    currentOutputBuffer='';
    gdbCommandRunner.commandFinished();
  }
}
function attachGDBtoPeer(socket){
  console.log('attaching gdb to peer')
  gdb.stdout.setEncoding('utf-8');
  gdb.stdout.on('data',function(data){ gdbStdoutCallback(socket,data); });
  gdb.stderr.setEncoding('utf-8');
  gdb.stderr.on('data',function(data){ gdbstdErr(socket,data);         });
}
function startARMELF(socket,data){
  // start qemu that will wait for debugger
  qemuStatic = cp.fork('./sp.js');
  // spawn gdb and load target
  gdb = cp.spawn('gdb-multiarch', [ data.name] );

  // on gdb output
  attachGDBtoPeer(socket);
}
function startX86ELF(socket,data){
  console.log('starting x86 elf debugging')
  // spawn gdb and load target
  gdb = cp.spawn('gdb', [ data.name] );
  gdbCommandRunner.initialisationSteps=['set disassembly-flavor intel\n','break _start\n','run\n']
  // on gdb output
  attachGDBtoPeer(socket);
}
function startCommandHandler(socket,data) {
  var data=data.ptyPayload; 
  if (started===0) {
    console.log('starting debugger');
    console.log('architecture: ', data );
    started=1;
    architecture=data.architecture;
    try{
      gdbCommandRunner.arch=data.architecture;
      switch (data.architecture) {
      case 'arm elf':
        console.log('starting arm debugging');
        startARMELF(socket,data);
        break;
      case 'x86 elf':
        console.log('starting x86 debugging')
        startX86ELF(socket,data);
        break;
      case 'pe':
        //todo
        break;
      default:
        break;
      }
    }catch(err){
      console.log(err);
    }
  }else{
    //gdb.stdin.write('run\n');
  }
}
function assembleARM(instruction){
  return 'echo "' +
               instruction +
               '" > aa.txt; arm-linux-gnueabi-as aa.txt; arm-linux-gnueabi-objdump -d a.out |grep -o -E -e "0:(\\s*(\\w+)\\s*)" | cut -d ":" -f 2| grep -o -E -e "\\w+"'
}

function assemblex86(instruction){

  return 'echo "' + instruction + '" > /tmp/aa.txt ; as /tmp/aa.txt -o/tmp/a.o; objdump -d /tmp/a.o | sed -rn "s/.*[0-9]+:\\s+(([a-f0-9]+\\s+)+)\\s+.*/\\1/p" ';
}
function assemblerCommandHandler(socket,data){
  var exec = require('child_process').exec,
  child;
  var command;
  if(data.architecture==='x86'){
    command=assemblex86(data.command);
  }else{
    command=assembleARM(data.command);
  }
  console.log('command to be executed: ',command);
  child = exec(command,
  function (error, stdout, stderr) {
    socket.emit('assembleNews',{
      bin:stdout
    });
    console.log('stdout: ' + stdout);
    console.log('stderr: ' + stderr);
    if (error !== null) {
      console.log('exec error: ' + error);
    }
  });
}
function execCommandHandler(socket,data){
  execCommandCount+=1;
  if(execCommandCount>1){
    execCommandStack.push(function(){
      cp.exec(data.ptyPayload, function(error,stdout,stderr) {
        socket.emit('execNews',{
          data:stdout
        });

        if(execCommandStack.length){
          execCommandStack.shift()();
          execCommandCount--;
        }
      });
    });
  }else{
    cp.exec(data.ptyPayload, function(error,stdout,stderr) {
      socket.emit('execNews',{
        data:stdout
      });
      execCommandCount--;
      if(execCommandStack.length){
        execCommandStack.shift()();
        execCommandCount--;
      }
    });
  }
}
function debugInVMHandler(socket,data){
      var name = data.name;
      var sp = require('child_process');
      var vagrantp = sp.spawn('vagrant',['up'],{
        cwd:process.env.PWD+'/vdir',
        env:process.env
      });
      vagrantp.stdout.setEncoding('utf-8');
      vagrantp.stdout.on('data',function(data){
        socket.emit('debugInVMStatus',{data:data});
      });
      vagrantp.on('close',function(code){
        socket.emit('debugInVMNews',{});
        //if(code!==0)
      });
    }
function setupSocketIOChannels(socket){
  socket.on('debuggerStatus',function(){
    socket.emit('debuggerStatus',{started:started});
  });
  socket.on('start',function(data){
    console.log(data);
    startCommandHandler(socket,data);
  });
  socket.on('assemble',function(data){
    assemblerCommandHandler(socket,data.ptyPayload);
  });
  socket.on('exec',function(data){
    execCommandHandler(socket,data);
  });
  socket.on('command', function (data){
    gdbCommandRunner.commandPush(data);
  });
  socket.on('debugInVM',function(data){
    debugInVMHandler(socket,data);
  });
}

io.sockets.on('connection', function (socket) {

  // on connection make so that gdb output is sent to the new peer if gdb is started
  if(started===1){
    attachGDBtoPeer(socket);
  }
  // attach other services other than gdb
  setupSocketIOChannels(socket);

});


