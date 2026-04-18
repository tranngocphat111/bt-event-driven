package com.movie_service.config;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.DefaultCredentialsProvider;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;

@Configuration
@EnableConfigurationProperties(AwsProperties.class)
public class AwsS3Config {

    private static final String DEFAULT_REGION = "ap-southeast-1";

    @Bean
    public S3Client s3Client(AwsProperties awsProperties) {
        String regionValue = awsProperties.getRegion();
        if (regionValue == null || regionValue.isBlank()) {
            regionValue = DEFAULT_REGION;
        }
        Region region = Region.of(regionValue);

        if (awsProperties.getAccessKey() == null || awsProperties.getAccessKey().isBlank()) {
            return S3Client.builder()
                    .region(region)
                    .credentialsProvider(DefaultCredentialsProvider.create())
                    .build();
        }

        AwsBasicCredentials credentials = AwsBasicCredentials.create(
                awsProperties.getAccessKey(),
                awsProperties.getSecretKey()
        );

        return S3Client.builder()
                .region(region)
                .credentialsProvider(StaticCredentialsProvider.create(credentials))
                .build();
    }
}
