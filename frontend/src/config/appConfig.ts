const normalizeBaseUrl = (rawUrl: string): string => rawUrl.trim().replace(/\/+$/g, "");

const gatewayUrl = normalizeBaseUrl(
    import.meta.env.VITE_GATEWAY_URL ?? "http://localhost:3000",
);

const wsEndpoint = normalizeBaseUrl(
    import.meta.env.VITE_WS_ENDPOINT ?? `${gatewayUrl}/ws`,
);

export const appConfig = {
    gatewayUrl,
    wsEndpoint,
    notificationTopic: import.meta.env.VITE_NOTIFICATION_TOPIC ?? "/topic/notifications",
};
