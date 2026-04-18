package com.movie_service.service.impl;

import com.movie_service.dto.SeatResponseDTO;
import com.movie_service.dto.ShowtimeSeatDTO;
import com.movie_service.entity.Seat;
import com.movie_service.entity.Showtime;
import com.movie_service.entity.enums.SeatAvailabilityStatus;
import com.movie_service.exception.NotFoundException;
import com.movie_service.repository.BookingSeatRepository;
import com.movie_service.repository.SeatRepository;
import com.movie_service.repository.ShowtimeRepository;
import com.movie_service.service.ShowtimeService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ShowtimeServiceImpl implements ShowtimeService {

    private final ShowtimeRepository showtimeRepository;
    private final SeatRepository seatRepository;
    private final BookingSeatRepository bookingSeatRepository;

    @Override
    @Transactional(readOnly = true)
    public List<ShowtimeSeatDTO> getSeatsByShowtime(Long showtimeId) {
        Showtime showtime = showtimeRepository.findById(showtimeId)
                .orElseThrow(() -> new NotFoundException("Showtime not found with id: " + showtimeId));

        List<Seat> seats = seatRepository.findByHallIdOrderByRowLabelAscSeatNumberAsc(showtime.getHallId());

        Set<Long> bookedSeatIds = bookingSeatRepository.findByShowtimeId(showtimeId)
                .stream()
                .map(bookingSeat -> bookingSeat.getSeatId())
                .collect(Collectors.toSet());

        return seats.stream()
                .map(seat -> ShowtimeSeatDTO.builder()
                        .seatId(seat.getId())
                        .rowLabel(seat.getRowLabel())
                        .seatNumber(seat.getSeatNumber())
                        .seatType(seat.getSeatType())
                        .status(bookedSeatIds.contains(seat.getId())
                                ? SeatAvailabilityStatus.BOOKED
                                : SeatAvailabilityStatus.AVAILABLE)
                        .build())
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<SeatResponseDTO> getBookedSeatsByShowtime(Long showtimeId) {
        Showtime showtime = showtimeRepository.findById(showtimeId)
                .orElseThrow(() -> new NotFoundException("Showtime not found with id: " + showtimeId));

        Set<Long> bookedSeatIds = bookingSeatRepository.findByShowtimeId(showtimeId)
                .stream()
                .map(bookingSeat -> bookingSeat.getSeatId())
                .collect(Collectors.toSet());

        if (bookedSeatIds.isEmpty()) {
            return List.of();
        }

        return seatRepository.findByHallIdOrderByRowLabelAscSeatNumberAsc(showtime.getHallId()).stream()
                .filter(seat -> bookedSeatIds.contains(seat.getId()))
                .map(seat -> SeatResponseDTO.builder()
                        .seatId(seat.getId())
                        .rowLabel(seat.getRowLabel())
                        .seatNumber(seat.getSeatNumber())
                        .build())
                .toList();
    }
}
