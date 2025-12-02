import { Controller, Get, Post, Body } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { Query } from '@nestjs/common';

@Controller('news')
export class NewsController {
  constructor(private readonly httpService: HttpService) {}

  @Get('latest')
  async getLatestNews() {
    const apiKey = process.env.NEWS_API_KEY;
    const url = `https://financialmodelingprep.com/stable/fmp-articles?limit=10&apikey=${apiKey}`;
    const response = await firstValueFrom(this.httpService.get(url));
    return (response as any).data;
  }

    @Post('stock')
    async getStockNews(@Body() body: { ticker: string }) {
      const apiKey = process.env.STOCK_API_KEY;
      const ticker = body?.ticker;
      if (!ticker) {
        return { error: 'Ticker is required in request body' };
      }
      const url = `https://api.marketaux.com/v1/news/all?symbols=${ticker}&limit=3&api_token=${apiKey}`;
      const response = await firstValueFrom(this.httpService.get(url));
      return (response as any).data.data;
    }
}
