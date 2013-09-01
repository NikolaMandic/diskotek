var cp = require('child_process');
var a = cp.exec('export QEMU_LD_PREFIX=/usr/arm-linux-gnueabi;qemu-arm-static -g 12345 proba ',[],{env:{
QEMU_LD_PREFIX:'/usr/arm-linux-gnueabi'
}
});
