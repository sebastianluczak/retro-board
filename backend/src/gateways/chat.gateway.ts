import {
  ConnectedSocket,
  MessageBody,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Socket } from 'socket.io';

type ChatData = {
  username: string;
  message: string;
};

type ChatRoom = {
  name: string;
  connections: Socket[];
  messages: ChatData[];
};

@WebSocketGateway({ cors: true })
export class ChatGateway implements OnGatewayDisconnect {
  private chatRooms: ChatRoom[];
  private logger = new Logger(ChatGateway.name);

  constructor() {
    this.chatRooms = [
      {
        name: 'default',
        connections: [],
        messages: [],
      },
    ];
  }

  handleDisconnect(client: Socket) {
    this.logger.log('Client disconnected: ' + client.id);
    // we have to look for this client in the default room and remove it
    const room = this.chatRooms.find((room) => room.name === 'default');
    if (!room) {
      throw new Error('Room not found');
    }
    const index = room.connections.indexOf(client);
    if (index !== -1) {
      room.connections.splice(index, 1);
    }
  }

  private broadcast(event: any, message: any) {
    this.logger.log(`Broadcasting message to default room`);
    // todo: determine the room from the client. Name rooms as UUIDs.
    const room = this.chatRooms.find((room) => room.name === 'default');
    if (!room) {
      throw new Error('Room not found');
    }
    for (const c of room.connections) {
      c.emit(event, message);
    }
  }

  @SubscribeMessage('login')
  handleLogin(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { room: string; username: string },
  ) {
    this.logger.log(`User ${data.username} logs in to room ${data.room}`);
    this.chatRooms
      .find((room) => room.name === data.room)
      ?.connections.push(client);
  }

  @SubscribeMessage('events')
  handleEvent(@MessageBody() data: ChatData) {
    // each event sent to `events` is treated as a chat message
    // There's one, default chat room, created in constructor.
    // Each message is sent to all users in the room.
    // Each message is saved in the chat room's history.
    // If it's a new user, there's a SYSTEM message sent to all users in the room.

    // find the room
    const room = this.chatRooms.find((room) => room.name === 'default');
    if (!room) {
      throw new Error('Room not found');
    }

    // add the message to the room's history
    room.messages.push(data);

    this.broadcast('events', data);
  }
}
