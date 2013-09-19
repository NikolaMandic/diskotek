
var cp = require('child_process');
gdb = cp.spawn('vagrant', ['up'] );
gdb.stdout.setEncoding('utf-8');
gdb.stdout.on('data',function(chunk) {
            

  console.log(chunk);
});
