import {
  ConnectedSocket,
  MessageBody,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Socket } from 'socket.io';

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

@WebSocketGateway({ cors: true })
export class BoardsGateway implements OnGatewayDisconnect {
  private readonly boards: BoardData[];
  private readonly logger = new Logger(BoardsGateway.name);

  constructor() {
    this.boards = [];
  }

  handleDisconnect(client: Socket) {
    // remove the user from all rooms
    this.logger.log(`User disconnects from all boards`);
    for (const board of this.boards) {
      board.participants = board.participants.filter(
        (participant) => participant !== client,
      );
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
      participant.emit(
        'participantsUpdated',
        board.participants.map((p) => p.id),
      );
    }
  }

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
                image:
                  'https://upload.wikimedia.org/wikipedia/commons/8/8f/Example_image.svg',
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

    this.sendUpdatedBoardsToClients(data.name);
  }

  @SubscribeMessage('updateBoard')
  handleUpdateBoard(@MessageBody() data: BoardData) {
    this.logger.log(`Updating board ${data.name}`);
    const board = this.boards.find((board) => board.name === data.name);
    if (!board) {
      throw new Error('Board not found');
    }
    board.columns = data.columns;

    this.sendUpdatedBoardsToClients(data.name);
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

  @SubscribeMessage('moveCard')
  handleMoveCard(
    @MessageBody()
    data: {
      boardName: string;
      dragIndex: number;
      sourceColumnIndex: number;
      targetColumnIndex: number;
    },
  ) {
    this.logger.log(
      `Moving card from column ${data.sourceColumnIndex} to ${data.targetColumnIndex} in ${data.boardName}`,
    );
    const board = this.boards.find((board) => board.name === data.boardName);
    if (!board) {
      throw new Error('Board not found');
    }

    const [draggedCard] = board.columns[data.sourceColumnIndex].cards.splice(
      data.dragIndex,
      1,
    );
    board.columns[data.targetColumnIndex].cards.unshift(draggedCard);
    this.sendUpdatedBoardsToClients(data.boardName);
  }
}
