package com.movie_service.service;

import com.movie_service.dto.MovieRequestDTO;
import com.movie_service.dto.MovieResponseDTO;
import com.movie_service.dto.ShowtimeResponseDTO;
import com.movie_service.entity.enums.MovieStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface MovieService {
    MovieResponseDTO createMovie(MovieRequestDTO requestDTO, MultipartFile posterFile);

    MovieResponseDTO updateMovie(Long id, MovieRequestDTO requestDTO, MultipartFile posterFile);

    void deleteMovie(Long id);

    Page<MovieResponseDTO> getAllMovies(MovieStatus status, String genre, Pageable pageable);

    MovieResponseDTO getMovieById(Long id);

    List<MovieResponseDTO> searchMovies(String keyword);

    List<MovieResponseDTO> getMoviesByStatus(MovieStatus status);

    List<ShowtimeResponseDTO> getShowtimesByMovie(Long movieId);
}
