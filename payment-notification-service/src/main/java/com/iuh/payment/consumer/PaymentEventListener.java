package com.iuh.payment.consumer;

import com.iuh.payment.dto.event.BookingCreatedEvent;
import com.iuh.payment.service.PaymentService;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
public class PaymentEventListener {

    private final PaymentService paymentService;

    public PaymentEventListener(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @RabbitListener(queues = "${app.rabbitmq.booking-created-queue}")
    public void onBookingCreated(BookingCreatedEvent event) {
        paymentService.processBookingCreated(event);
    }
}