import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { BoardsService } from '../boards/boards.service';

type Timer = {
  timeout: NodeJS.Timeout;
  startTime: number;
  duration: number;
};

@WebSocketGateway({ cors: true })
export class TimerGateway {
  private readonly logger = new Logger(TimerGateway.name);
  timers = new Map<string, Timer>();

  constructor(private readonly boardsService: BoardsService) {}

  @SubscribeMessage('startTimerOnBoard')
  handleStartTimerOnBoard(
    @MessageBody()
    data: {
      boardName: string;
    },
  ) {
    this.logger.log(`Starting timer on board [${data.boardName}]`);
    this.startTimerOnBoard(data.boardName);
    this.sendUpdatedTimerToClients(data.boardName);
  }

  @SubscribeMessage('getTimer')
  handleGetTimer(
    @MessageBody()
    data: {
      boardName: string;
    },
  ) {
    this.logger.log(`Getting timer on board [${data.boardName}]`);

    const board = this.boardsService.findByName(data.boardName);

    if (!board) {
      return;
    }

    const secondsLeft = this.getSecondsTillEndOfTimer(data.boardName);
    this.logger.log(
      `Timer on board [${data.boardName}] has ${secondsLeft} seconds left`,
    );

    board.participants.forEach((participant) => {
      participant.socket.emit('newTimer', {
        secondsLeft,
        boardName: data.boardName,
      });
    });
  }

  private sendUpdatedTimerToClients(boardName: string) {
    this.logger.log(`Sending updated timer on board [${boardName}]`);
    const board = this.boardsService.findByName(boardName);

    for (const participant of board.participants) {
      participant.socket.emit('timer', {
        secondsLeft: this.getSecondsTillEndOfTimer(boardName),
        boardName,
      });
    }
  }

  startTimerOnBoard(boardName: string) {
    const duration = 2 * 60 * 1000;
    const startTime = Date.now();

    const timer = {
      timeout: setTimeout(() => {
        this.logger.log(`Timer on board [${boardName}] has ended`);
        this.timers.delete(boardName);
      }, duration),
      startTime,
      duration,
    } as Timer;

    this.timers.set(boardName, timer);
  }

  getSecondsTillEndOfTimer(boardName: string) {
    const timer = this.timers.get(boardName);
    if (!timer) {
      return 0;
    }

    const now = Date.now();
    const endTime = timer.startTime + timer.duration;
    const timeLeft = endTime - now;

    return Math.max(0, Math.round(timeLeft / 1000));
  }
}
