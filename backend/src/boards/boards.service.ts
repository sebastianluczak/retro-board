import { Injectable, Logger } from '@nestjs/common';
import { Socket } from 'socket.io';

export type BoardData = {
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
  voting: boolean; // Indicates if column's cards has voting capabilities
  blurry: boolean; // Indicates if column's cards are blurred
  cards: CardData[]; // Cards in the column
};

export type CardData = {
  id: string; // Card ID
  ownedBy: string; // someone, we'll determine who later
  content: string; // Card content, as a string
  image: string; // Card image, as a string
  votes: number; // Number of votes on card
};

type CreateBoardPayload = {
  name: string;
  owner: {
    name: string;
    socket: Socket;
  };
};

@Injectable()
export class BoardsService {
  private readonly logger = new Logger(BoardsService.name);
  private readonly boards: BoardData[] = [];

  createWith(data: CreateBoardPayload) {
    this.logger.debug(
      `Creating board [${data.name}] for user [${data.owner.name}]`,
    );
    const board: BoardData = {
      name: data.name,
      ownedBy: data.owner.name,
      columns: [
        {
          name: 'Example column',
          cards: [
            {
              id: '1',
              ownedBy: data.owner.name,
              content:
                'This is your first card. You can move it around, ' +
                'edit it, and vote on it. You may also add more cards and columns. ' +
                'Deletion is also possible.',
              image:
                'https://mir-s3-cdn-cf.behance.net/project_modules/hd/5eeea355389655.59822ff824b72.gif',
              votes: 0,
            },
          ],
          voting: false,
          blurry: false,
        },
        {
          name: 'Column 2',
          cards: [],
          voting: false,
          blurry: false,
        },
      ],
      participants: [
        {
          socket: data.owner.socket,
          username: data.owner.name,
        },
      ],
    };

    this.boards.push(board);

    return board;
  }

  getAll() {
    return this.boards;
  }

  findByName(boardName: string) {
    this.logger.debug(`Finding a board with name ${boardName}`);
    const board = this.boards.find((board) => board.name === boardName);
    if (!board) {
      throw new Error('Board not found');
    }
    this.logger.debug(
      `Board found ${board.name} with columns: ${board.columns.length}`,
    );

    return board;
  }

  removeClientFromBoards(client: Socket) {
    this.logger.debug(`Removing client ${client.id} from all boards...`);
    for (const board of this.boards) {
      board.participants = board.participants.filter(
        (participant) => participant.socket !== client,
      );
    }
  }
}
