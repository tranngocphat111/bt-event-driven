package com.iuh.payment.consumer;

import com.iuh.payment.dto.event.BookingFailedEvent;
import com.iuh.payment.dto.event.PaymentCompletedEvent;
import com.iuh.payment.service.NotificationService;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
public class NotificationEventListener {

    private final NotificationService notificationService;

    public NotificationEventListener(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @RabbitListener(queues = "${app.rabbitmq.payment-completed-queue}")
    public void onPaymentCompleted(PaymentCompletedEvent event) {
        notificationService.handlePaymentCompleted(event);
    }

    @RabbitListener(queues = "${app.rabbitmq.booking-failed-queue}")
    public void onBookingFailed(BookingFailedEvent event) {
        notificationService.handleBookingFailed(event);
    }
}