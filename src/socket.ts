import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';

export function setupWebSocket(server: Server) {
  const wss = new WebSocketServer({ server });

  const clients = new Map<string, WebSocket>();

  wss.on('connection', (ws, req) => {
    const url = new URL(req.url || '', `http://${req.headers.host}`);
    const userId = url.searchParams.get('userId');

    if (userId) {
      clients.set(userId, ws);
    }

    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        // Handle incoming messages if needed
        console.log('Received message:', data);
      } catch (e) {
        console.error('Failed to parse WS message', e);
      }
    });

    ws.on('close', () => {
      if (userId) {
        clients.delete(userId);
      }
    });
  });

  return {
    sendToUser: (userId: string, data: any) => {
      const client = clients.get(userId);
      if (client && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(data));
      }
    },
    broadcast: (data: any) => {
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(data));
        }
      });
    }
  };
}
