package com.iuh.payment.config;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import java.util.ArrayList;
import java.util.List;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

@Validated
@ConfigurationProperties(prefix = "app")
public class AppProperties {

    private final Cors cors = new Cors();
    private final RabbitMq rabbitmq = new RabbitMq();
    private final WebSocket websocket = new WebSocket();

    public Cors getCors() {
        return cors;
    }

    public RabbitMq getRabbitmq() {
        return rabbitmq;
    }

    public WebSocket getWebsocket() {
        return websocket;
    }

    public static class Cors {

        @NotEmpty
        private List<String> allowedOrigins = new ArrayList<>();

        public List<String> getAllowedOrigins() {
            return allowedOrigins;
        }

        public void setAllowedOrigins(List<String> allowedOrigins) {
            this.allowedOrigins = allowedOrigins;
        }
    }

    public static class RabbitMq {

        @NotBlank
        private String exchange;

        @NotBlank
        private String bookingCreatedQueue;

        @NotBlank
        private String paymentCompletedQueue;

        @NotBlank
        private String bookingFailedQueue;

        @NotBlank
        private String bookingCreatedRoutingKey;

        @NotBlank
        private String paymentCompletedRoutingKey;

        @NotBlank
        private String bookingFailedRoutingKey;

        @NotBlank
        private String userRegisteredQueue;

        @NotBlank
        private String userRegisteredRoutingKey;

        @NotBlank
        private String notificationDispatchedQueue;

        @NotBlank
        private String notificationDispatchedRoutingKey;

        public String getExchange() {
            return exchange;
        }

        public void setExchange(String exchange) {
            this.exchange = exchange;
        }

        public String getBookingCreatedQueue() {
            return bookingCreatedQueue;
        }

        public void setBookingCreatedQueue(String bookingCreatedQueue) {
            this.bookingCreatedQueue = bookingCreatedQueue;
        }

        public String getPaymentCompletedQueue() {
            return paymentCompletedQueue;
        }

        public void setPaymentCompletedQueue(String paymentCompletedQueue) {
            this.paymentCompletedQueue = paymentCompletedQueue;
        }

        public String getBookingFailedQueue() {
            return bookingFailedQueue;
        }

        public void setBookingFailedQueue(String bookingFailedQueue) {
            this.bookingFailedQueue = bookingFailedQueue;
        }

        public String getBookingCreatedRoutingKey() {
            return bookingCreatedRoutingKey;
        }

        public void setBookingCreatedRoutingKey(String bookingCreatedRoutingKey) {
            this.bookingCreatedRoutingKey = bookingCreatedRoutingKey;
        }

        public String getPaymentCompletedRoutingKey() {
            return paymentCompletedRoutingKey;
        }

        public void setPaymentCompletedRoutingKey(String paymentCompletedRoutingKey) {
            this.paymentCompletedRoutingKey = paymentCompletedRoutingKey;
        }

        public String getBookingFailedRoutingKey() {
            return bookingFailedRoutingKey;
        }

        public void setBookingFailedRoutingKey(String bookingFailedRoutingKey) {
            this.bookingFailedRoutingKey = bookingFailedRoutingKey;
        }

        public String getUserRegisteredQueue() {
            return userRegisteredQueue;
        }

        public void setUserRegisteredQueue(String userRegisteredQueue) {
            this.userRegisteredQueue = userRegisteredQueue;
        }

        public String getUserRegisteredRoutingKey() {
            return userRegisteredRoutingKey;
        }

        public void setUserRegisteredRoutingKey(String userRegisteredRoutingKey) {
            this.userRegisteredRoutingKey = userRegisteredRoutingKey;
        }

        public String getNotificationDispatchedQueue() {
            return notificationDispatchedQueue;
        }

        public void setNotificationDispatchedQueue(String notificationDispatchedQueue) {
            this.notificationDispatchedQueue = notificationDispatchedQueue;
        }

        public String getNotificationDispatchedRoutingKey() {
            return notificationDispatchedRoutingKey;
        }

        public void setNotificationDispatchedRoutingKey(String notificationDispatchedRoutingKey) {
            this.notificationDispatchedRoutingKey = notificationDispatchedRoutingKey;
        }
    }

    public static class WebSocket {

        @NotBlank
        private String notificationTopic;

        public String getNotificationTopic() {
            return notificationTopic;
        }

        public void setNotificationTopic(String notificationTopic) {
            this.notificationTopic = notificationTopic;
        }
    }
}
