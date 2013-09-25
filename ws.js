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
var qemu_static; 
// instance of gdb that is used
var gdb;

var started=0;

var execCommandCount=0;
var execCommandStack=[];

// not only a runner but a multiplexer also :-D
var gdbCommandRunner=new gdbCommandRunnerC();

var backendState={

};
 function startCommandHandler(socket,data) {
    if(started==0){
      started=1;
      try{
        // start qemu that will wait for debugger
        qemu_static = cp.fork('./sp.js');
        // spawn gdb and load target
        gdb = cp.spawn('gdb-multiarch', [ data.name] );

        // on gdb output
        attachGDBtoPeer(socket);
        /*
        gdb.stdout.setEncoding('utf-8');
        gdb.stdout.on('data',function(data){ gdbStdoutCallback(socket,data)});
        gdb.stderr.setEncoding('utf-8');
        gdb.stderr.on('data',gdbstdErr);
        */
      }catch(err){
        console.log(err);
      }
    }
  }

function assemblerCommandHandler(socket,data){
  var exec = require('child_process').exec,
  child;
  child = exec('echo "' +
               data.command + 
               '" > aa.txt; arm-linux-gnueabi-as aa.txt; arm-linux-gnueabi-objdump -d a.out |grep -o -E -e "0:(\\s*(\\w+)\\s*)" | cut -d ":" -f 2| grep -o -E -e "\\w+"',
  function (error, stdout, stderr) {
    socket.emit('assembleNews',{
      bin:stdout
    })
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
  socket.on('start',function(data){startCommandHandler(socket,data)});
  socket.on('assemble',function(data){assemblerCommandHandler(socket,data)});
  socket.on('exec',function(data){execCommandHandler(socket,data)});
  socket.on('command', function (data){gdbCommandRunner.commandPush(data)});
  socket.on('debugInVM',function(data){debugInVMHandler(socket,data)});
}
function attachGDBtoPeer(socket){
  gdb.stdout.setEncoding('utf-8');
  gdb.stdout.on('data',function(data){ gdbStdoutCallback(socket,data) });
  gdb.stderr.setEncoding('utf-8');
  gdb.stderr.on('data',function(data){ gdbstdErr(socket,data)         });
}
io.sockets.on('connection', function (socket) {

  // on connection make so that gdb output is sent to the new peer if gdb is started
  if(started===1){
    attachGDBtoPeer(socket);
  }
  // attach other services other than gdb
  setupSocketIOChannels(socket);

});
function gdbstdErr(socket,chunk) {
  socket.emit('news',{
    type:'output',
    data:chunk
  });
}
// this instantates object responsible of multiplexing and runnig gdb commands
function gdbCommandRunnerC(){

  this.commandStack=[],
  this.commandCount=0;
  this.initialisationState=1;
  this.runningState=2;
  this.stopedState=3;
  this.status=0;
  this.skipState=0;
  this.initialisationSteps=[
    'set arch arm'+"\n",
    'target remote :12345'+"\n"
  ];
  this.commandPush = function (data){
    console.log('command arrived '+ data.ptyPayload+'\n');
    this.commandCount+=1;
    this.commandStack.push(function() {
        console.log('executing '+data.ptyPayload +'\n');
        gdb.stdin.write(data.ptyPayload+"\n");
        if(data.ptyPayload==='quit'){
          this.status=this.stopedState;
          // global state
          started=0;
        }
    });
    
    console.log('status ' + this.status);

    console.log('command count '+ this.commandCount);
    
    if(this.status==this.runningState){
      if (this.commandCount==1){
        console.log('executing right away command');

        this.commandNext();
      }
    }else{
      console.log(' not executing');
    }

  },
  this.commandFinished = function(){
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

        console.log('switching to running\n');
        this.status=2;

      console.log('status when running '+this.status);
        this.commandNext();
      }
    }else{
      this.commandNext();
    }
  },
  this.commandNext = function(){
    if(this.commandCount>0){
      this.commandCount--;
      var c = this.commandStack.shift();
      if (c!==undefined){
        c();
      }
    }
  }
}

var gdbStdoutCallback=function(socket,chunk) {
  console.log(chunk+'\n');
  // if gdb is initialized
  if(gdbCommandRunner.status===2){
    console.log('this chunk is sent\n');
    socket.emit('news',{
      type:'output',
      data:chunk
    });
  }
  
  if(chunk.match(/.*\(gdb\)\s.*/g)){
    console.log('found gdb string that is used as separator\n')
    gdbCommandRunner.commandFinished();
  }
}
