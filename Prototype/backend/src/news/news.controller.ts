import { Controller, Get, Post, Body, BadRequestException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

interface StockNewsRequest {
  ticker: string;
}

const VALID_TICKER_PATTERN = /^[A-Z]{1,5}$/;
const MAX_TICKER_LENGTH = 5;

@Controller('news')
export class NewsController {
  constructor(private readonly httpService: HttpService) {}

  private validateTicker(ticker: string): string {
    if (!ticker || typeof ticker !== 'string') {
      throw new BadRequestException('Ticker must be a non-empty string');
    }

    const trimmedTicker = ticker.trim().toUpperCase();

    if (trimmedTicker.length === 0 || trimmedTicker.length > MAX_TICKER_LENGTH) {
      throw new BadRequestException(`Ticker must be between 1 and ${MAX_TICKER_LENGTH} characters`);
    }

    if (!VALID_TICKER_PATTERN.test(trimmedTicker)) {
      throw new BadRequestException('Ticker must contain only uppercase letters');
    }

    return trimmedTicker;
  }

  @Get('latest')
  async getLatestNews() {
    const apiKey = process.env.NEWS_API_KEY;
    const url = `https://financialmodelingprep.com/stable/fmp-articles?limit=10&apikey=${apiKey}`;
    
    try {
      const response = await firstValueFrom(this.httpService.get(url));
      
      console.log('=== LATEST NEWS API RESPONSE ===');
      console.log('Status:', response.status);
      console.log('Data Type:', typeof response.data);
      console.log('Data Structure:', Array.isArray(response.data) ? 'Array' : typeof response.data);
      
      if (Array.isArray(response.data) && response.data.length > 0) {
        console.log('First Item Keys:', Object.keys(response.data[0]));
        console.log('First Item Sample:', JSON.stringify(response.data[0], null, 2));
      }
      
      return response.data;
    } catch (error) {
      console.error('Failed to fetch latest news:', error);
      throw new BadRequestException('Failed to fetch latest news from external API');
    }
  }

  @Post('stock')
  async getStockNews(@Body() body: StockNewsRequest): Promise<unknown> {
    const apiKey = process.env.STOCK_API_KEY;
    
    console.log('=== INCOMING REQUEST ===');
    console.log('Body:', JSON.stringify(body));
    console.log('Ticker Value:', body?.ticker);
    console.log('Ticker Type:', typeof body?.ticker);
    
    const validatedTicker = this.validateTicker(body?.ticker);
    
    console.log('Validated Ticker:', validatedTicker);

    const url = `https://api.marketaux.com/v1/news/all?symbols=${validatedTicker}&limit=3&api_token=${apiKey}`;
    
    try {
      const response = await firstValueFrom(this.httpService.get(url));
      
      console.log('=== STOCK NEWS API RESPONSE ===');
      console.log('Status:', response.status);
      console.log('Data Type:', typeof response.data);
      console.log('Data Keys:', Object.keys(response.data));
      
      if (response.data.data && Array.isArray(response.data.data)) {
        console.log('Data Array Length:', response.data.data.length);
        if (response.data.data.length > 0) {
          console.log('First Item Keys:', Object.keys(response.data.data[0]));
          console.log('First Item Sample:', JSON.stringify(response.data.data[0], null, 2));
        }
      }
      
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch stock news:', error);
      throw new BadRequestException('Failed to fetch stock news from external API');
    }
  }
}
