package com.movie_service.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class SeatResponseDTO {
    private Long seatId;
    private String rowLabel;
    private Integer seatNumber;
}
