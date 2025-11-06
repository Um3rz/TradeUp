import { Controller, Get, Post, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { WatchlistService } from './watchlist.service';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { StocksService } from '../stocks/stocks.service';

@Controller('watchlist')
@UseGuards(JwtAuthGuard)
export class WatchlistController {
  constructor(private readonly watchlist: WatchlistService, private readonly stocks: StocksService) {}

  @Get()
  async list(@Req() req: any) {
    const items = await this.watchlist.list(req.user.userId);
    // augment with live ticks
    const withTicks = await Promise.all(
      items.map(async (i) => ({ symbol: i.symbol, tick: await this.stocks.getTick(i.symbol) }))
    );
    return withTicks;
  }

  @Post()
  async add(@Req() req: any, @Body() body: { symbol: string }) {
    await this.watchlist.add(req.user.userId, body.symbol);
    return { ok: true };
  }

  @Delete(':symbol')
  async remove(@Req() req: any, @Param('symbol') symbol: string) {
    await this.watchlist.remove(req.user.userId, symbol);
    return { ok: true };
  }
}
