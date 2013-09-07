/*
var express = require('express');
var app = express();
app.get('/hello.txt', function(req, res){
  var body = 'Hello World';
  res.setHeader('Content-Type', 'text/plain');
  res.setHeader('Content-Length', body.length);
  res.end(body);
});
app.listen(807);
*/
var express = require('express');
var app = express();

app.use(express.static('./' + '/app'));

app.listen(process.env.PORT || 3000);
var $ = require("jquery");
var io = require('socket.io').listen(807);
var cp = require('child_process');
//['qemu-arm-static','-g','12345',name,'-E QEMU_LD_PREFIX=/usr/arm-linux-gnueabi'],close_fds=True,env=env)
var qemu_static; //= Ycp.fork('qemu-arm-static -g 12345 ,name,'-E QEMU_LD_PREFIX=/usr/arm-linux-gnueabi']);
var gdb;
var started=0;
var command = require('command');
  command.open('./');
var commandStack=[];
var command_count=1;
io.set('log level',1);
  io.sockets.on('connection', function (socket) {
   // socket.emit('news', { hello: 'world' });
    socket.on('start', function (data) {
      if(started!=1){
        started=1;
      
        //console.log(data);
        try{
          qemu_static = cp.fork('./sp.js');//cp.exec('qemu-arm-static',['-g','12345', data.name, '-E','QEMU_LD_PREFIX=/usr/arm-linux-gnueabi']);
          //console.log('ovde');
          gdb = cp.spawn('gdb-multiarch', [ data.name] );
          gdb.stdout.setEncoding('utf-8');
          gdb.stdout.on('data',function(chunk) {
            
            socket.emit('news',{
                        type:'output',
                        data:chunk
                        });

            console.log('commandCount on sending output: '+command_count);
            if(chunk.match(/.*\(gdb\)\s.*/g)){
              if(command_count>1){
                console.log("found match and executing new command");
                
                command_count--;
                var c = commandStack.shift();
                if (c!==undefined){
                  c();
                }             
              }else{
               if(command_count==1){
                command_count--;
               }
              }
            }
            
          });
          gdb.stderr.setEncoding('utf-8');
          gdb.stderr.on('data',function(chunk) {
            socket.emit('news',{
                      type:'output',
                      data:chunk
                      });
          });
        }catch(err){
          console.log(err);
        }
      }
    });
    socket.on('assemble',function(data){
      var exec = require('child_process').exec,
      child;
console.log('echo "'+data.command+'" > aa.txt; arm-linux-gnueabi-as aa.txt; arm-linux-gnueabi-objdump -d a.out |grep -o -E -e "0:(\s*(\w+)\s*)" | cut -d ":" -f 2| grep -o -E -e "\w+"');

      child = exec('echo "'+data.command+'" > aa.txt; arm-linux-gnueabi-as aa.txt; arm-linux-gnueabi-objdump -d a.out |grep -o -E -e "0:(\\s*(\\w+)\\s*)" | cut -d ":" -f 2| grep -o -E -e "\\w+"',
                function (error, stdout, stderr) {
                  socket.emit('news',{
                    bin:stdout
                  })
                  console.log('stdout: ' + stdout);
                  console.log('stderr: ' + stderr);
                  if (error !== null) {
                    console.log('exec error: ' + error);
                  }
                }); 
    }); 
    socket.on('command',function(data) {
      command_count+=1;
      console.log('info','command arrived: '+command_count);
      console.log(data);
      if (command_count>1){
        commandStack.push(function() {
          gdb.stdin.write(data.ptyPayload+"\n");
        //  console.log(data.ptyPayload);
        });
      }else{
       console.log('info', "command executed right away")
        gdb.stdin.write(data.ptyPayload+"\n");
      }
    });

  });
  
  


