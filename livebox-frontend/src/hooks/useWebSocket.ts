import { useEffect, useRef, useCallback } from 'react';
import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { MessageResponse } from '../features/message/types';

interface UseWebSocketOptions {
  channelId: string | null;
  onMessageReceived: (message: MessageResponse) => void;
}

export const useWebSocket = ({ channelId, onMessageReceived }: UseWebSocketOptions) => {
  const stompClientRef = useRef<Client | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    // Connect to WebSocket with token in query param as per backend SCRUM-56
    const socket = new SockJS(`http://localhost:8080/ws?token=${token}`);
    const client = new Client({
      webSocketFactory: () => socket,
      debug: (str) => {
        console.log('STOMP: ' + str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    client.onConnect = (frame) => {
      console.log('STOMP Connected:', frame);
      
      // If we have a channelId, subscribe to it immediately
      if (channelId) {
        client.subscribe(`/topic/channels/${channelId}`, (message: IMessage) => {
          const receivedMessage = JSON.parse(message.body) as MessageResponse;
          onMessageReceived(receivedMessage);
        });
        console.log(`STOMP Subscribed to /topic/channels/${channelId}`);
      }
    };

    client.onStompError = (frame) => {
      console.error('STOMP Broker error:', frame.headers['message']);
      console.error('STOMP Details:', frame.body);
    };

    client.activate();
    stompClientRef.current = client;

    return () => {
      if (stompClientRef.current) {
        stompClientRef.current.deactivate();
        console.log('STOMP Deactivated');
      }
    };
  }, [channelId, onMessageReceived]);

  const sendMessage = useCallback((content: string) => {
    if (stompClientRef.current && stompClientRef.current.connected && channelId) {
      stompClientRef.current.publish({
        destination: `/app/channels/${channelId}/send`,
        body: JSON.stringify({ content }),
      });
      return true;
    }
    console.warn('STOMP: Cannot send message, client not connected or no channel selected');
    return false;
  }, [channelId]);

  return { sendMessage };
};
