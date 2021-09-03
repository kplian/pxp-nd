import { Socket, Server } from 'socket.io';
import { getManager } from 'typeorm';
import UserIo from './entities/UserIo';

export const usersConnected: any = [];

export const connectClient = ( client: Socket, io: Server ) => {
  usersConnected.push(client.id);
  getManager().save(UserIo, {
    clientId: client.id,
    userId: 1,
  }).then(data => console.log(data)).catch(console.error);
};

export const disconnect = ( client: Socket, io: Server ) => {
  client.on( 'disconnect', () => {
      console.log('Cliente desconectado');
      const clientIndex: any = usersConnected.indexOf(client.id);
      if (clientIndex > -1) {
        usersConnected.splice(clientIndex, 1);
      }

    getManager().delete(UserIo, {
      clientId: client.id,
    }).then(data => console.log(data)).catch(console.error);
      io.emit('active-users', usersConnected.toString());
  });
};

export const message = ( client: Socket, io: Server ) => {
    client.on( 'message', ( payload: { from: string, message: string }) => {
        console.log('Message recived', payload.from, payload.message );

        io.emit( 'new-message', payload );
    });
};