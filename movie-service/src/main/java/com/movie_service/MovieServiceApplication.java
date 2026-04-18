package com.movie_service;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class MovieServiceApplication {

    public static void main(String[] args) {
        loadDotenvToSystemProperties();
        SpringApplication.run(MovieServiceApplication.class, args);
    }

    private static void loadDotenvToSystemProperties() {
        Dotenv dotenv = Dotenv.configure()
                .ignoreIfMissing()
                .load();

        applyIfMissing(dotenv, "AWS_ACCESS_KEY_ID");
        applyIfMissing(dotenv, "AWS_SECRET_ACCESS_KEY");
        applyIfMissing(dotenv, "AWS_REGION");
        applyIfMissing(dotenv, "S3_BUCKET");
        applyIfMissing(dotenv, "S3_POSTER_PREFIX");
        applyIfMissing(dotenv, "S3_PUBLIC_BASE_URL");
    }

    private static void applyIfMissing(Dotenv dotenv, String key) {
        String current = System.getenv(key);
        if (current != null && !current.isBlank()) {
            return;
        }

        String fromDotenv = dotenv.get(key);
        if (fromDotenv != null && !fromDotenv.isBlank()) {
            System.setProperty(key, fromDotenv);
        }
    }
}
