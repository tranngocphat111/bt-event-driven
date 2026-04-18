package com.iuh.payment.service;

import com.iuh.payment.config.AppProperties;
import com.iuh.payment.domain.Notification;
import com.iuh.payment.dto.event.BookingFailedEvent;
import com.iuh.payment.dto.event.NotificationDispatchedEvent;
import com.iuh.payment.dto.event.PaymentCompletedEvent;
import com.iuh.payment.dto.event.UserRegisteredEvent;
import com.iuh.payment.repository.NotificationRepository;
import java.time.Instant;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

@Service
public class NotificationService {

    private static final Logger LOGGER = LoggerFactory.getLogger(NotificationService.class);

    private final NotificationRepository notificationRepository;
    private final RabbitTemplate rabbitTemplate;
    private final AppProperties appProperties;
    private final SocketNotificationService socketNotificationService;

    public NotificationService(NotificationRepository notificationRepository,
                               RabbitTemplate rabbitTemplate,
                               AppProperties appProperties,
                               SocketNotificationService socketNotificationService) {
        this.notificationRepository = notificationRepository;
        this.rabbitTemplate = rabbitTemplate;
        this.appProperties = appProperties;
        this.socketNotificationService = socketNotificationService;
    }

    public void handlePaymentCompleted(PaymentCompletedEvent event) {
        if (event == null || event.getBookingId() == null || event.getUserId() == null) {
            LOGGER.warn("Skip PAYMENT_COMPLETED because payload is invalid: {}", event);
            return;
        }

        String bookingSuccessMessage = "Booking #" + event.getBookingId() + " thanh cong!";
        LOGGER.info(bookingSuccessMessage);

        Notification notification = new Notification();
        notification.setUserId(event.getUserId());
        notification.setBookingId(event.getBookingId());
        notification.setType("BOOKING_SUCCESS");
        notification.setTitle("Dat ve thanh cong");
        notification.setMessage(bookingSuccessMessage);
        notification.setIsRead(Boolean.FALSE);
        notification.setSentAt(Instant.now());
        notificationRepository.save(notification);

        String userLabel = event.getUserName() != null && !event.getUserName().isBlank()
                ? event.getUserName()
                : "User " + event.getUserId();
        LOGGER.info("{} da dat don #{} thanh cong", userLabel, event.getBookingId());

        publishNotificationDispatched(
                event.getUserId(),
                "PAYMENT_COMPLETED",
                notification.getTitle(),
                notification.getMessage(),
                notification.getSentAt()
        );
        socketNotificationService.push("PAYMENT_COMPLETED", bookingSuccessMessage, event.getUserId());
    }

    public void handleBookingFailed(BookingFailedEvent event) {
        if (event == null || event.getBookingId() == null || event.getUserId() == null) {
            LOGGER.warn("Skip BOOKING_FAILED because payload is invalid: {}", event);
            return;
        }

        String reason = event.getReason() == null || event.getReason().isBlank()
                ? "Payment failed"
                : event.getReason();
        String message = "Booking #" + event.getBookingId() + " that bai: " + reason;
        LOGGER.info(message);

        Notification notification = new Notification();
        notification.setUserId(event.getUserId());
        notification.setBookingId(event.getBookingId());
        notification.setType("BOOKING_FAILED");
        notification.setTitle("Dat ve that bai");
        notification.setMessage(message);
        notification.setIsRead(Boolean.FALSE);
        notification.setSentAt(Instant.now());
        notificationRepository.save(notification);

        publishNotificationDispatched(
                event.getUserId(),
                "BOOKING_FAILED",
                notification.getTitle(),
                notification.getMessage(),
                notification.getSentAt()
        );
        socketNotificationService.push("BOOKING_FAILED", message, event.getUserId());
    }

    public void handleUserRegistered(UserRegisteredEvent event) {
        if (event == null || event.getUserId() == null) {
            LOGGER.warn("Skip USER_REGISTERED because payload is invalid: {}", event);
            return;
        }

        String displayName = (event.getFullName() == null || event.getFullName().isBlank())
                ? event.getUsername()
                : event.getFullName();
        if (displayName == null || displayName.isBlank()) {
            displayName = "User " + event.getUserId();
        }

        String message = "Chao " + displayName + ", dang ky thanh cong!";

        Notification notification = new Notification();
        notification.setUserId(event.getUserId());
        notification.setBookingId(null);
        notification.setType("GENERAL");
        notification.setTitle("Dang ky thanh cong");
        notification.setMessage(message);
        notification.setIsRead(Boolean.FALSE);
        notification.setSentAt(Instant.now());
        notificationRepository.save(notification);

        publishNotificationDispatched(
                event.getUserId(),
                "USER_REGISTERED",
                notification.getTitle(),
                notification.getMessage(),
                notification.getSentAt()
        );
        socketNotificationService.push("USER_REGISTERED", message, event.getUserId());
    }

    private void publishNotificationDispatched(Long userId,
                                               String sourceEventType,
                                               String title,
                                               String message,
                                               Instant sentAt) {
        NotificationDispatchedEvent dispatchedEvent = new NotificationDispatchedEvent();
        dispatchedEvent.setEventType("NOTIFICATION_DISPATCHED");
        dispatchedEvent.setUserId(userId);
        dispatchedEvent.setSourceEventType(sourceEventType);
        dispatchedEvent.setTitle(title);
        dispatchedEvent.setMessage(message);
        dispatchedEvent.setSentAt(sentAt);

        rabbitTemplate.convertAndSend(
                appProperties.getRabbitmq().getExchange(),
                appProperties.getRabbitmq().getNotificationDispatchedRoutingKey(),
                dispatchedEvent
        );
    }
}
