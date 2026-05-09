import { useEffect, useRef, useCallback } from 'react';
import { Client, IMessage, StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { MessageResponse } from '../features/message/types';
import { MemberStatusResponse } from '../features/server/types';

interface UseWebSocketOptions {
  channelId: string | null;
  serverId: string | null;
  onMessageReceived?: (message: MessageResponse) => void;
  onMemberStatusChanged?: (member: MemberStatusResponse) => void;
}

type ExtendedStompClient = Client & {
  _subscribeChannel?: (id: string) => void;
  _subscribeServer?: (id: string) => void;
};

export const useWebSocket = ({ channelId, serverId, onMessageReceived, onMemberStatusChanged }: UseWebSocketOptions) => {
  const stompClientRef = useRef<Client | null>(null);

  const onMessageReceivedRef = useRef(onMessageReceived);
  const onMemberStatusChangedRef = useRef(onMemberStatusChanged);
  const channelIdRef = useRef(channelId);
  const serverIdRef = useRef(serverId);

  const subscriptionsRef = useRef<{ channel: StompSubscription | null; server: StompSubscription | null }>({
    channel: null,
    server: null,
  });

  useEffect(() => {
    onMessageReceivedRef.current = onMessageReceived;
  }, [onMessageReceived]);

  useEffect(() => {
    onMemberStatusChangedRef.current = onMemberStatusChanged;
  }, [onMemberStatusChanged]);

  useEffect(() => {
    channelIdRef.current = channelId;
  }, [channelId]);

  useEffect(() => {
    serverIdRef.current = serverId;
  }, [serverId]);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    const client = new Client({
      webSocketFactory: () => new SockJS(`${import.meta.env.VITE_API_URL}/ws?token=${token}`),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });
    stompClientRef.current = client;

    client.onConnect = () => {

      // Initial subscriptions if IDs already present
      if (channelIdRef.current) subscribeChannel(channelIdRef.current);
      if (serverIdRef.current) subscribeServer(serverIdRef.current);
    };

    const subscribeChannel = (id: string) => {
      if (subscriptionsRef.current.channel) {
        subscriptionsRef.current.channel.unsubscribe();
      }
      subscriptionsRef.current.channel = client.subscribe(`/topic/channels/${id}`, (message: IMessage) => {
        const receivedMessage = JSON.parse(message.body) as MessageResponse;
        onMessageReceivedRef.current?.(receivedMessage);
      });
    };

    const subscribeServer = (id: string) => {
      if (subscriptionsRef.current.server) {
        subscriptionsRef.current.server.unsubscribe();
      }
      subscriptionsRef.current.server = client.subscribe(`/topic/servers/${id}/members`, (message: IMessage) => {
        const memberUpdate = JSON.parse(message.body) as MemberStatusResponse;
        onMemberStatusChangedRef.current?.(memberUpdate);
      });
    };

    // Expose subscribe methods to be used when props change
    const extendedClient = client as ExtendedStompClient;
    extendedClient._subscribeChannel = subscribeChannel;
    extendedClient._subscribeServer = subscribeServer;

    client.onStompError = (frame) => {
      console.error('STOMP Broker error:', frame.headers['message']);
    };

    client.activate();

    return () => {
      subscriptionsRef.current.channel?.unsubscribe();
      subscriptionsRef.current.server?.unsubscribe();
      client.deactivate();
      stompClientRef.current = null;
    };
  }, []);

  // Handle dynamic channel subscription changes
  useEffect(() => {
    const client = stompClientRef.current;
    if (client && client.connected && channelId) {
      (client as ExtendedStompClient)._subscribeChannel?.(channelId);
    }
  }, [channelId]);

  // Handle dynamic server subscription changes
  useEffect(() => {
    const client = stompClientRef.current;
    if (client && client.connected && serverId) {
      (client as ExtendedStompClient)._subscribeServer?.(serverId);
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
    console.warn("Failed to send message", { client: !!client, connected: client?.connected, channelId });
    return false;
  }, [channelId]);

  return { sendMessage };
};
