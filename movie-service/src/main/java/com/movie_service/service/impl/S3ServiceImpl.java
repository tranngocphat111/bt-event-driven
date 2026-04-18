package com.movie_service.service.impl;

import com.movie_service.config.AwsProperties;
import com.movie_service.exception.BadRequestException;
import com.movie_service.service.S3Service;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class S3ServiceImpl implements S3Service {

    private final S3Client s3Client;
    private final AwsProperties awsProperties;

    @Override
    public String uploadFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Poster file is required");
        }

        String bucketName = getRequiredBucketName();
        String uuid = UUID.randomUUID().toString();
        String key = buildS3Key(uuid);

        try {
            PutObjectRequest request = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(key)
                    .contentType(file.getContentType())
                    .build();

            s3Client.putObject(request,
                    software.amazon.awssdk.core.sync.RequestBody.fromBytes(file.getBytes()));
            return uuid;
        } catch (Exception ex) {
            throw new BadRequestException("Failed to upload poster to S3: " + ex.getMessage());
        }
    }

    @Override
    public String getFileUrl(String uuid) {
        if (uuid == null || uuid.isBlank()) {
            return null;
        }

        if (isAbsoluteUrl(uuid)) {
            return uuid;
        }

        String key = buildS3Key(uuid);
        String publicBaseUrl = awsProperties.getS3().getPublicBaseUrl();
        if (publicBaseUrl != null && !publicBaseUrl.isBlank()) {
            String normalizedBase = publicBaseUrl.endsWith("/") ? publicBaseUrl : publicBaseUrl + "/";
            return normalizedBase + key;
        }

        String bucketName = getRequiredBucketName();
        URL url = s3Client.utilities().getUrl(builder -> builder
            .bucket(bucketName)
                .key(key));
        return url.toString();
    }

    @Override
    public void deleteFile(String uuid) {
        if (uuid == null || uuid.isBlank()) {
            return;
        }

        String bucketName = getRequiredBucketName();
        try {
            s3Client.deleteObject(DeleteObjectRequest.builder()
                    .bucket(bucketName)
                    .key(buildS3Key(uuid))
                    .build());
        } catch (Exception ex) {
            throw new BadRequestException("Failed to delete poster from S3: " + ex.getMessage());
        }
    }

    private String buildS3Key(String uuid) {
        String prefix = awsProperties.getS3().getPosterPrefix();
        if (prefix == null || prefix.isBlank()) {
            return uuid;
        }
        String normalizedPrefix = prefix.endsWith("/") ? prefix.substring(0, prefix.length() - 1) : prefix;
        return normalizedPrefix + "/" + new String(uuid.getBytes(StandardCharsets.UTF_8), StandardCharsets.UTF_8);
    }

    private boolean isAbsoluteUrl(String value) {
        return value.startsWith("http://") || value.startsWith("https://");
    }

    private String getRequiredBucketName() {
        if (awsProperties.getS3() == null
                || awsProperties.getS3().getBucketName() == null
                || awsProperties.getS3().getBucketName().isBlank()) {
            throw new BadRequestException("S3 bucket is not configured. Please set S3_BUCKET environment variable.");
        }
        return awsProperties.getS3().getBucketName();
    }
}
