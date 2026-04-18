# Payment + Notification Service (Nguoi 5)

Service nay duoc trien khai lai theo kieu event-driven cho bai toan movie ticket.

## Luong event

1. Listen `BOOKING_CREATED`
2. Payment xu ly ngau nhien success/fail
3. Publish:
   - `PAYMENT_COMPLETED` neu thanh cong
   - `BOOKING_FAILED` neu that bai
4. Notification listen `PAYMENT_COMPLETED`
5. Output:
   - `Booking #123 thanh cong!`
  - `User A da dat don #123 thanh cong` (log)
  - Push realtime cho FE qua WebSocket topic `/topic/notifications`

## Cong nghe

- Java 17
- Spring Boot 3
- Spring AMQP (RabbitMQ)
- Spring WebSocket (STOMP + SockJS)
- Spring Data JPA + MariaDB

## Cau hinh chinh

File `src/main/resources/application.properties`:

- `spring.rabbitmq.*`: ket noi RabbitMQ
- `app.rabbitmq.exchange`: exchange event
- `app.rabbitmq.booking-created-queue`: queue cho `BOOKING_CREATED`
- `app.rabbitmq.payment-completed-queue`: queue cho `PAYMENT_COMPLETED`
- `app.rabbitmq.booking-failed-queue`: queue cho `BOOKING_FAILED`
- `app.websocket.notification-topic`: topic socket gui thong bao cho FE

WebSocket endpoint cho FE ket noi: `/ws`

## Chay service

```bash
mvn spring-boot:run
```

Hoac:

```bash
mvn clean package -DskipTests
java -jar target/payment-notification-service-1.0.0.jar
```

## Payload goi y

### BOOKING_CREATED

```json
{
  "eventType": "BOOKING_CREATED",
  "bookingId": 123,
  "bookingCode": "BK-20260418-00123",
  "userId": 10,
  "userName": "User A",
  "amount": 170000,
  "paymentMethod": "MOMO"
}
```

### PAYMENT_COMPLETED (publish)

```json
{
  "eventType": "PAYMENT_COMPLETED",
  "paymentId": 1001,
  "paymentCode": "PAY-20260418133000-123",
  "bookingId": 123,
  "bookingCode": "BK-20260418-00123",
  "userId": 10,
  "userName": "User A",
  "amount": 170000,
  "paymentMethod": "MOMO",
  "paidAt": "2026-04-18T06:30:00Z"
}
```

### BOOKING_FAILED (publish)

```json
{
  "eventType": "BOOKING_FAILED",
  "bookingId": 123,
  "bookingCode": "BK-20260418-00123",
  "userId": 10,
  "reason": "Payment failed randomly by payment service"
}
```

