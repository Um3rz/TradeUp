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

@WebSocketGateway({ namespace: '/ws', cors: true })
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

    ws.on('message', (data) => {
      try {
        const msg: TickUpdateMessage = JSON.parse(
          String(data),
        ) as TickUpdateMessage;
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
