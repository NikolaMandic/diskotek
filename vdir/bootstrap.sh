apt-get update
apt-get install python-software-properties -y
add-apt-repository ppa:chris-lea/node.js -y 
apt-get update
apt-get install gcc-arm-linux-gnueabi -y
apt-get install qemu-user-static -y
apt-get install gdb-multiarch -y
export QEMU_LD_PREFIX=/usr/arm-linux/gnueabi 
apt-get install git -y
git clone https://github.com/NikolaMandic/ld.git
cd ./ld 
apt-get install nodejs -y
npm install express
npm install socket.io
npm install -g bower 
bower install --allow-root
nohup nodejs ws.js &
