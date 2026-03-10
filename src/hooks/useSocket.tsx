import * as React from 'react';

export function useSocket(userId: string | undefined) {
  const socketRef = React.useRef<WebSocket | null>(null);
  const [messages, setMessages] = React.useState<any[]>([]);

  React.useEffect(() => {
    if (!userId) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const socket = new WebSocket(`${protocol}//${window.location.host}?userId=${userId}`);
    socketRef.current = socket;

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setMessages((prev) => [...prev, data]);
      } catch (e) {
        console.error('Failed to parse socket message', e);
      }
    };

    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return () => {
      // Clean up listeners to prevent callbacks on a closing/closed socket
      socket.onmessage = null;
      socket.onerror = null;
      socket.onopen = null;

      try {
        if (socket.readyState === WebSocket.OPEN) {
          socket.close();
        } else if (socket.readyState === WebSocket.CONNECTING) {
          // If still connecting, we just nullify the onopen so it doesn't do anything when it opens
          // and we don't call close() immediately to avoid the "closed without opened" warning
          socket.onopen = () => {
            try {
              socket.close();
            } catch (e) {
              // Ignore errors during cleanup
            }
          };
        }
      } catch (e) {
        // Ignore errors during cleanup
      }
    };
  }, [userId]);

  const sendMessage = (data: any) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(data));
    }
  };

  return { messages, sendMessage };
}
