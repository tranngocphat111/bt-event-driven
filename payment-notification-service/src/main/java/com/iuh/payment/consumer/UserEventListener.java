package com.iuh.payment.consumer;

import com.iuh.payment.dto.event.UserRegisteredEvent;
import com.iuh.payment.service.NotificationService;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
public class UserEventListener {

    private final NotificationService notificationService;

    public UserEventListener(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @RabbitListener(queues = "${app.rabbitmq.user-registered-queue}")
    public void onUserRegistered(UserRegisteredEvent event) {
        notificationService.handleUserRegistered(event);
    }
}
