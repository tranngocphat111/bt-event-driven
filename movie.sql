-- ============================================================
--  MOVIE TICKET SYSTEM - DATABASE SCHEMA + SAMPLE DATA
--  Dành cho: Event-Driven Architecture Assignment
--  Compatible: MySQL 8.0+ / MariaDB 10.6+
--  Import: HeidiSQL -> File -> Run SQL File
-- ============================================================

SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = 'NO_AUTO_VALUE_ON_ZERO';

-- ============================================================
-- DATABASE
-- ============================================================
DROP DATABASE IF EXISTS movie_ticket_db;
CREATE DATABASE movie_ticket_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE movie_ticket_db;

-- ============================================================
-- TABLE: users
-- Dùng bởi: User Service (port 8081)
-- ============================================================
CREATE TABLE users (
    id          BIGINT        NOT NULL AUTO_INCREMENT,
    username    VARCHAR(50)   NOT NULL,
    email       VARCHAR(100)  NOT NULL,
    password    VARCHAR(255)  NOT NULL,   -- BCrypt hash
    full_name   VARCHAR(100)  NOT NULL,
    phone       VARCHAR(15)   DEFAULT NULL,
    role        ENUM('USER','ADMIN') NOT NULL DEFAULT 'USER',
    is_active   TINYINT(1)    NOT NULL DEFAULT 1,
    created_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_users_username (username),
    UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- TABLE: movies
-- Dùng bởi: Movie Service (port 8082)
-- ============================================================
CREATE TABLE movies (
    id           BIGINT        NOT NULL AUTO_INCREMENT,
    title        VARCHAR(200)  NOT NULL,
    description  TEXT,
    genre        VARCHAR(100)  NOT NULL,
    duration     INT           NOT NULL COMMENT 'minutes',
    director     VARCHAR(100)  DEFAULT NULL,
    cast_members TEXT          DEFAULT NULL,
    language     VARCHAR(50)   DEFAULT 'Tiếng Việt',
    rating       DECIMAL(3,1)  DEFAULT NULL COMMENT '0.0 - 10.0',
    poster_url   VARCHAR(500)  DEFAULT NULL,
    release_date DATE          DEFAULT NULL,
    status       ENUM('COMING_SOON','NOW_SHOWING','ENDED') NOT NULL DEFAULT 'NOW_SHOWING',
    created_at   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_movies_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- TABLE: cinemas (rạp chiếu)
-- ============================================================
CREATE TABLE cinemas (
    id         BIGINT       NOT NULL AUTO_INCREMENT,
    name       VARCHAR(100) NOT NULL,
    address    VARCHAR(255) NOT NULL,
    city       VARCHAR(100) NOT NULL DEFAULT 'Hồ Chí Minh',
    is_active  TINYINT(1)   NOT NULL DEFAULT 1,
    created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- TABLE: halls (phòng chiếu)
-- ============================================================
CREATE TABLE halls (
    id          BIGINT      NOT NULL AUTO_INCREMENT,
    cinema_id   BIGINT      NOT NULL,
    name        VARCHAR(50) NOT NULL,
    total_seats INT         NOT NULL DEFAULT 100,
    is_active   TINYINT(1)  NOT NULL DEFAULT 1,
    created_at  DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_halls_cinema FOREIGN KEY (cinema_id) REFERENCES cinemas (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- TABLE: showtimes (suất chiếu)
-- ============================================================
CREATE TABLE showtimes (
    id             BIGINT         NOT NULL AUTO_INCREMENT,
    movie_id       BIGINT         NOT NULL,
    hall_id        BIGINT         NOT NULL,
    show_date      DATE           NOT NULL,
    start_time     TIME           NOT NULL,
    end_time       TIME           NOT NULL,
    price          DECIMAL(10,0)  NOT NULL DEFAULT 85000 COMMENT 'VND',
    available_seats INT           NOT NULL,
    status         ENUM('ACTIVE','CANCELLED','COMPLETED') NOT NULL DEFAULT 'ACTIVE',
    created_at     DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_showtimes_movie FOREIGN KEY (movie_id) REFERENCES movies (id),
    CONSTRAINT fk_showtimes_hall  FOREIGN KEY (hall_id)  REFERENCES halls (id),
    INDEX idx_showtimes_movie (movie_id),
    INDEX idx_showtimes_date  (show_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- TABLE: seats (ghế ngồi)
-- ============================================================
CREATE TABLE seats (
    id          BIGINT      NOT NULL AUTO_INCREMENT,
    hall_id     BIGINT      NOT NULL,
    row_label   CHAR(2)     NOT NULL COMMENT 'A, B, C, ...',
    seat_number INT         NOT NULL,
    seat_type   ENUM('STANDARD','VIP','COUPLE') NOT NULL DEFAULT 'STANDARD',
    is_active   TINYINT(1)  NOT NULL DEFAULT 1,
    PRIMARY KEY (id),
    CONSTRAINT fk_seats_hall FOREIGN KEY (hall_id) REFERENCES halls (id),
    UNIQUE KEY uq_seat_position (hall_id, row_label, seat_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- TABLE: bookings
-- Dùng bởi: Booking Service (port 8083) — CORE SERVICE
-- ============================================================
CREATE TABLE bookings (
    id              BIGINT        NOT NULL AUTO_INCREMENT,
    booking_code    VARCHAR(20)   NOT NULL COMMENT 'BK-YYYYMMDD-XXXXX',
    user_id         BIGINT        NOT NULL,
    showtime_id     BIGINT        NOT NULL,
    total_seats     INT           NOT NULL DEFAULT 1,
    total_amount    DECIMAL(12,0) NOT NULL,
    status          ENUM('PENDING','CONFIRMED','FAILED','CANCELLED') NOT NULL DEFAULT 'PENDING',
    notes           VARCHAR(255)  DEFAULT NULL,
    created_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_bookings_code (booking_code),
    CONSTRAINT fk_bookings_user     FOREIGN KEY (user_id)     REFERENCES users (id),
    CONSTRAINT fk_bookings_showtime FOREIGN KEY (showtime_id) REFERENCES showtimes (id),
    INDEX idx_bookings_user   (user_id),
    INDEX idx_bookings_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- TABLE: booking_seats (chi tiết ghế đặt)
-- ============================================================
CREATE TABLE booking_seats (
    id           BIGINT NOT NULL AUTO_INCREMENT,
    booking_id   BIGINT NOT NULL,
    seat_id      BIGINT NOT NULL,
    showtime_id  BIGINT NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uq_seat_showtime (seat_id, showtime_id),
    CONSTRAINT fk_bseats_booking  FOREIGN KEY (booking_id)  REFERENCES bookings (id),
    CONSTRAINT fk_bseats_seat     FOREIGN KEY (seat_id)     REFERENCES seats (id),
    CONSTRAINT fk_bseats_showtime FOREIGN KEY (showtime_id) REFERENCES showtimes (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- TABLE: payments
-- Dùng bởi: Payment Service (port 8084)
-- ============================================================
CREATE TABLE payments (
    id               BIGINT        NOT NULL AUTO_INCREMENT,
    payment_code     VARCHAR(30)   NOT NULL COMMENT 'PAY-YYYYMMDD-XXXXX',
    booking_id       BIGINT        NOT NULL,
    user_id          BIGINT        NOT NULL,
    amount           DECIMAL(12,0) NOT NULL,
    payment_method   ENUM('MOMO','VNPAY','CREDIT_CARD','ATM','ZALOPAY') NOT NULL DEFAULT 'MOMO',
    status           ENUM('PENDING','SUCCESS','FAILED','REFUNDED') NOT NULL DEFAULT 'PENDING',
    transaction_ref  VARCHAR(100)  DEFAULT NULL COMMENT 'External transaction ID',
    failure_reason   VARCHAR(255)  DEFAULT NULL,
    paid_at          DATETIME      DEFAULT NULL,
    created_at       DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_payments_code (payment_code),
    CONSTRAINT fk_payments_booking FOREIGN KEY (booking_id) REFERENCES bookings (id),
    CONSTRAINT fk_payments_user    FOREIGN KEY (user_id)    REFERENCES users (id),
    INDEX idx_payments_booking (booking_id),
    INDEX idx_payments_status  (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- TABLE: notifications
-- Dùng bởi: Notification Service (trong Payment+Notification Service)
-- ============================================================
CREATE TABLE notifications (
    id          BIGINT       NOT NULL AUTO_INCREMENT,
    user_id     BIGINT       NOT NULL,
    booking_id  BIGINT       DEFAULT NULL,
    type        ENUM('BOOKING_SUCCESS','BOOKING_FAILED','PAYMENT_SUCCESS','PAYMENT_FAILED','GENERAL') NOT NULL,
    title       VARCHAR(200) NOT NULL,
    message     TEXT         NOT NULL,
    is_read     TINYINT(1)   NOT NULL DEFAULT 0,
    sent_at     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_notif_user    FOREIGN KEY (user_id)    REFERENCES users (id),
    CONSTRAINT fk_notif_booking FOREIGN KEY (booking_id) REFERENCES bookings (id),
    INDEX idx_notif_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- TABLE: event_logs (Bonus: Event log lưu lịch sử event)
-- ============================================================
CREATE TABLE event_logs (
    id           BIGINT       NOT NULL AUTO_INCREMENT,
    event_type   VARCHAR(50)  NOT NULL COMMENT 'USER_REGISTERED, BOOKING_CREATED, PAYMENT_COMPLETED, BOOKING_FAILED',
    event_source VARCHAR(50)  NOT NULL COMMENT 'user-service, booking-service, payment-service',
    payload      JSON         DEFAULT NULL,
    entity_id    BIGINT       DEFAULT NULL COMMENT 'user_id / booking_id / payment_id',
    status       ENUM('PUBLISHED','CONSUMED','FAILED') NOT NULL DEFAULT 'PUBLISHED',
    created_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    processed_at DATETIME     DEFAULT NULL,
    PRIMARY KEY (id),
    INDEX idx_evlog_type      (event_type),
    INDEX idx_evlog_status    (status),
    INDEX idx_evlog_entity    (entity_id),
    INDEX idx_evlog_created   (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- TABLE: dead_letter_queue (Bonus: DLQ)
-- ============================================================
CREATE TABLE dead_letter_queue (
    id            BIGINT       NOT NULL AUTO_INCREMENT,
    event_log_id  BIGINT       DEFAULT NULL,
    event_type    VARCHAR(50)  NOT NULL,
    payload       JSON         DEFAULT NULL,
    error_message TEXT         DEFAULT NULL,
    retry_count   INT          NOT NULL DEFAULT 0,
    max_retries   INT          NOT NULL DEFAULT 3,
    next_retry_at DATETIME     DEFAULT NULL,
    status        ENUM('PENDING','RETRYING','DEAD') NOT NULL DEFAULT 'PENDING',
    created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_dlq_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
--  SAMPLE DATA
-- ============================================================

-- ------------------------------------------------------------
-- USERS (password = BCrypt of "password123")
-- ------------------------------------------------------------
INSERT INTO users (username, email, password, full_name, phone, role) VALUES
('admin',     'admin@movieticket.vn',    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lh8y', 'Quản Trị Viên',    '0901000001', 'ADMIN'),
('nguyen_an', 'an.nguyen@gmail.com',     '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lh8y', 'Nguyễn Văn An',    '090123457', 'USER'),
('tran_binh', 'binh.tran@gmail.com',     '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lh8y', 'Trần Thị Bình',    '091234578', 'USER'),
('le_cuong',  'cuong.le@yahoo.com',      '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lh8y', 'Lê Văn Cường',     '0923456789', 'USER'),
('pham_dung', 'dung.pham@outlook.com',   '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lh8y', 'Phạm Minh Dũng',   '0934567890', 'USER'),
('hoang_em',  'em.hoang@gmail.com',      '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lh8y', 'Hoàng Thị Em',     '0945678901', 'USER'),
('do_phuong', 'phuong.do@gmail.com',     '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lh8y', 'Đỗ Thị Phương',    '0956789012', 'USER'),
('vu_giang',  'giang.vu@gmail.com',      '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lh8y', 'Vũ Tiến Giang',    '0967890123', 'USER'),
('bui_hoa',   'hoa.bui@gmail.com',       '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lh8y', 'Bùi Thị Hoa',      '0978901234', 'USER'),
('ngo_inh',   'inh.ngo@gmail.com',       '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lh8y', 'Ngô Văn Ính',      '0989012345', 'USER');

-- ------------------------------------------------------------
-- MOVIES
-- ------------------------------------------------------------
INSERT INTO movies (title, description, genre, duration, director, cast_members, language, rating, release_date, status) VALUES
('Avengers: Endgame',
 'Sau sự kiện thảm khốc của Thanos, các siêu anh hùng còn lại phải cùng nhau thực hiện một nhiệm vụ cuối cùng để đảo ngược hậu quả và khôi phục trật tự vũ trụ.',
 'Hành động, Khoa học viễn tưởng', 182, 'Anthony Russo, Joe Russo',
 'Robert Downey Jr., Chris Evans, Mark Ruffalo, Chris Hemsworth, Scarlett Johansson',
 'Tiếng Anh (Phụ đề Việt)', 8.4, '2019-04-26', 'NOW_SHOWING'),

('Lật Mặt 7: Một Điều Ước',
 'Tập 7 của series phim bom tấn Việt Nam về gia đình và những bí mật được che giấu, khai thác sâu hơn tình cảm gia đình qua nhiều thế hệ.',
 'Hành động, Gia đình', 128, 'Lý Hải',
 'Lý Hải, Lâm Vỹ Dạ, Quang Thắng, Ốc Thanh Vân, Mạc Văn Khoa',
 'Tiếng Việt', 7.2, '2024-04-26', 'NOW_SHOWING'),

('Inside Out 2',
 'Riley bước vào giai đoạn tuổi teen, những cảm xúc mới xuất hiện thách thức Joy và đồng đội trong cuộc phiêu lưu mới trong thế giới nội tâm.',
 'Hoạt hình, Gia đình, Hài', 100, 'Kelsey Mann',
 'Amy Poehler, Maya Hawke, Kensington Tallman, Liza Lapira',
 'Tiếng Anh (Lồng tiếng Việt)', 7.8, '2024-06-14', 'NOW_SHOWING'),

('Deadpool & Wolverine',
 'Deadpool và Wolverine cùng nhau tham gia vào một cuộc phiêu lưu điên rồ xuyên đa vũ trụ để bảo vệ thứ quan trọng nhất với họ.',
 'Hành động, Hài, Siêu anh hùng', 128, 'Shawn Levy',
 'Ryan Reynolds, Hugh Jackman, Emma Corrin, Matthew Macfadyen',
 'Tiếng Anh (Phụ đề Việt)', 7.9, '2024-07-26', 'NOW_SHOWING'),

('Godzilla x Kong: Đế Chế Mới',
 'Godzilla và Kong phải hợp sức chống lại một mối đe dọa khổng lồ chưa từng thấy, đẩy nhân loại vào nguy hiểm tột cùng.',
 'Hành động, Khoa học viễn tưởng', 115, 'Adam Wingard',
 'Rebecca Hall, Brian Tyree Henry, Dan Stevens, Kaylee Hottle',
 'Tiếng Anh (Phụ đề Việt)', 6.9, '2024-03-29', 'NOW_SHOWING'),

('Mai',
 'Câu chuyện tình yêu và hy sinh của một người phụ nữ giữa bộn bề cuộc sống hiện đại, khắc họa sâu sắc tình mẫu tử và sự chọn lựa.',
 'Tâm lý, Tình cảm', 130, 'Trấn Thành',
 'Phương Anh Đào, Tuấn Trần, Trấn Thành, Uyển Ân',
 'Tiếng Việt', 7.6, '2024-02-10', 'NOW_SHOWING'),

('Alien: Romulus',
 'Một nhóm thanh niên khi khám phá một trạm vũ trụ bỏ hoang đã phải đối mặt với dạng sống nguy hiểm nhất vũ trụ.',
 'Kinh dị, Khoa học viễn tưởng', 119, 'Fede Álvarez',
 'Cailee Spaeny, David Jonsson, Archie Renaux, Isabela Merced',
 'Tiếng Anh (Phụ đề Việt)', 7.3, '2024-08-16', 'NOW_SHOWING'),

('Kung Fu Panda 4',
 'Po phải tìm người kế thừa vị trí Chiến binh Rồng trong khi đối mặt với kẻ phản diện mới có khả năng sao chép mọi kỹ năng võ thuật.',
 'Hoạt hình, Hài, Hành động', 94, 'Mike Mitchell',
 'Jack Black, Awkwafina, Bryan Cranston, Viola Davis',
 'Tiếng Anh (Lồng tiếng Việt)', 6.8, '2024-03-08', 'NOW_SHOWING'),

('Oppenheimer',
 'Cuộc đời và hành trình đầy tranh cãi của J. Robert Oppenheimer - cha đẻ của bom nguyên tử, người đã thay đổi vĩnh viễn thế giới.',
 'Tiểu sử, Lịch sử, Chính kịch', 180, 'Christopher Nolan',
 'Cillian Murphy, Emily Blunt, Matt Damon, Robert Downey Jr.',
 'Tiếng Anh (Phụ đề Việt)', 8.3, '2023-07-21', 'ENDED'),

('Venom: The Last Dance',
 'Eddie Brock và Venom phải đối mặt với kẻ thù nguy hiểm nhất từ trước đến nay trong cuộc chiến cuối cùng của họ.',
 'Hành động, Khoa học viễn tưởng', 109, 'Kelly Marcel',
 'Tom Hardy, Chiwetel Ejiofor, Juno Temple, Rhys Ifans',
 'Tiếng Anh (Phụ đề Việt)', 6.4, '2024-10-25', 'COMING_SOON');

-- ------------------------------------------------------------
-- CINEMAS
-- ------------------------------------------------------------
INSERT INTO cinemas (name, address, city) VALUES
('CGV Vincom Center',     '72 Lê Thánh Tôn, Bến Nghé, Quận 1',               'Hồ Chí Minh'),
('CGV Crescent Mall',     'Số 101 Tôn Dật Tiên, Tân Phú, Quận 7',            'Hồ Chí Minh'),
('Lotte Cinema Nowzone',  'Tầng 5-6, 235 Nguyễn Văn Cừ, Quận 1',            'Hồ Chí Minh'),
('BHD Star Cineplex Phú Mỹ Hưng', 'Tầng 6, Vivo City, 1058A Nguyễn Văn Linh, Quận 7', 'Hồ Chí Minh'),
('Galaxy Cinema Tân Bình', '246 Nguyễn Hồng Đào, Phường 14, Quận Tân Bình',  'Hồ Chí Minh');

-- ------------------------------------------------------------
-- HALLS
-- ------------------------------------------------------------
INSERT INTO halls (cinema_id, name, total_seats) VALUES
(1, 'Phòng 1 - Standard',  80),
(1, 'Phòng 2 - VIP',       60),
(1, 'Phòng 3 - IMAX',      120),
(2, 'Phòng A',             80),
(2, 'Phòng B',             80),
(3, 'Phòng 1',             100),
(3, 'Phòng 2',             80),
(4, 'Phòng Gold',          60),
(4, 'Phòng Silver',        100),
(5, 'Phòng 1',             80);

-- ------------------------------------------------------------
-- SEATS (tạo ghế cho Hall 1: 8 hàng x 10 ghế)
-- ------------------------------------------------------------
INSERT INTO seats (hall_id, row_label, seat_number, seat_type) VALUES
-- Hall 1 - Hàng A (standard)
(1,'A',1,'STANDARD'),(1,'A',2,'STANDARD'),(1,'A',3,'STANDARD'),(1,'A',4,'STANDARD'),(1,'A',5,'STANDARD'),
(1,'A',6,'STANDARD'),(1,'A',7,'STANDARD'),(1,'A',8,'STANDARD'),(1,'A',9,'STANDARD'),(1,'A',10,'STANDARD'),
-- Hall 1 - Hàng B (standard)
(1,'B',1,'STANDARD'),(1,'B',2,'STANDARD'),(1,'B',3,'STANDARD'),(1,'B',4,'STANDARD'),(1,'B',5,'STANDARD'),
(1,'B',6,'STANDARD'),(1,'B',7,'STANDARD'),(1,'B',8,'STANDARD'),(1,'B',9,'STANDARD'),(1,'B',10,'STANDARD'),
-- Hall 1 - Hàng C (standard)
(1,'C',1,'STANDARD'),(1,'C',2,'STANDARD'),(1,'C',3,'STANDARD'),(1,'C',4,'STANDARD'),(1,'C',5,'STANDARD'),
(1,'C',6,'STANDARD'),(1,'C',7,'STANDARD'),(1,'C',8,'STANDARD'),(1,'C',9,'STANDARD'),(1,'C',10,'STANDARD'),
-- Hall 1 - Hàng D (VIP)
(1,'D',1,'VIP'),(1,'D',2,'VIP'),(1,'D',3,'VIP'),(1,'D',4,'VIP'),(1,'D',5,'VIP'),
(1,'D',6,'VIP'),(1,'D',7,'VIP'),(1,'D',8,'VIP'),(1,'D',9,'VIP'),(1,'D',10,'VIP'),
-- Hall 1 - Hàng E (VIP)
(1,'E',1,'VIP'),(1,'E',2,'VIP'),(1,'E',3,'VIP'),(1,'E',4,'VIP'),(1,'E',5,'VIP'),
(1,'E',6,'VIP'),(1,'E',7,'VIP'),(1,'E',8,'VIP'),(1,'E',9,'VIP'),(1,'E',10,'VIP'),
-- Hall 1 - Hàng F (VIP)
(1,'F',1,'VIP'),(1,'F',2,'VIP'),(1,'F',3,'VIP'),(1,'F',4,'VIP'),(1,'F',5,'VIP'),
(1,'F',6,'VIP'),(1,'F',7,'VIP'),(1,'F',8,'VIP'),(1,'F',9,'VIP'),(1,'F',10,'VIP'),
-- Hall 1 - Hàng G (COUPLE)
(1,'G',1,'COUPLE'),(1,'G',2,'COUPLE'),(1,'G',3,'COUPLE'),(1,'G',4,'COUPLE'),(1,'G',5,'COUPLE'),
(1,'G',6,'COUPLE'),(1,'G',7,'COUPLE'),(1,'G',8,'COUPLE'),(1,'G',9,'COUPLE'),(1,'G',10,'COUPLE'),
-- Hall 1 - Hàng H (COUPLE)
(1,'H',1,'COUPLE'),(1,'H',2,'COUPLE'),(1,'H',3,'COUPLE'),(1,'H',4,'COUPLE'),(1,'H',5,'COUPLE'),
(1,'H',6,'COUPLE'),(1,'H',7,'COUPLE'),(1,'H',8,'COUPLE'),(1,'H',9,'COUPLE'),(1,'H',10,'COUPLE'),
-- Hall 2 - Hàng A-F (VIP hall, 6x10)
(2,'A',1,'VIP'),(2,'A',2,'VIP'),(2,'A',3,'VIP'),(2,'A',4,'VIP'),(2,'A',5,'VIP'),
(2,'A',6,'VIP'),(2,'A',7,'VIP'),(2,'A',8,'VIP'),(2,'A',9,'VIP'),(2,'A',10,'VIP'),
(2,'B',1,'VIP'),(2,'B',2,'VIP'),(2,'B',3,'VIP'),(2,'B',4,'VIP'),(2,'B',5,'VIP'),
(2,'B',6,'VIP'),(2,'B',7,'VIP'),(2,'B',8,'VIP'),(2,'B',9,'VIP'),(2,'B',10,'VIP'),
(2,'C',1,'COUPLE'),(2,'C',2,'COUPLE'),(2,'C',3,'COUPLE'),(2,'C',4,'COUPLE'),(2,'C',5,'COUPLE'),
(2,'C',6,'COUPLE'),(2,'C',7,'COUPLE'),(2,'C',8,'COUPLE'),(2,'C',9,'COUPLE'),(2,'C',10,'COUPLE'),
-- Hall 4 - standard (8x10)
(4,'A',1,'STANDARD'),(4,'A',2,'STANDARD'),(4,'A',3,'STANDARD'),(4,'A',4,'STANDARD'),(4,'A',5,'STANDARD'),
(4,'A',6,'STANDARD'),(4,'A',7,'STANDARD'),(4,'A',8,'STANDARD'),(4,'A',9,'STANDARD'),(4,'A',10,'STANDARD'),
(4,'B',1,'STANDARD'),(4,'B',2,'STANDARD'),(4,'B',3,'STANDARD'),(4,'B',4,'STANDARD'),(4,'B',5,'STANDARD'),
(4,'B',6,'STANDARD'),(4,'B',7,'STANDARD'),(4,'B',8,'STANDARD'),(4,'B',9,'STANDARD'),(4,'B',10,'STANDARD'),
(4,'C',1,'VIP'),(4,'C',2,'VIP'),(4,'C',3,'VIP'),(4,'C',4,'VIP'),(4,'C',5,'VIP'),
(4,'C',6,'VIP'),(4,'C',7,'VIP'),(4,'C',8,'VIP'),(4,'C',9,'VIP'),(4,'C',10,'VIP');

-- ------------------------------------------------------------
-- SHOWTIMES (suất chiếu hôm nay và các ngày tới)
-- ------------------------------------------------------------
INSERT INTO showtimes (movie_id, hall_id, show_date, start_time, end_time, price, available_seats, status) VALUES
-- Avengers: Endgame (movie 1, hall 1 - CGV Vincom Q1)
(1, 1, CURDATE(),       '09:00:00', '12:02:00', 85000,  75, 'ACTIVE'),
(1, 1, CURDATE(),       '14:00:00', '17:02:00', 95000,  80, 'ACTIVE'),
(1, 1, CURDATE(),       '20:00:00', '23:02:00', 110000, 60, 'ACTIVE'),
(1, 1, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '10:00:00', '13:02:00', 85000, 80, 'ACTIVE'),
(1, 1, DATE_ADD(CURDATE(), INTERVAL 2 DAY), '15:00:00', '18:02:00', 95000, 80, 'ACTIVE'),

-- Lật Mặt 7 (movie 2, hall 2 - VIP)
(2, 2, CURDATE(),       '10:00:00', '12:08:00', 120000, 55, 'ACTIVE'),
(2, 2, CURDATE(),       '16:00:00', '18:08:00', 140000, 60, 'ACTIVE'),
(2, 2, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '13:00:00', '15:08:00', 130000, 60, 'ACTIVE'),

-- Inside Out 2 (movie 3, hall 4)
(3, 4, CURDATE(),       '09:30:00', '11:10:00', 75000,  75, 'ACTIVE'),
(3, 4, CURDATE(),       '13:00:00', '14:40:00', 85000,  80, 'ACTIVE'),
(3, 4, CURDATE(),       '18:00:00', '19:40:00', 95000,  70, 'ACTIVE'),
(3, 4, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '10:00:00', '11:40:00', 80000, 80, 'ACTIVE'),

-- Deadpool & Wolverine (movie 4, hall 1)
(4, 1, CURDATE(),       '11:00:00', '13:08:00', 95000,  65, 'ACTIVE'),
(4, 1, CURDATE(),       '19:00:00', '21:08:00', 110000, 50, 'ACTIVE'),
(4, 1, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '14:30:00', '16:38:00', 95000, 80, 'ACTIVE'),

-- Godzilla x Kong (movie 5, hall 2)
(5, 2, CURDATE(),       '08:30:00', '10:25:00', 120000, 40, 'ACTIVE'),
(5, 2, CURDATE(),       '20:30:00', '22:25:00', 150000, 55, 'ACTIVE'),

-- Mai (movie 6, hall 4)
(6, 4, CURDATE(),       '12:00:00', '14:10:00', 85000,  60, 'ACTIVE'),
(6, 4, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '17:00:00', '19:10:00', 95000, 80, 'ACTIVE'),

-- Alien: Romulus (movie 7, hall 1)
(7, 1, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '20:00:00', '21:59:00', 110000, 80, 'ACTIVE'),
(7, 1, DATE_ADD(CURDATE(), INTERVAL 2 DAY), '21:00:00', '22:59:00', 110000, 80, 'ACTIVE'),

-- Kung Fu Panda 4 (movie 8, hall 4)
(8, 4, CURDATE(),       '08:00:00', '09:34:00', 70000,  80, 'ACTIVE'),
(8, 4, CURDATE(),       '11:00:00', '12:34:00', 75000,  78, 'ACTIVE');

-- ------------------------------------------------------------
-- BOOKINGS
-- ------------------------------------------------------------
INSERT INTO bookings (booking_code, user_id, showtime_id, total_seats, total_amount, status) VALUES
('BK-20240415-00001', 2, 1, 2, 190000, 'CONFIRMED'),
('BK-20240415-00002', 3, 6, 1, 120000, 'CONFIRMED'),
('BK-20240415-00003', 4, 9, 3, 255000, 'CONFIRMED'),
('BK-20240415-00004', 5, 2, 2, 220000, 'FAILED'),
('BK-20240415-00005', 6, 7, 2, 280000, 'CONFIRMED'),
('BK-20240415-00006', 7, 13, 1, 95000, 'PENDING'),
('BK-20240415-00007', 8, 18, 2, 190000, 'CONFIRMED'),
('BK-20240415-00008', 9, 3, 4, 440000, 'CONFIRMED'),
('BK-20240415-00009', 10, 10, 1, 85000, 'CONFIRMED'),
('BK-20240415-00010', 2, 16, 2, 300000, 'FAILED');

-- ------------------------------------------------------------
-- BOOKING_SEATS
-- ------------------------------------------------------------
INSERT INTO booking_seats (booking_id, seat_id, showtime_id) VALUES
-- Booking 1: showtime 1, ghế A1, A2
(1, 1, 1),
(1, 2, 1),
-- Booking 2: showtime 6, ghế VIP hall 2 - A1
(2, 81, 6),
-- Booking 3: showtime 9, ghế hall 4 - A1,A2,A3
(3, 111, 9),
(3, 112, 9),
(3, 113, 9),
-- Booking 5: showtime 7, ghế VIP - A2,A3
(5, 82, 7),
(5, 83, 7),
-- Booking 7: showtime 18, ghế hall 4 - B1,B2
(7, 121, 18),
(7, 122, 18),
-- Booking 8: showtime 3, ghế A3,A4,A5,A6
(8, 3, 3),
(8, 4, 3),
(8, 5, 3),
(8, 6, 3),
-- Booking 9: showtime 10, ghế hall 4 - A4
(9, 114, 10);

-- ------------------------------------------------------------
-- PAYMENTS
-- ------------------------------------------------------------
INSERT INTO payments (payment_code, booking_id, user_id, amount, payment_method, status, transaction_ref, paid_at) VALUES
('PAY-20240415-00001', 1, 2, 190000, 'MOMO',        'SUCCESS', 'MOMO-TXN-8823741', NOW() - INTERVAL 2 HOUR),
('PAY-20240415-00002', 2, 3, 120000, 'VNPAY',       'SUCCESS', 'VNP-TXN-9912345',  NOW() - INTERVAL 3 HOUR),
('PAY-20240415-00003', 3, 4, 255000, 'CREDIT_CARD', 'SUCCESS', 'CC-TXN-1123457',  NOW() - INTERVAL 4 HOUR),
('PAY-20240415-00004', 4, 5, 220000, 'ZALOPAY',     'FAILED',  NULL,               NULL),
('PAY-20240415-00005', 5, 6, 280000, 'MOMO',        'SUCCESS', 'MOMO-TXN-5566778', NOW() - INTERVAL 1 HOUR),
('PAY-20240415-00006', 7, 8, 190000, 'ATM',         'SUCCESS', 'ATM-TXN-3321456',  NOW() - INTERVAL 30 MINUTE),
('PAY-20240415-00007', 8, 9, 440000, 'MOMO',        'SUCCESS', 'MOMO-TXN-7712345', NOW() - INTERVAL 5 HOUR),
('PAY-20240415-00008', 9, 10, 85000, 'VNPAY',       'SUCCESS', 'VNP-TXN-4456789',  NOW() - INTERVAL 6 HOUR),
('PAY-20240415-00009', 10, 2, 300000, 'MOMO',       'FAILED',  NULL,               NULL);

-- ------------------------------------------------------------
-- NOTIFICATIONS
-- ------------------------------------------------------------
INSERT INTO notifications (user_id, booking_id, type, title, message, is_read) VALUES
(2, 1, 'BOOKING_SUCCESS', 'Đặt vé thành công!',
 'Booking #BK-20240415-00001 đã được xác nhận. Bạn đã đặt 2 ghế xem Avengers: Endgame. Tổng tiền: 190,000 VND', 1),
(3, 2, 'BOOKING_SUCCESS', 'Đặt vé thành công!',
 'Booking #BK-20240415-00002 đã được xác nhận. Bạn đã đặt 1 ghế xem Lật Mặt 7. Tổng tiền: 120,000 VND', 1),
(4, 3, 'BOOKING_SUCCESS', 'Đặt vé thành công!',
 'Booking #BK-20240415-00003 đã được xác nhận. Bạn đã đặt 3 ghế xem Inside Out 2. Tổng tiền: 255,000 VND', 0),
(5, 4, 'BOOKING_FAILED', 'Đặt vé thất bại!',
 'Booking #BK-20240415-00004 đã bị hủy do thanh toán thất bại. Vui lòng thử lại.', 1),
(6, 5, 'BOOKING_SUCCESS', 'Đặt vé thành công!',
 'Booking #BK-20240415-00005 đã được xác nhận. Bạn đã đặt 2 ghế xem Lật Mặt 7. Tổng tiền: 280,000 VND', 0),
(8, 7, 'PAYMENT_SUCCESS', 'Thanh toán thành công!',
 'Đã nhận thanh toán 190,000 VND qua ATM cho booking #BK-20240415-00007', 0),
(9, 8, 'BOOKING_SUCCESS', 'Đặt vé thành công!',
 'Booking #BK-20240415-00008 đã được xác nhận. Bạn đã đặt 4 ghế xem Avengers: Endgame. Tổng tiền: 440,000 VND', 1),
(10, 9, 'BOOKING_SUCCESS', 'Đặt vé thành công!',
 'Booking #BK-20240415-00009 đã được xác nhận. Bạn đã đặt 1 ghế xem Inside Out 2. Tổng tiền: 85,000 VND', 0),
(2, 10, 'BOOKING_FAILED', 'Thanh toán thất bại!',
 'Booking #BK-20240415-00010 đã bị hủy do thanh toán qua MOMO thất bại. Vui lòng thử lại.', 0);

-- ------------------------------------------------------------
-- EVENT_LOGS (lịch sử event cho Event-Driven Architecture)
-- ------------------------------------------------------------
INSERT INTO event_logs (event_type, event_source, payload, entity_id, status, processed_at) VALUES
('USER_REGISTERED', 'user-service',
 '{"userId":2,"username":"nguyen_an","email":"an.nguyen@gmail.com","registeredAt":"2024-04-15T08:00:00"}',
 2, 'CONSUMED', NOW() - INTERVAL 8 HOUR),

('USER_REGISTERED', 'user-service',
 '{"userId":3,"username":"tran_binh","email":"binh.tran@gmail.com","registeredAt":"2024-04-15T08:05:00"}',
 3, 'CONSUMED', NOW() - INTERVAL 7 HOUR),

('BOOKING_CREATED', 'booking-service',
 '{"bookingId":1,"bookingCode":"BK-20240415-00001","userId":2,"showtimeId":1,"totalSeats":2,"totalAmount":190000,"seats":["A1","A2"]}',
 1, 'CONSUMED', NOW() - INTERVAL 2 HOUR),

('PAYMENT_COMPLETED', 'payment-service',
 '{"paymentId":1,"paymentCode":"PAY-20240415-00001","bookingId":1,"userId":2,"amount":190000,"method":"MOMO","status":"SUCCESS","transactionRef":"MOMO-TXN-8823741"}',
 1, 'CONSUMED', NOW() - INTERVAL 2 HOUR),

('BOOKING_CREATED', 'booking-service',
 '{"bookingId":2,"bookingCode":"BK-20240415-00002","userId":3,"showtimeId":6,"totalSeats":1,"totalAmount":120000,"seats":["A1"]}',
 2, 'CONSUMED', NOW() - INTERVAL 3 HOUR),

('PAYMENT_COMPLETED', 'payment-service',
 '{"paymentId":2,"paymentCode":"PAY-20240415-00002","bookingId":2,"userId":3,"amount":120000,"method":"VNPAY","status":"SUCCESS","transactionRef":"VNP-TXN-9912345"}',
 2, 'CONSUMED', NOW() - INTERVAL 3 HOUR),

('BOOKING_CREATED', 'booking-service',
 '{"bookingId":4,"bookingCode":"BK-20240415-00004","userId":5,"showtimeId":2,"totalSeats":2,"totalAmount":220000,"seats":["A1","A2"]}',
 4, 'CONSUMED', NOW() - INTERVAL 4 HOUR),

('BOOKING_FAILED', 'payment-service',
 '{"paymentId":4,"bookingId":4,"userId":5,"amount":220000,"method":"ZALOPAY","status":"FAILED","reason":"Insufficient funds"}',
 4, 'CONSUMED', NOW() - INTERVAL 4 HOUR),

('BOOKING_CREATED', 'booking-service',
 '{"bookingId":6,"bookingCode":"BK-20240415-00006","userId":7,"showtimeId":13,"totalSeats":1,"totalAmount":95000,"seats":["A1"]}',
 6, 'PUBLISHED', NULL),

('USER_REGISTERED', 'user-service',
 '{"userId":7,"username":"do_phuong","email":"phuong.do@gmail.com","registeredAt":"2024-04-15T09:30:00"}',
 7, 'CONSUMED', NOW() - INTERVAL 6 HOUR);

-- ------------------------------------------------------------
-- DEAD_LETTER_QUEUE (Bonus: DLQ - các event xử lý thất bại)
-- ------------------------------------------------------------
INSERT INTO dead_letter_queue (event_log_id, event_type, payload, error_message, retry_count, max_retries, next_retry_at, status) VALUES
(9, 'BOOKING_CREATED',
 '{"bookingId":6,"bookingCode":"BK-20240415-00006","userId":7,"showtimeId":13}',
 'Payment service timeout after 30s', 2, 3, DATE_ADD(NOW(), INTERVAL 5 MINUTE), 'RETRYING'),

(NULL, 'PAYMENT_COMPLETED',
 '{"paymentId":9,"bookingId":10,"userId":2,"amount":300000,"method":"MOMO","status":"FAILED"}',
 'Notification service unavailable', 3, 3, NULL, 'DEAD');

-- ============================================================
-- RE-ENABLE FOREIGN KEY CHECKS
-- ============================================================
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- VERIFY SUMMARY
-- ============================================================
SELECT '=== IMPORT THÀNH CÔNG ===' AS '';
SELECT CONCAT('users: ', COUNT(*)) AS summary FROM users
UNION ALL SELECT CONCAT('movies: ', COUNT(*)) FROM movies
UNION ALL SELECT CONCAT('cinemas: ', COUNT(*)) FROM cinemas
UNION ALL SELECT CONCAT('halls: ', COUNT(*)) FROM halls
UNION ALL SELECT CONCAT('seats: ', COUNT(*)) FROM seats
UNION ALL SELECT CONCAT('showtimes: ', COUNT(*)) FROM showtimes
UNION ALL SELECT CONCAT('bookings: ', COUNT(*)) FROM bookings
UNION ALL SELECT CONCAT('booking_seats: ', COUNT(*)) FROM booking_seats
UNION ALL SELECT CONCAT('payments: ', COUNT(*)) FROM payments
UNION ALL SELECT CONCAT('notifications: ', COUNT(*)) FROM notifications
UNION ALL SELECT CONCAT('event_logs: ', COUNT(*)) FROM event_logs
UNION ALL SELECT CONCAT('dead_letter_queue: ', COUNT(*)) FROM dead_letter_queue;