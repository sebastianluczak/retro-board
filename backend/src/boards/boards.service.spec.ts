import { BoardsService } from './boards.service';
import { Socket } from 'socket.io';

describe('boards service', () => {
  let service: BoardsService;

  beforeEach(() => {
    service = new BoardsService();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a board', () => {
    const boardName = 'test';
    service.createWith({
      name: boardName,
      owner: { name: 'test', socket: {} as Socket },
    });

    const boards = service.getAll();
    expect(boards.length).toEqual(1);
    expect(boards[0].name).toEqual(boardName);
  });
});
