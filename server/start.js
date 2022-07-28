import { createServer } from 'http';
import { Server } from 'socket.io';

const httpServer = createServer();
const io = new Server(httpServer, {
    pingTimeout: 60000
});

io.on('connection', function(socket){
    console.log("Player connected to server!");
});

httpServer.listen(52300, ()=>{
    console.log('Start server to port: 52300');
});