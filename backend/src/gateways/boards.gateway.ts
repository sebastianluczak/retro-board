import {
  ConnectedSocket,
  MessageBody,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Socket } from 'socket.io';
import { BoardsService } from '../boards/boards.service';

type BoardData = {
  ownedBy: string; // someone, we'll determine who later
  name: string; // Board name
  participants: {
    socket: Socket;
    username: string;
  }[]; // Participants in the board
  columns: ColumnData[]; // Columns for a board
};

type ColumnData = {
  name: string; // Column name
  voting: boolean; // Determines if column can be voted on
  cards: CardData[]; // Cards in the column
};

type CardData = {
  id: string; // Card ID
  ownedBy: string; // someone, we'll determine who later
  content: string; // Card content, as a string
  image: string; // Card image, as a string
  votes: number; // Number of votes on card
};

@WebSocketGateway({ cors: true })
export class BoardsGateway implements OnGatewayDisconnect {
  private readonly boards: BoardData[] = [];
  private readonly logger = new Logger(BoardsGateway.name);

  constructor(private readonly boardsService: BoardsService) {}

  handleDisconnect(client: Socket) {
    // remove the user from all rooms
    // todo: this.boardsService.removeClientFromAllBoards(client);
    this.logger.log(`User disconnects from all boards`);
    for (const board of this.boards) {
      board.participants = board.participants.filter(
        (participant) => participant.socket !== client,
      );
    }
  }

