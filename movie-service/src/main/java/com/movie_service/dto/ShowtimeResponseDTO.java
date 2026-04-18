package com.movie_service.dto;

import com.movie_service.entity.enums.ShowtimeStatus;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalTime;

@Getter
@Builder
public class ShowtimeResponseDTO {
    private Long id;
    private Long movieId;
    private Long hallId;
    private LocalDate showDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private Integer availableSeats;
    private ShowtimeStatus status;
}
