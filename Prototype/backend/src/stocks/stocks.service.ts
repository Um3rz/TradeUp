import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { FEATURED_SYMBOLS, PSX_API_BASE } from '../common/constants';

@Injectable()
export class StocksService {
  private readonly base = PSX_API_BASE;

  getFeaturedSymbols() {
    return FEATURED_SYMBOLS as readonly string[];
  }

  async getTick(symbol: string, type = 'REG') {
    const url = `${this.base}/api/ticks/${type}/${encodeURIComponent(symbol)}`;
    const { data } = await axios.get(url, { timeout: 5000 });
    if (data?.success) return data.data;
    return null;
  }

  async listFeaturedWithTicks() {
    const symbols = this.getFeaturedSymbols();
    const results = await Promise.all(
      symbols.map(async (s) => ({ symbol: s, tick: await this.getTick(s) }))
    );
    return results;
  }
}
