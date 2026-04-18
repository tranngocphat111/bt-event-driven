package com.movie_service.controller;

import com.movie_service.dto.ApiResponse;
import com.movie_service.dto.SeatResponseDTO;
import com.movie_service.dto.ShowtimeSeatDTO;
import com.movie_service.service.ShowtimeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/showtimes")
@RequiredArgsConstructor
public class ShowtimeController {

    private final ShowtimeService showtimeService;

    @GetMapping("/{showtimeId}/seats")
    public ResponseEntity<ApiResponse<List<ShowtimeSeatDTO>>> getSeatsByShowtime(@PathVariable Long showtimeId) {
        List<ShowtimeSeatDTO> response = showtimeService.getSeatsByShowtime(showtimeId);
        return ResponseEntity.ok(ApiResponse.success(response, "Showtime seats fetched successfully"));
    }

    @GetMapping("/{showtimeId}/booked-seats")
    public ResponseEntity<ApiResponse<List<SeatResponseDTO>>> getBookedSeats(@PathVariable Long showtimeId) {
        List<SeatResponseDTO> response = showtimeService.getBookedSeatsByShowtime(showtimeId);
        return ResponseEntity.ok(ApiResponse.success(response, "Booked seats fetched successfully"));
    }
}
