package com.movie_service.repository;

import com.movie_service.entity.Movie;
import com.movie_service.entity.enums.MovieStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;

public interface MovieRepository extends JpaRepository<Movie, Long>, JpaSpecificationExecutor<Movie> {
    List<Movie> findByStatus(MovieStatus status);
}
