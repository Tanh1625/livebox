import { useEffect, useRef, useCallback } from 'react';
import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { MessageResponse } from '../features/message/types';
import { MemberStatusResponse } from '../features/server/types';

interface UseWebSocketOptions {
  channelId: string | null;
  serverId: string | null;
  onMessageReceived?: (message: MessageResponse) => void;
  onMemberStatusChanged?: (member: MemberStatusResponse) => void;
}

export const useWebSocket = ({ channelId, serverId, onMessageReceived, onMemberStatusChanged }: UseWebSocketOptions) => {
  const stompClientRef = useRef<Client | null>(null);

  const onMessageReceivedRef = useRef(onMessageReceived);
  onMessageReceivedRef.current = onMessageReceived;

  const onMemberStatusChangedRef = useRef(onMemberStatusChanged);
  onMemberStatusChangedRef.current = onMemberStatusChanged;

  const subscriptionsRef = useRef<{ [key: string]: any }>({});

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) return;

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
      stompClientRef.current = client;

      // Initial subscriptions if IDs already present
      if (channelId) subscribeChannel(channelId);
      if (serverId) subscribeServer(serverId);
    };

    const subscribeChannel = (id: string) => {
      if (subscriptionsRef.current['channel']) {
        subscriptionsRef.current['channel'].unsubscribe();
      }
      subscriptionsRef.current['channel'] = client.subscribe(`/topic/channels/${id}`, (message: IMessage) => {
        const receivedMessage = JSON.parse(message.body) as MessageResponse;
        onMessageReceivedRef.current?.(receivedMessage);
      });
      console.log(`STOMP Subscribed to /topic/channels/${id}`);
    };

    const subscribeServer = (id: string) => {
      if (subscriptionsRef.current['server']) {
        subscriptionsRef.current['server'].unsubscribe();
      }
      subscriptionsRef.current['server'] = client.subscribe(`/topic/servers/${id}/members`, (message: IMessage) => {
        const memberUpdate = JSON.parse(message.body) as MemberStatusResponse;
        onMemberStatusChangedRef.current?.(memberUpdate);
      });
      console.log(`STOMP Subscribed to /topic/servers/${id}/members`);
    };

    // Expose subscribe methods to be used when props change
    (client as any)._subscribeChannel = subscribeChannel;
    (client as any)._subscribeServer = subscribeServer;

    client.onStompError = (frame) => {
      console.error('STOMP Broker error:', frame.headers['message']);
    };

    client.activate();

    return () => {
      client.deactivate();
      stompClientRef.current = null;
      console.log('STOMP Deactivated');
    };
  }, []); // Only connect once

  // Handle dynamic channel subscription changes
  useEffect(() => {
    const client = stompClientRef.current;
    if (client && client.connected && channelId) {
      (client as any)._subscribeChannel(channelId);
    }
  }, [channelId]);

  // Handle dynamic server subscription changes
  useEffect(() => {
    const client = stompClientRef.current;
    if (client && client.connected && serverId) {
      (client as any)._subscribeServer(serverId);
    }
  }, [serverId]);

  const sendMessage = useCallback((content: string) => {
    const client = stompClientRef.current;
    if (client && client.connected && channelId) {
      client.publish({
        destination: `/app/channels/${channelId}/send`,
        body: JSON.stringify({ content }),
      });
      return true;
    }
    return false;
  }, [channelId]);

  return { sendMessage };
};