  private sendUpdatedBoardsToClients(
    boardName: string,
    options?: { exclude?: Socket },
  ) {
    this.logger.log(`Sending updated boards to clients`);
    const board = this.boards.find((board) => board.name === boardName);

    if (!board) {
      throw new Error('Board not found');
    }

    for (const participant of board.participants) {
      if (options?.exclude && participant.socket === options.exclude) {
        this.logger.log(
          `Excluding ${participant.username} as they are the source`,
        );
        continue;
      }
      participant.socket.emit('columnsUpdated', board.columns);
      participant.socket.emit(
        'participantsUpdated',
        board.participants.map((p) => ({
          name: p.username,
          isAdminOfBoard: board.ownedBy === participant.username,
        })),
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
      /*chosenBoard = this.boardsService.createWith({
        owner: { name: data.ownedBy, socket: client },
        name: data.name,
      });*/
      // this is the old way, we want to store everything inside BoardsService!
      // todo: refactor to boards service
      chosenBoard = {
        ownedBy: data.ownedBy,
        name: data.name,
        participants: [{ socket: client, username: data.ownedBy }],
        columns: [
          {
            name: 'Example column',
            cards: [
              {
                id: '1',
                ownedBy: data.ownedBy,
                content: 'This is your first card.',
                image:
                  'https://mir-s3-cdn-cf.behance.net/project_modules/hd/5eeea355389655.59822ff824b72.gif',
                votes: 0,
              },
            ],
            voting: false,
          },
          {
            name: 'Column 2',
            cards: [],
            voting: false,
          },
        ],
      };
      this.boards.push(chosenBoard);
    } else {
      // if the board exists, we should just join user to the board
      this.logger.log(`Board ${data.name} already exists`);
      chosenBoard.participants.push({ socket: client, username: data.ownedBy });
    }

    this.logger.log(
      `In chosen board [${data.name}] there are ${chosenBoard.participants.length} participants`,
    );

    this.sendUpdatedBoardsToClients(data.name);
  }

  @SubscribeMessage('updateBoard')
  handleUpdateBoard(
    @MessageBody() data: BoardData,
    @ConnectedSocket() client: Socket,
  ) {
    this.logger.log(`Updating board ${data.name}`);
    const board = this.boards.find((board) => board.name === data.name);
    if (!board) {
      throw new Error('Board not found');
    }
    board.columns = data.columns;

    this.sendUpdatedBoardsToClients(data.name, { exclude: client });
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

  @SubscribeMessage('deleteCard')
  handleDeleteCard(
    @MessageBody()
    data: {
      boardName: string;
      columnIndex: number;
      id: string;
    },
    @ConnectedSocket() client: Socket,
  ) {
    this.logger.log(
      `Deleting card in board ${data.boardName} with id ${data.id} on column ${data.columnIndex}`,
    );
    const board = this.boards.find((board) => board.name === data.boardName);
    if (!board) {
      throw new Error('Board not found');
    }

    board.columns[data.columnIndex].cards = board.columns[
      data.columnIndex
    ].cards.filter((card) => {
      if (card.id !== data.id) {
        return card;
      }
    });
    this.sendUpdatedBoardsToClients(data.boardName, { exclude: client });
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

  @SubscribeMessage('columnNameChanged')
  handleColumnNameChanged(
    @MessageBody()
    data: {
      boardName: string;
      columnIndex: number;
      name: string;
    },
    @ConnectedSocket() client: Socket,
  ) {
    this.logger.log(
      `Change of column at index ${data.columnIndex} on board named ${data.boardName} to ${data.name}`,
    );
    const board = this.boards.find((board) => board.name === data.boardName);
    if (!board) {
      throw new Error('Board not found');
    }

    board.columns[data.columnIndex].name = data.name;
    this.sendUpdatedBoardsToClients(data.boardName, { exclude: client });
  }

  @SubscribeMessage('updateCardContent')
  handleUpdateCardContent(
    @MessageBody()
    data: {
      boardName: string;
      columnIndex: number;
      cardIndex: number;
      content: string;
      image: string;
    },
    @ConnectedSocket() client: Socket,
  ) {
    this.logger.log(
      `Updating card content in column ${data.columnIndex} to ${data.content} in ${data.boardName}`,
    );
    const board = this.boards.find((board) => board.name === data.boardName);
    if (!board) {
      throw new Error('Board not found');
    }

    board.columns[data.columnIndex].cards[data.cardIndex].content =
      data.content;
    board.columns[data.columnIndex].cards[data.cardIndex].image = data.image;
    this.sendUpdatedBoardsToClients(data.boardName, { exclude: client });
  }

  @SubscribeMessage('removeColumn')
  handleRemoveColumn(
    @MessageBody()
    data: {
      boardName: string;
      columnIndex: number;
    },
    @ConnectedSocket() client: Socket,
  ) {
    this.logger.log(
      `Removing column in board ${data.boardName} at index ${data.columnIndex}`,
    );
    const board = this.boards.find((board) => board.name === data.boardName);
    if (!board) {
      throw new Error('Board not found');
    }

    board.columns.splice(data.columnIndex, 1);
    this.sendUpdatedBoardsToClients(data.boardName, { exclude: client });
  }

  @SubscribeMessage('createColumn')
  handleCreateColumn(
    @MessageBody()
    data: {
      boardName: string;
      columnName: string;
    },
    @ConnectedSocket() client: Socket,
  ) {
    this.logger.log(
      `Adding new column to ${data.boardName} named ${data.columnName}`,
    );
    const board = this.boards.find((board) => board.name === data.boardName);
    if (!board) {
      throw new Error('Board not found');
    }

    board.columns.push({
      name: data.columnName,
      cards: [],
      voting: false,
    });
    this.sendUpdatedBoardsToClients(data.boardName, { exclude: client });
  }

  @SubscribeMessage('changeVotingStatus')
  handleChangeVotingStatus(
    @MessageBody()
    data: {
      boardName: string;
      state: boolean;
    },
    @ConnectedSocket() client: Socket,
  ) {
    this.logger.log(`Voting for ${data.boardName} is now ${data.state}`);
    const board = this.boards.find((board) => board.name === data.boardName);
    if (!board) {
      throw new Error('Board not found');
    }
    board.columns.forEach((column) => {
      column.voting = true;
    });
    this.sendUpdatedBoardsToClients(data.boardName, { exclude: client });
  }
}
