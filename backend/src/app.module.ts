import { Module } from '@nestjs/common';
import { GatewaysModule } from './gateways/gateways.module';

@Module({
  imports: [GatewaysModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
