import { Server } from 'socket.io';
import http from 'http';
import * as mainSockets from './basic-sockets';

export default class PxpIOServer {
  public io: Server;

  constructor(server: any, sockets?: any) {
    this.io = new Server(server, { cors:{
            origin: '*',
    }});
    this.listenSockets(sockets);     
  }

  private listenSockets(sockets: any= {}) {
    console.log('listen connections');
    this.io.on('connection', client => {
        // console.log('Cliente connected:', client.id);
        //connect client
        mainSockets.connectClient( client, this.io );
        // user configuration
        // sockets.userConfig( client, this.io );
        // message
        // sockets.message( client, this.io );
        // disconnect client
        mainSockets.disconnect( client, this.io );
        Object.keys(sockets).forEach(key =>{
          // console.log('on socket:', key);
          
          sockets[key](client, this.io);
        });
    }); 
  }
}   