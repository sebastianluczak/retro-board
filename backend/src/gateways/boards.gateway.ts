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

type BoardData = {
  ownedBy: string; // someone, we'll determine who later
  name: string; // Board name
  participants: Socket[]; // Participants in the board
  columns: ColumnData[]; // Columns for a board
};

type ColumnData = {
  name: string; // Column name
  cards: CardData[]; // Cards in the column
};

type CardData = {
  id: string; // Card ID
  content: string; // Card content, as a string
  image: string; // Card image, as a string
};

type ChatRoom = {
  name: string;
  connections: Socket[];
  messages: ChatData[];
};

@WebSocketGateway({ cors: true })
export class BoardsGateway implements OnGatewayDisconnect {
  private chatRooms: ChatRoom[];
  private boards: BoardData[];
  private logger = new Logger(BoardsGateway.name);

  constructor() {
    this.boards = [];
    this.chatRooms = [
      {
        name: 'default',
        connections: [],
        messages: [],
      },
    ];
  }

  handleDisconnect(client: Socket) {
    // remove the user from all rooms
    this.logger.log(`User disconnects from all boards`);
    for (const room of this.chatRooms) {
      room.connections = room.connections.filter((c) => c !== client);
    }
  }

  private broadcast(event: string, message: any) {
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

  private sendUpdatedBoardsToClients(boardName: string) {
    this.logger.log(`Sending updated boards to clients`);
    const board = this.boards.find((board) => board.name === boardName);

    if (!board) {
      throw new Error('Board not found');
    }

    for (const participant of board.participants) {
      participant.emit('columnsUpdated', board.columns);
    }
  }

  // This is new login
  @SubscribeMessage('createBoard')
  handleCreateBoard(
    @MessageBody() data: Omit<BoardData, 'columns' | 'participants'>,
    @ConnectedSocket() client: Socket,
  ) {
    let chosenBoard = this.boards.find((board) => board.name === data.name);
    if (!chosenBoard) {
      this.logger.log(`Board ${data.name} does not exist, creating`);
      chosenBoard = {
        ownedBy: data.ownedBy,
        name: data.name,
        participants: [client],
        columns: [
          {
            name: 'Example column',
            cards: [
              {
                id: '1',
                content: 'Example card',
                image: 'https://example.com/image.jpg',
              },
            ],
          },
          {
            name: 'Column 2',
            cards: [],
          },
        ],
      };
      this.boards.push(chosenBoard);
    } else {
      // if the board exists, we should just join user to the board
      this.logger.log(`Board ${data.name} already exists`);
      chosenBoard.participants.push(client);
    }

    this.logger.log(
      `In chosen board [${data.name}] there are ${chosenBoard.participants.length} participants`,
    );

    // should we emit another event here, like `userJoinedBoard` for all participants?
    // We should, like this:
    this.sendUpdatedBoardsToClients(data.name);
  }

  @SubscribeMessage('updateBoard')
  handleUpdateBoard(@MessageBody() data: BoardData) {
    // absolutely everyone can update the whole board, todo in the future
    this.logger.log(`Updating board ${data.name}`);
    const board = this.boards.find((board) => board.name === data.name);
    if (!board) {
      throw new Error('Board not found');
    }
    board.columns = data.columns;

    // and what now? We should update all participants now
    this.sendUpdatedBoardsToClients(data.name);
  }

  // todo: make it deprecated
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
    const board = this.boards.find((board) => board.name === 'default');
    if (!board) {
      throw new Error('Board not found');
    }

    this.broadcast('events', data);
  }

  @SubscribeMessage('addCard')
  handleAddCard(
    @MessageBody()
    data: {
      boardName: string;
      columnIndex: number;
      card: CardData;
    },
  ) {
    this.logger.log(
      `Adding card to column ${data.columnIndex} to ${data.boardName}`,
    );
    const board = this.boards.find((board) => board.name === data.boardName);
    if (!board) {
      throw new Error('Board not found');
    }

    board.columns[data.columnIndex].cards.push(data.card);
    this.sendUpdatedBoardsToClients(data.boardName);
  }
}
