import { OnModuleInit } from '@nestjs/common';
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { WebSocket } from 'ws';
import { FEATURED_SYMBOLS, PSX_WS_URL } from '../common/constants';

interface TickUpdateMessage {
  type: string;
  symbol?: string;
  [key: string]: unknown;
}

@WebSocketGateway({
  namespace: '/ws',
  cors: {
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3002',
      'https://p04-trade-up.vercel.app',
      'https://p04-trade-up1.vercel.app',
    ],
    credentials: true,
    methods: ['GET', 'POST'],
  },
})
export class MarketGateway implements OnModuleInit {
  @WebSocketServer()
  server!: Server;

  private upstream?: WebSocket;

  onModuleInit() {
    this.connectUpstream();
  }

  @SubscribeMessage('subscribeSymbol')
  handleSubscribe(
    @ConnectedSocket() socket: Socket,
    @MessageBody() symbol: string,
  ) {
    if (!(FEATURED_SYMBOLS as readonly string[]).includes(symbol)) {
      return;
    }
    void socket.join(`symbol:${symbol}`);
    socket.emit('subscribed', { symbol });
  }

  private connectUpstream() {
    const ws = new WebSocket(PSX_WS_URL);
    this.upstream = ws;

    ws.on('open', () => {
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

    // Fix: Type 'data' as unknown and safely narrow types instead of using 'any'
    ws.on('message', (data: unknown) => {
      try {
        let rawMessage: string;

        if (Buffer.isBuffer(data)) {
          rawMessage = data.toString();
        } else if (Array.isArray(data)) {
          // If data is Buffer[], concatenate it
          rawMessage = Buffer.concat(data as Buffer[]).toString();
        } else if (data instanceof ArrayBuffer) {
          rawMessage = Buffer.from(data).toString();
        } else {
          // Safe fallback
          rawMessage = String(data);
        }

        const msg = JSON.parse(rawMessage) as TickUpdateMessage;

        if (msg?.type === 'tickUpdate' && msg?.symbol) {
          console.log(msg);
          this.server.to(`symbol:${msg.symbol}`).emit('tickUpdate', msg);
        }
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    });

    ws.on('close', () => {
      setTimeout(() => this.connectUpstream(), 2000);
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      try {
        ws.close();
      } catch (closeError) {
        console.error('Failed to close WebSocket:', closeError);
      }
    });
  }
}
