import { Module } from '@nestjs/common';
import { MarketGateway } from './market.gateway';
import { StocksModule } from '../stocks/stocks.module';

@Module({
  imports: [StocksModule],
  providers: [MarketGateway],
})
export class WsModule {}
