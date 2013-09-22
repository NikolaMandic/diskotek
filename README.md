ld
==
early development version of ui for gdb debugger for arm on linux !!!
some code is not as it should be right now because I wanted to implement some features faster.
unstable now but in active development
docs in the making http://nikolamandic.github.io/diskotek/
ubuntu setup
==

for tools needed check out /vdir/bootstrap.sh<br/>
that is a script for bootstraping fresh installation of ubuntu precise so it can run this in vm

some of the steps needed<br/>
  sudo apt-get install gcc-arm-linux-gnueabi <br/>
  sudo apt-get install qemu-user-static <br/>
  sudo apt-get install gdb-multiarch <br/>
  export QEMU_LD_PREFIX=/usr/arm-linux/gnueabi <br/>

  latest nodejs<br/>

  sudo nodejs ws.js<br/>

open localhost:3000/index.html#/ in browser and click debug

vm debugging
==

sudo apt-get install vagrant

cd vdir<br/>
vagrant up<br/>
go to localhost:8080/index.html#/<br/>
now app is being debugged inside a virtual machine<br/>


Pictures
==
![](https://raw.github.com/NikolaMandic/ld/master/a.png)
![](https://raw.github.com/NikolaMandic/ld/master/aa.png)
![](https://raw.github.com/NikolaMandic/ld/master/qb.png)
![](https://raw.github.com/NikolaMandic/ld/master/qq.png)
![](https://raw.github.com/NikolaMandic/ld/master/qa.png)


