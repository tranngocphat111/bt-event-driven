package com.iuh.payment.service;

import com.iuh.payment.config.AppProperties;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
public class SocketNotificationService {

    private final SimpMessagingTemplate messagingTemplate;
    private final AppProperties appProperties;

    public SocketNotificationService(SimpMessagingTemplate messagingTemplate,
                                     AppProperties appProperties) {
        this.messagingTemplate = messagingTemplate;
        this.appProperties = appProperties;
    }

    public void push(String eventType, String message, Long userId) {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("eventType", eventType);
        payload.put("message", message);
        payload.put("userId", userId);
        payload.put("sentAt", Instant.now());

        messagingTemplate.convertAndSend(appProperties.getWebsocket().getNotificationTopic(), payload);
    }
}