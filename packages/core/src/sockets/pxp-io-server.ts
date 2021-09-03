import { Server } from 'socket.io';
import http from 'http';
import * as sockets from './basic-sockets';

export default class PxpIOServer {
  public io: Server;

  constructor(server: any) {
    this.io = new Server(server);
    this.listenSockets();     
  }

  private listenSockets() {
    console.log('listen connections');

    this.io.on('connection', client => {
        console.log('Cliente connected:', client);
        //connect client
        sockets.connectClient( client, this.io );
        // user configuration
        // sockets.userConfig( client, this.io );
        // message
        // sockets.message( client, this.io );
        // disconnect client
        sockets.disconnect( client, this.io );
    });
  }
}   