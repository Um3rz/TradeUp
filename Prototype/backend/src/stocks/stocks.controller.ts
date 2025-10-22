import { Controller, Get, Param } from '@nestjs/common';
import { StocksService } from './stocks.service';

@Controller('stocks')
export class StocksController {
  constructor(private readonly stocks: StocksService) {}

  @Get('featured')
  async featured() {
    return this.stocks.listFeaturedWithTicks();
  }

  @Get(':symbol')
  async bySymbol(@Param('symbol') symbol: string) {
    return { symbol, tick: await this.stocks.getTick(symbol) };
  }
}
