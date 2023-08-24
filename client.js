const net = require('net');
const port = 3001;

let clientSide = net.createConnection(port, () => {
    console.log(`Connect to Message Board\n`);
})

clientSide.setEncoding('utf8');
clientSide.on('data', (messagePackage) => {
    console.log(messagePackage);
})

process.stdin.pipe(clientSide)