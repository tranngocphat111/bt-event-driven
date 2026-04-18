package com.movie_service.service.impl;

import com.movie_service.dto.MovieRequestDTO;
import com.movie_service.dto.MovieResponseDTO;
import com.movie_service.dto.ShowtimeResponseDTO;
import com.movie_service.entity.Movie;
import com.movie_service.entity.enums.MovieStatus;
import com.movie_service.exception.NotFoundException;
import com.movie_service.mapper.MovieMapper;
import com.movie_service.mapper.ShowtimeMapper;
import com.movie_service.repository.MovieRepository;
import com.movie_service.repository.ShowtimeRepository;
import com.movie_service.service.MovieService;
import com.movie_service.service.S3Service;
import com.movie_service.specification.MovieSpecification;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MovieServiceImpl implements MovieService {

    private final MovieRepository movieRepository;
    private final ShowtimeRepository showtimeRepository;
    private final MovieMapper movieMapper;
    private final ShowtimeMapper showtimeMapper;
    private final S3Service s3Service;

    @Override
    @Transactional
    @CacheEvict(value = {"movies", "movieById", "moviesByStatus", "movieSearch", "movieShowtimes"}, allEntries = true)
    public MovieResponseDTO createMovie(MovieRequestDTO requestDTO, MultipartFile posterFile) {
        Movie movie = movieMapper.toEntity(requestDTO);

        if (posterFile != null && !posterFile.isEmpty()) {
            String posterUuid = s3Service.uploadFile(posterFile);
            movie.setPosterUrl(posterUuid);
        }

        Movie savedMovie = movieRepository.save(movie);
        return movieMapper.toResponse(savedMovie, s3Service);
    }

    @Override
    @Transactional
    @CacheEvict(value = {"movies", "movieById", "moviesByStatus", "movieSearch", "movieShowtimes"}, allEntries = true)
    public MovieResponseDTO updateMovie(Long id, MovieRequestDTO requestDTO, MultipartFile posterFile) {
        Movie movie = movieRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Movie not found with id: " + id));

        movieMapper.updateEntityFromDto(requestDTO, movie);

        if (posterFile != null && !posterFile.isEmpty()) {
            s3Service.deleteFile(movie.getPosterUrl());
            String newPosterUuid = s3Service.uploadFile(posterFile);
            movie.setPosterUrl(newPosterUuid);
        }

        Movie updatedMovie = movieRepository.save(movie);
        return movieMapper.toResponse(updatedMovie, s3Service);
    }

    @Override
    @Transactional
    @CacheEvict(value = {"movies", "movieById", "moviesByStatus", "movieSearch", "movieShowtimes"}, allEntries = true)
    public void deleteMovie(Long id) {
        Movie movie = movieRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Movie not found with id: " + id));

        s3Service.deleteFile(movie.getPosterUrl());
        movieRepository.delete(movie);
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "movies", key = "T(java.util.Objects).toString(#status) + '-' + T(java.util.Objects).toString(#genre) + '-' + #pageable.pageNumber + '-' + #pageable.pageSize")
    public Page<MovieResponseDTO> getAllMovies(MovieStatus status, String genre, Pageable pageable) {
        Specification<Movie> spec = Specification.where(MovieSpecification.hasStatus(status))
                .and(MovieSpecification.hasGenre(genre));

        return movieRepository.findAll(spec, pageable)
                .map(movie -> movieMapper.toResponse(movie, s3Service));
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "movieById", key = "#id")
    public MovieResponseDTO getMovieById(Long id) {
        Movie movie = movieRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Movie not found with id: " + id));

        return movieMapper.toResponse(movie, s3Service);
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "movieSearch", key = "#keyword")
    public List<MovieResponseDTO> searchMovies(String keyword) {
        Specification<Movie> spec = MovieSpecification.titleContains(keyword);

        return movieRepository.findAll(spec).stream()
                .map(movie -> movieMapper.toResponse(movie, s3Service))
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "moviesByStatus", key = "#status")
    public List<MovieResponseDTO> getMoviesByStatus(MovieStatus status) {
        return movieRepository.findByStatus(status).stream()
                .map(movie -> movieMapper.toResponse(movie, s3Service))
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "movieShowtimes", key = "#movieId")
    public List<ShowtimeResponseDTO> getShowtimesByMovie(Long movieId) {
        if (!movieRepository.existsById(movieId)) {
            throw new NotFoundException("Movie not found with id: " + movieId);
        }

        return showtimeRepository.findByMovieIdOrderByShowDateAscStartTimeAsc(movieId).stream()
                .map(showtimeMapper::toDto)
                .toList();
    }
}
