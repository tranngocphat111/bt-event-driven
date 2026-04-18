package com.iuh.payment.service;

import com.iuh.payment.config.AppProperties;
import com.iuh.payment.domain.PaymentMethod;
import com.iuh.payment.domain.PaymentRecord;
import com.iuh.payment.domain.PaymentStatus;
import com.iuh.payment.dto.event.BookingCreatedEvent;
import com.iuh.payment.dto.event.BookingFailedEvent;
import com.iuh.payment.dto.event.PaymentCompletedEvent;
import com.iuh.payment.repository.PaymentRepository;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Locale;
import java.util.concurrent.ThreadLocalRandom;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
public class PaymentService {

    private static final Logger LOGGER = LoggerFactory.getLogger(PaymentService.class);

    private final PaymentRepository paymentRepository;
    private final RabbitTemplate rabbitTemplate;
    private final AppProperties appProperties;

    public PaymentService(PaymentRepository paymentRepository,
                          RabbitTemplate rabbitTemplate,
                          AppProperties appProperties) {
        this.paymentRepository = paymentRepository;
        this.rabbitTemplate = rabbitTemplate;
        this.appProperties = appProperties;
    }

    public void processBookingCreated(BookingCreatedEvent event) {
        if (event == null || event.getBookingId() == null || event.getUserId() == null) {
            LOGGER.warn("Skip BOOKING_CREATED because payload is invalid: {}", event);
            return;
        }

        boolean success = ThreadLocalRandom.current().nextBoolean();
        PaymentRecord paymentRecord = buildPaymentRecord(event, success);
        PaymentRecord savedPayment = paymentRepository.save(paymentRecord);

        if (success) {
            publishPaymentCompleted(event, savedPayment);
            return;
        }

        publishBookingFailed(event);
    }

    private PaymentRecord buildPaymentRecord(BookingCreatedEvent event, boolean success) {
        PaymentRecord paymentRecord = new PaymentRecord();
        paymentRecord.setPaymentCode(generatePaymentCode(event.getBookingId()));
        paymentRecord.setBookingId(event.getBookingId());
        paymentRecord.setUserId(event.getUserId());
        paymentRecord.setAmount(defaultAmount(event.getAmount()));
        paymentRecord.setPaymentMethod(resolvePaymentMethod(event.getPaymentMethod()));
        paymentRecord.setStatus(success ? PaymentStatus.SUCCESS : PaymentStatus.FAILED);
        paymentRecord.setTransactionRef(success
                ? generateTransactionRef(resolvePaymentMethod(event.getPaymentMethod()).name(), event.getBookingId())
                : null);
        paymentRecord.setFailureReason(success ? null : "Random payment failure");
        paymentRecord.setPaidAt(success ? Instant.now() : null);
        return paymentRecord;
    }

    private void publishPaymentCompleted(BookingCreatedEvent bookingCreatedEvent, PaymentRecord paymentRecord) {
        PaymentCompletedEvent paymentCompletedEvent = new PaymentCompletedEvent();
        paymentCompletedEvent.setEventType("PAYMENT_COMPLETED");
        paymentCompletedEvent.setPaymentId(paymentRecord.getId());
        paymentCompletedEvent.setPaymentCode(paymentRecord.getPaymentCode());
        paymentCompletedEvent.setBookingId(bookingCreatedEvent.getBookingId());
        paymentCompletedEvent.setBookingCode(bookingCreatedEvent.getBookingCode());
        paymentCompletedEvent.setUserId(bookingCreatedEvent.getUserId());
        paymentCompletedEvent.setUserName(bookingCreatedEvent.getUserName());
        paymentCompletedEvent.setAmount(paymentRecord.getAmount());
        paymentCompletedEvent.setPaymentMethod(paymentRecord.getPaymentMethod().name());
        paymentCompletedEvent.setPaidAt(paymentRecord.getPaidAt());

        rabbitTemplate.convertAndSend(
                appProperties.getRabbitmq().getExchange(),
                appProperties.getRabbitmq().getPaymentCompletedRoutingKey(),
                paymentCompletedEvent
        );

        LOGGER.info("Published PAYMENT_COMPLETED for bookingId={}", bookingCreatedEvent.getBookingId());
    }

    private void publishBookingFailed(BookingCreatedEvent bookingCreatedEvent) {
        BookingFailedEvent bookingFailedEvent = new BookingFailedEvent();
        bookingFailedEvent.setEventType("BOOKING_FAILED");
        bookingFailedEvent.setBookingId(bookingCreatedEvent.getBookingId());
        bookingFailedEvent.setBookingCode(bookingCreatedEvent.getBookingCode());
        bookingFailedEvent.setUserId(bookingCreatedEvent.getUserId());
        bookingFailedEvent.setReason("Payment failed randomly by payment service");

        rabbitTemplate.convertAndSend(
                appProperties.getRabbitmq().getExchange(),
                appProperties.getRabbitmq().getBookingFailedRoutingKey(),
                bookingFailedEvent
        );

        LOGGER.info("Published BOOKING_FAILED for bookingId={}", bookingCreatedEvent.getBookingId());
    }

    private BigDecimal defaultAmount(BigDecimal amount) {
        return amount == null ? BigDecimal.ZERO : amount;
    }

    private PaymentMethod resolvePaymentMethod(String method) {
        if (!StringUtils.hasText(method)) {
            return PaymentMethod.MOMO;
        }
        try {
            return PaymentMethod.valueOf(method.trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException ex) {
            return PaymentMethod.MOMO;
        }
    }

    private String generatePaymentCode(Long bookingId) {
        String ts = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        return "PAY-" + ts + "-" + bookingId;
    }

    private String generateTransactionRef(String method, Long bookingId) {
        String ts = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        return method + "-" + bookingId + "-" + ts;
    }
}
