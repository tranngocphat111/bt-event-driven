package com.movie_service.service;

import com.movie_service.dto.SeatResponseDTO;
import com.movie_service.dto.ShowtimeSeatDTO;

import java.util.List;

public interface ShowtimeService {
    List<ShowtimeSeatDTO> getSeatsByShowtime(Long showtimeId);

    List<SeatResponseDTO> getBookedSeatsByShowtime(Long showtimeId);
}
