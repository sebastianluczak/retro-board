import { SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { Logger } from '@nestjs/common';

type Timer = {
  timeout: NodeJS.Timeout;
  startTime: number;
  duration: number;
};

@WebSocketGateway({ cors: true })
export class TimerGateway {
  private readonly logger = new Logger(TimerGateway.name);
  timers = new Map<string, Timer>();

  @SubscribeMessage('startTimerOnBoard')
  handleStartTimerOnBoard(boardName: string) {
    this.startTimerOnBoard(boardName);
    // set board information?
    // this.sendUpdatedBoardsToClients(boardName);
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
