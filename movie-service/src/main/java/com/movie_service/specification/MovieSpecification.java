package com.movie_service.specification;

import com.movie_service.entity.Movie;
import com.movie_service.entity.enums.MovieStatus;
import org.springframework.data.jpa.domain.Specification;

public final class MovieSpecification {

    private MovieSpecification() {
    }

    public static Specification<Movie> hasStatus(MovieStatus status) {
        return (root, query, cb) -> status == null ? cb.conjunction() : cb.equal(root.get("status"), status);
    }

    public static Specification<Movie> hasGenre(String genre) {
        return (root, query, cb) -> {
            if (genre == null || genre.isBlank()) {
                return cb.conjunction();
            }
            return cb.like(cb.lower(root.get("genre")), "%" + genre.toLowerCase() + "%");
        };
    }

    public static Specification<Movie> titleContains(String keyword) {
        return (root, query, cb) -> {
            if (keyword == null || keyword.isBlank()) {
                return cb.conjunction();
            }
            return cb.like(cb.lower(root.get("title")), "%" + keyword.toLowerCase() + "%");
        };
    }
}
