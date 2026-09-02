import { apiClient } from './client';

export interface UploadResponse {
  url: string;
  originalname: string;
  mimetype: string;
  size: number;
}

export const uploadsApi = {
  /**
   * Upload single file directly to S3 storage.
   * Route: POST /uploads?folder={folder}
   */
  uploadFile: async (file: File, folder: string = 'media'): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post<UploadResponse>(`/uploads?folder=${encodeURIComponent(folder)}`, formData, {
      headers: { 'Content-Type': undefined },
    });
  },

  /**
   * Upload multiple files directly to S3 storage.
   * Route: POST /uploads/multiple?folder={folder}
   */
  uploadFiles: async (files: File[], folder: string = 'media'): Promise<UploadResponse[]> => {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    return apiClient.post<UploadResponse[]>(`/uploads/multiple?folder=${encodeURIComponent(folder)}`, formData, {
      headers: { 'Content-Type': undefined },
    });
  },
};
