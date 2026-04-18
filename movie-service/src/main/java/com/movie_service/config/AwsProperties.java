package com.movie_service.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Getter
@Setter
@ConfigurationProperties(prefix = "app.aws")
public class AwsProperties {
    private String accessKey;
    private String secretKey;
    private String region;
    private S3Properties s3;

    @Getter
    @Setter
    public static class S3Properties {
        private String bucketName;
        private String posterPrefix;
        private String publicBaseUrl;
    }
}
