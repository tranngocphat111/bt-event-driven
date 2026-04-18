package com.movie_service.dto;

import com.movie_service.entity.enums.MovieStatus;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Builder
public class MovieResponseDTO {
    private Long id;
    private String title;
    private String description;
    private String genre;
    private Integer duration;
    private String director;
    private String castMembers;
    private String language;
    private BigDecimal rating;
    private String posterUrl;
    private LocalDate releaseDate;
    private MovieStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
