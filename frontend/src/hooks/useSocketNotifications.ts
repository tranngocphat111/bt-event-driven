import { Client, type IMessage } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { useEffect, useRef, useState } from "react";
import type { NotificationItem, SocketState } from "../types/domain";

type UseSocketNotificationsArgs = {
    wsEndpoint: string;
    topic: string;
};

export const useSocketNotifications = ({
    wsEndpoint,
    topic,
}: UseSocketNotificationsArgs) => {
    const socketClientRef = useRef<Client | null>(null);
    const [socketState, setSocketState] = useState<SocketState>("disconnected");
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);

    useEffect(() => {
        return () => {
            if (socketClientRef.current) {
                void socketClientRef.current.deactivate();
            }
        };
    }, []);

    const connect = () => {
        if (socketClientRef.current) {
            void socketClientRef.current.deactivate();
            socketClientRef.current = null;
        }

        setSocketState("connecting");

        const client = new Client({
            webSocketFactory: () => new SockJS(wsEndpoint),
            reconnectDelay: 5000,
            debug: () => undefined,
            onConnect: () => {
                setSocketState("connected");

                client.subscribe(topic, (message: IMessage) => {
                    let parsedPayload: unknown = message.body;
                    try {
                        parsedPayload = JSON.parse(message.body);
                    } catch {
                        parsedPayload = message.body;
                    }

                    const nextItem: NotificationItem = {
                        id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
                        receivedAt: new Date().toLocaleTimeString(),
                        payload: parsedPayload,
                    };

                    setNotifications((prev) => [nextItem, ...prev].slice(0, 100));
                });
            },
            onStompError: () => {
                setSocketState("error");
            },
            onWebSocketError: () => {
                setSocketState("error");
            },
            onWebSocketClose: () => {
                setSocketState("disconnected");
            },
        });

        socketClientRef.current = client;
        client.activate();
    };

    const disconnect = () => {
        if (socketClientRef.current) {
            void socketClientRef.current.deactivate();
            socketClientRef.current = null;
        }
        setSocketState("disconnected");
    };

    const clearNotifications = () => {
        setNotifications([]);
    };

    return {
        socketState,
        notifications,
        connect,
        disconnect,
        clearNotifications,
    };
};
