ld
==
early development version of ui for gdb debugger for arm on linux !!!
not made to be runnable on other computer right now  :-D 

ubuntu setup
==

sudo apt-get install gcc-arm-linux-gnueabi
sudo apt-get install qemu-user-static
sudo apt-get install gdb-multiarch
export QEMU_LD_PREFIX=/usr/arm-linux/gnueabi

get the latest nodejs
from project directory

sudo nodejs ws.js

open localhost:3000 in browser and click debug

to stop it kill the node process



![](https://raw.github.com/NikolaMandic/ld/master/a.png)

graphs via Raphael they can be moved
![](https://raw.github.com/NikolaMandic/ld/master/b.png)
