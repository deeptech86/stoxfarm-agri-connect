/**
 * File Upload Service
 */

import api from '@/lib/api';

export interface UploadResponse {
  success: boolean;
  filename: string;
  relative_path: string;
  url: string;
}

class UploadService {
  /**
   * Upload an image file
   */
  async uploadImage(file: File, category: string = 'produce'): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', category);

    const response = await api.post<UploadResponse>('/uploads/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  /**
   * Upload an image from URL
   */
  async uploadFromUrl(url: string, category: string = 'produce'): Promise<UploadResponse> {
    const response = await api.post<UploadResponse>('/uploads/image-from-url', {
      url,
      category,
    });
    return response.data;
  }

  /**
   * Validate file before upload
   */
  validateFile(file: File): { valid: boolean; error?: string } {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: `Invalid file type: ${file.type}. Allowed: JPEG, PNG, WebP, GIF`,
      };
    }

    if (file.size > maxSize) {
      return {
        valid: false,
        error: 'File too large. Maximum size is 5MB',
      };
    }

    return { valid: true };
  }

  /**
   * Validate URL
   */
  validateUrl(url: string): { valid: boolean; error?: string } {
    try {
      const parsed = new URL(url);
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        return { valid: false, error: 'URL must use HTTP or HTTPS protocol' };
      }
      return { valid: true };
    } catch {
      return { valid: false, error: 'Invalid URL format' };
    }
  }
}

export const uploadService = new UploadService();
export default uploadService;
