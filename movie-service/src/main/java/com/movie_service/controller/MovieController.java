package com.movie_service.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.movie_service.dto.*;
import com.movie_service.entity.enums.MovieStatus;
import com.movie_service.service.MovieService;
import com.movie_service.service.ShowtimeService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/movies")
@RequiredArgsConstructor
public class MovieController {
    private final ShowtimeService showtimeService;
    private final MovieService movieService;
    private final ObjectMapper objectMapper;

    @PostMapping(consumes = {"multipart/form-data"})
    public ResponseEntity<ApiResponse<MovieResponseDTO>> createMovie(
            @RequestPart("movie") String movieJson,
            @RequestPart(value = "poster", required = false) MultipartFile posterFile) {

        try {
            MovieRequestDTO movieRequestDTO = objectMapper.readValue(movieJson, MovieRequestDTO.class);

            MovieResponseDTO response = movieService.createMovie(movieRequestDTO, posterFile);
            return ResponseEntity.ok(ApiResponse.success(response, "Movie created successfully"));

        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Invalid movie JSON: " + e.getMessage()));
        }
    }

    @PutMapping(value = "/{id}", consumes = {"multipart/form-data"})
    public ResponseEntity<ApiResponse<MovieResponseDTO>> updateMovie(
            @PathVariable Long id,
            @RequestPart("movie") String movieJson,
            @RequestPart(value = "poster", required = false) MultipartFile posterFile) {

        try {
            MovieRequestDTO movieRequestDTO = objectMapper.readValue(movieJson, MovieRequestDTO.class);

            MovieResponseDTO response = movieService.updateMovie(id, movieRequestDTO, posterFile);
            return ResponseEntity.ok(ApiResponse.success(response, "Movie updated successfully"));

        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Invalid movie JSON: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteMovie(@PathVariable Long id) {
        movieService.deleteMovie(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Movie deleted successfully"));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<MovieResponseDTO>>> getAllMovies(
            @RequestParam(required = false) MovieStatus status,
            @RequestParam(required = false) String genre,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "100") int size) {

        Pageable pageable = PageRequest.of(page, size);
        Page<MovieResponseDTO> response = movieService.getAllMovies(status, genre, pageable);
        return ResponseEntity.ok(ApiResponse.success(response, "Movies fetched successfully"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<MovieResponseDTO>> getMovieById(@PathVariable Long id) {
        MovieResponseDTO response = movieService.getMovieById(id);
        return ResponseEntity.ok(ApiResponse.success(response, "Movie fetched successfully"));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<MovieResponseDTO>>> searchMovies(@RequestParam String keyword) {
        List<MovieResponseDTO> response = movieService.searchMovies(keyword);
        return ResponseEntity.ok(ApiResponse.success(response, "Search completed"));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<ApiResponse<List<MovieResponseDTO>>> getMoviesByStatus(@PathVariable MovieStatus status) {
        List<MovieResponseDTO> response = movieService.getMoviesByStatus(status);
        return ResponseEntity.ok(ApiResponse.success(response, "Movies by status fetched successfully"));
    }

    @GetMapping("/{movieId}/showtimes")
    public ResponseEntity<ApiResponse<List<ShowtimeResponseDTO>>> getShowtimesByMovie(@PathVariable Long movieId) {
        List<ShowtimeResponseDTO> response = movieService.getShowtimesByMovie(movieId);
        return ResponseEntity.ok(ApiResponse.success(response, "Showtimes fetched successfully"));
    }

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