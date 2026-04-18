# Movie Event Frontend (React + TypeScript)

Frontend dashboard doc du lieu tu cac backend va nhan thong bao realtime qua WebSocket.

## 1) Chuc nang

- Doc danh sach Users qua API Gateway
- Doc danh sach Movies qua API Gateway
- Doc danh sach Bookings qua API Gateway (co filter userId/status)
- Kiem tra Payment Health endpoint
- Ket noi WebSocket STOMP + SockJS va subscribe topic notification
- Giao dien tach page: Login, Trang chu, Trang chi tiet

## 2) Cau hinh moi truong

Tao file `.env` tu `.env.example`:

```bash
VITE_GATEWAY_URL=http://192.168.1.29:8085
VITE_NOTIFICATION_URL=http://192.168.1.155:8084
VITE_NOTIFICATION_TOPIC=/topic/notifications
```

## 3) Chay frontend

```bash
npm install
npm run dev
```

Mac dinh frontend chay tai:

```bash
http://localhost/
```

Luu y:

- Frontend da duoc cau hinh chay cong `80` theo IP tren.
- Neu cong 80 bi chiem, can dung service dang chiem cong hoac chay terminal voi quyen Administrator.

## 4) Build production

```bash
npm run build
```

## 5) Luu y ket noi backend

- API Gateway: `http://192.168.1.29:8085`
- Payment Notification Service: `http://192.168.1.155:8084`
- WebSocket endpoint: `http://192.168.1.155:8084/ws`
- Topic: `/topic/notifications`
