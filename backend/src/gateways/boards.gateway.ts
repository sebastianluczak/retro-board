import {
  ConnectedSocket,
  MessageBody,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Socket } from 'socket.io';
import { BoardData, BoardsService, CardData } from '../boards/boards.service';

@WebSocketGateway({ cors: true })
export class BoardsGateway implements OnGatewayDisconnect {
  private readonly logger = new Logger(BoardsGateway.name);

  constructor(private readonly boardsService: BoardsService) {}

  handleDisconnect(client: Socket) {
    this.logger.log(`User disconnects from all boards`);
    this.boardsService.removeClientFromBoards(client);
    this.sendUpdatedBoardsToClients('all');
  }

  private sendUpdatedBoardsToClients(
    boardName: string,
    options?: { exclude?: Socket },
  ) {
    this.logger.log(`Sending updated boards to clients`);
    if (boardName === 'all') {
      for (const board of this.boardsService.getAll()) {
        this.sendUpdatedBoardsToClients(board.name, options);
      }
      return;
    }
    const board = this.boardsService.findByName(boardName);

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
    let chosenBoard: BoardData;
    try {
      chosenBoard = this.boardsService.findByName(data.name);
      chosenBoard.participants.push({ socket: client, username: data.ownedBy });
    } catch {
      this.logger.log(`Board ${data.name} does not exist, creating`);
      chosenBoard = this.boardsService.createWith({
        owner: { name: data.ownedBy, socket: client },
        name: data.name,
      });
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
    const board = this.boardsService.findByName(data.name);
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
    const board = this.boardsService.findByName(data.boardName);

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
    const board = this.boardsService.findByName(data.boardName);

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
    const board = this.boardsService.findByName(data.boardName);

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
    const board = this.boardsService.findByName(data.boardName);

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
    const board = this.boardsService.findByName(data.boardName);

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
    const board = this.boardsService.findByName(data.boardName);

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
    const board = this.boardsService.findByName(data.boardName);

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
  ) {
    this.logger.log(`Voting for ${data.boardName} is now ${data.state}`);
    const board = this.boardsService.findByName(data.boardName);
    board.columns.forEach((column) => {
      column.voting = data.state;
    });
    this.sendUpdatedBoardsToClients(data.boardName);
  }
}
