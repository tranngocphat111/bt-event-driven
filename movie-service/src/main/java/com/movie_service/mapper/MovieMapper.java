package com.movie_service.mapper;

import com.movie_service.dto.MovieRequestDTO;
import com.movie_service.dto.MovieResponseDTO;
import com.movie_service.entity.Movie;
import com.movie_service.service.S3Service;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface MovieMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "posterUrl", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Movie toEntity(MovieRequestDTO dto);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "posterUrl", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateEntityFromDto(MovieRequestDTO dto, @MappingTarget Movie movie);

    default MovieResponseDTO toResponse(Movie movie, S3Service s3Service) {
        return MovieResponseDTO.builder()
                .id(movie.getId())
                .title(movie.getTitle())
                .description(movie.getDescription())
                .genre(movie.getGenre())
                .duration(movie.getDuration())
                .director(movie.getDirector())
                .castMembers(movie.getCastMembers())
                .language(movie.getLanguage())
                .rating(movie.getRating())
                .posterUrl(s3Service.getFileUrl(movie.getPosterUrl()))
                .releaseDate(movie.getReleaseDate())
                .status(movie.getStatus())
                .createdAt(movie.getCreatedAt())
                .updatedAt(movie.getUpdatedAt())
                .build();
    }
}
