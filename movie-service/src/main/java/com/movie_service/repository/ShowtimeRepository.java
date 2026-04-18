package com.movie_service.repository;

import com.movie_service.entity.Showtime;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ShowtimeRepository extends JpaRepository<Showtime, Long> {
    List<Showtime> findByMovieIdOrderByShowDateAscStartTimeAsc(Long movieId);
}
