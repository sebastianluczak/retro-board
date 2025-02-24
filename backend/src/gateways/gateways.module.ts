import { Module } from '@nestjs/common';
import { BoardsGateway } from './boards.gateway';

@Module({
  imports: [],
  providers: [BoardsGateway],
  exports: [],
})
export class GatewaysModule {}
