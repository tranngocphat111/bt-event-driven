package com.movie_service.dto;

import com.movie_service.entity.enums.SeatAvailabilityStatus;
import com.movie_service.entity.enums.SeatType;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ShowtimeSeatDTO {
    private Long seatId;
    private String rowLabel;
    private Integer seatNumber;
    private SeatType seatType;
    private SeatAvailabilityStatus status;
}
