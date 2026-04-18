package com.iuh.payment.repository;

import com.iuh.payment.domain.PaymentRecord;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PaymentRepository extends JpaRepository<PaymentRecord, Long> {
	Optional<PaymentRecord> findTopByBookingIdOrderByIdDesc(Long bookingId);

	Optional<PaymentRecord> findTopByTransactionRefOrderByIdDesc(String transactionRef);
}
