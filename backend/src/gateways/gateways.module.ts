import { Module } from '@nestjs/common';
import { BoardsGateway } from './boards.gateway';
import { BoardsModule } from '../boards/boards.module';
import { TimerGateway } from './timer.gateway';

@Module({
  imports: [BoardsModule],
  providers: [BoardsGateway, TimerGateway],
  exports: [],
})
export class GatewaysModule {}
