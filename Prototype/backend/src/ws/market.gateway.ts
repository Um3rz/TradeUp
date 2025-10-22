import { OnModuleInit } from '@nestjs/common';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import WebSocket from 'ws';
import { FEATURED_SYMBOLS, PSX_WS_URL } from '../common/constants';

@WebSocketGateway({ namespace: '/ws', cors: true })
export class MarketGateway implements OnModuleInit {
  @WebSocketServer()
  server!: Server;

  private upstream?: WebSocket;

  onModuleInit() {
    this.connectUpstream();
  }

  private connectUpstream() {
    const ws = new WebSocket(PSX_WS_URL);
    this.upstream = ws;

    ws.on('open', () => {
      // subscribe to featured symbols
      for (const symbol of FEATURED_SYMBOLS) {
        const msg = {
          type: 'subscribe',
          subscriptionType: 'marketData',
          params: { marketType: 'REG', symbol },
          requestId: `sub-${symbol}`,
        };
        ws.send(JSON.stringify(msg));
      }
    });

    ws.on('message', (data) => {
      try {
        const msg = JSON.parse(String(data));
        if (msg?.type === 'tickUpdate') {
          this.server.emit('tickUpdate', msg);
        }
      } catch {}
    });

    ws.on('close', () => {
      setTimeout(() => this.connectUpstream(), 2000);
    });

    ws.on('error', () => {
      try {
        ws.close();
      } catch {}
    });
  }
}
