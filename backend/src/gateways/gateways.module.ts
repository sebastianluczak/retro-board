import { Module } from '@nestjs/common';
import { BoardsGateway } from './boards.gateway';
import { BoardsModule } from '../boards/boards.module';

@Module({
  imports: [BoardsModule],
  providers: [BoardsGateway],
  exports: [],
})
export class GatewaysModule {}
