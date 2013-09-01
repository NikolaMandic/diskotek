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

var io = require('socket.io').listen(807);
var cp = require('child_process');
//['qemu-arm-static','-g','12345',name,'-E QEMU_LD_PREFIX=/usr/arm-linux-gnueabi'],close_fds=True,env=env)
var qemu_static; //= Ycp.fork('qemu-arm-static -g 12345 ,name,'-E QEMU_LD_PREFIX=/usr/arm-linux-gnueabi']);
var gdb;
var command = require('command');
  command.open('./');

  io.sockets.on('connection', function (socket) {
    socket.emit('news', { hello: 'world' });
    socket.on('start', function (data) {
      console.log(data);
      try{
        qemu_static = cp.spawn('qemu-arm-static',['-g','12345', data.name, '-E',' QEMU_LD_PREFIX=/usr/arm-linux-gnueabi']);
        gdb = cp.spawn('gdb-multiarch', [ data.name] );
        gdb.stdout.setEncoding('utf-8');
        gdb.stdout.on('data',function(chunk) {
          socket.emit('news',{
                    type:'output',
                    data:chunk
                    });
        })
      }catch(err){
        console.log(err);
     }

    });
    
    socket.on('command',function(data) {
         
      console.log(data);
      gdb.stdin.write(data.ptyPayload);
    });

  });
  
  


