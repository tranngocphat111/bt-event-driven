package com.movie_service.service;

import org.springframework.web.multipart.MultipartFile;

public interface S3Service {
    String uploadFile(MultipartFile file);

    String getFileUrl(String uuid);

    void deleteFile(String uuid);
}
