const normalizeBaseUrl = (rawUrl: string): string => rawUrl.trim().replace(/\/+$/g, "");

const useDevProxy =
    import.meta.env.DEV &&
    (import.meta.env.VITE_USE_DEV_PROXY ?? "true").toLowerCase() === "true";

const gatewayUrl = useDevProxy
    ? ""
    : normalizeBaseUrl(
        import.meta.env.VITE_GATEWAY_URL ?? "http://192.168.1.29:8085",
    );

const notificationUrl = useDevProxy
    ? ""
    : normalizeBaseUrl(
        import.meta.env.VITE_GATEWAY_URL ?? "http://192.168.1.155:8084",
    );

const movieServiceUrl = useDevProxy
    ? ""
    : normalizeBaseUrl(
        import.meta.env.VITE_GATEWAY_URL ?? "http://192.168.1.179:8082",
    );

const bookingServiceUrl = normalizeBaseUrl(
    import.meta.env.VITE_GATEWAY_URL ?? "",
);

export const appConfig = {
    useDevProxy,
    gatewayUrl,
    notificationUrl,
    movieServiceUrl,
    bookingServiceUrl,
    wsEndpoint: useDevProxy ? "/ws" : `${notificationUrl}/ws`,
    notificationTopic: import.meta.env.VITE_NOTIFICATION_TOPIC ?? "/topic/notifications",
};
