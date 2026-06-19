import {
  WebSocketServer,
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({ path: '/notifications-ws', cors: { origin: '*' } })
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationsGateway.name);

  handleConnection(client: Socket) {
    // connection established; client can register with its userId
  }

  handleDisconnect(client: Socket) {
    // cleanup if needed
  }

  @SubscribeMessage('register')
  handleRegister(@MessageBody() data: { userId: string }, @ConnectedSocket() client: Socket) {
    if (data?.userId) {
      // store as string to avoid type mismatches
      client.data.userId = String(data.userId);
      client.emit('registered', { ok: true });
      this.logger.log(`Socket ${client.id} registered as user ${client.data.userId}`);
    }
  }

  sendToUser(userId: string, payload: any) {
    if (!this.server) return;
    // iterate all sockets and emit to those with matching userId
    const target = String(userId);
    let sent = 0;
    this.server.sockets.sockets.forEach((socket) => {
      try {
        if (String((socket as any).data?.userId) === target) {
          (socket as Socket).emit('notification', payload);
          sent++;
        }
      } catch (e) {
        // ignore
      }
    });
    this.logger.log(`sendToUser ${target} payload=${JSON.stringify(payload)} -> socketsSent=${sent}`);
  }
}
