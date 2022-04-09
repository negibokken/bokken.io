const http = require('http');

const server = http.createServer((req, res) => {res.end('OK!')});

console.log('Now listening on 3000 port');
server.listen(3000);
