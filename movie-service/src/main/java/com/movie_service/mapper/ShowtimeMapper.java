package com.movie_service.mapper;

import com.movie_service.dto.ShowtimeResponseDTO;
import com.movie_service.entity.Showtime;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface ShowtimeMapper {
    ShowtimeResponseDTO toDto(Showtime showtime);
}
