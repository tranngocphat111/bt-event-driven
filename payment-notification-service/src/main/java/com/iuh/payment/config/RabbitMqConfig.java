package com.iuh.payment.config;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMqConfig {

    @Bean
    public TopicExchange bookingExchange(AppProperties appProperties) {
        return new TopicExchange(appProperties.getRabbitmq().getExchange(), true, false);
    }

    @Bean
    public Queue bookingCreatedQueue(AppProperties appProperties) {
        return new Queue(appProperties.getRabbitmq().getBookingCreatedQueue(), true);
    }

    @Bean
    public Queue paymentCompletedQueue(AppProperties appProperties) {
        return new Queue(appProperties.getRabbitmq().getPaymentCompletedQueue(), true);
    }

    @Bean
    public Queue bookingFailedQueue(AppProperties appProperties) {
        return new Queue(appProperties.getRabbitmq().getBookingFailedQueue(), true);
    }

    @Bean
    public Queue userRegisteredQueue(AppProperties appProperties) {
        return new Queue(appProperties.getRabbitmq().getUserRegisteredQueue(), true);
    }

    @Bean
    public Queue notificationDispatchedQueue(AppProperties appProperties) {
        return new Queue(appProperties.getRabbitmq().getNotificationDispatchedQueue(), true);
    }

    @Bean
    public Binding bookingCreatedBinding(
            Queue bookingCreatedQueue,
            TopicExchange bookingExchange,
            AppProperties appProperties) {
        return BindingBuilder.bind(bookingCreatedQueue)
                .to(bookingExchange)
                .with(appProperties.getRabbitmq().getBookingCreatedRoutingKey());
    }

    @Bean
    public Binding paymentCompletedBinding(
            Queue paymentCompletedQueue,
            TopicExchange bookingExchange,
            AppProperties appProperties) {
        return BindingBuilder.bind(paymentCompletedQueue)
                .to(bookingExchange)
                .with(appProperties.getRabbitmq().getPaymentCompletedRoutingKey());
    }

    @Bean
    public Binding bookingFailedBinding(
            Queue bookingFailedQueue,
            TopicExchange bookingExchange,
            AppProperties appProperties) {
        return BindingBuilder.bind(bookingFailedQueue)
                .to(bookingExchange)
                .with(appProperties.getRabbitmq().getBookingFailedRoutingKey());
    }

    @Bean
    public Binding userRegisteredBinding(
            Queue userRegisteredQueue,
            TopicExchange bookingExchange,
            AppProperties appProperties) {
        return BindingBuilder.bind(userRegisteredQueue)
                .to(bookingExchange)
                .with(appProperties.getRabbitmq().getUserRegisteredRoutingKey());
    }

    @Bean
    public Binding notificationDispatchedBinding(
            Queue notificationDispatchedQueue,
            TopicExchange bookingExchange,
            AppProperties appProperties) {
        return BindingBuilder.bind(notificationDispatchedQueue)
                .to(bookingExchange)
                .with(appProperties.getRabbitmq().getNotificationDispatchedRoutingKey());
    }

    @Bean
    public Jackson2JsonMessageConverter jackson2JsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    @Bean
    public RabbitTemplate rabbitTemplate(
            ConnectionFactory connectionFactory,
            Jackson2JsonMessageConverter converter) {
        RabbitTemplate rabbitTemplate = new RabbitTemplate(connectionFactory);
        rabbitTemplate.setMessageConverter(converter);
        return rabbitTemplate;
    }
}