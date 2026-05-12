package com.livebox.common.util;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.livebox.common.exception.LiveBoxException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class FileUploadService {

    private final Cloudinary cloudinary;

    /**
     * Upload an image to Cloudinary
     *
     * @param file   The multipart file to upload
     * @param folder The folder in Cloudinary to store the image (e.g. "avatars", "server_icons")
     * @return The secure URL of the uploaded image
     */
    public String uploadImage(MultipartFile file, String folder) {
        try {
            Map uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
                    "folder", "livebox/" + folder,
                    "resource_type", "image"
            ));
            return uploadResult.get("secure_url").toString();
        } catch (IOException e) {
            log.error("Failed to upload image to Cloudinary", e);
            throw new LiveBoxException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to upload image. Please try again.");
        }
    }

    /**
     * Delete an image from Cloudinary
     *
     * @param publicId The active public ID of the image
     */
    public void deleteImage(String publicId) {
        try {
            cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
        } catch (IOException e) {
            log.error("Failed to delete image from Cloudinary: {}", publicId, e);
        }
    }
}
