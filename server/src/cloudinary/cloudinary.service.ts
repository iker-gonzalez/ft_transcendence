import { Injectable } from '@nestjs/common';
import { UploadApiErrorResponse, UploadApiResponse } from 'cloudinary';
import toStream = require('buffer-to-stream');
import { cloudinaryConstants } from '../../config/cloudinary.constants';

@Injectable()
export class CloudinaryService {
  async uploadImage(
    file: Express.Multer.File,
    fileName: string,
  ): Promise<UploadApiResponse | UploadApiErrorResponse> {
    const cloudinary = require('cloudinary');

    return new Promise((resolve, reject) => {
      const upload = cloudinary.v2.uploader.upload_stream(
        {
          public_id: fileName,
          folder: cloudinaryConstants.cloudinaryStorageFolder,
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        },
      );
      toStream(file.buffer).pipe(upload);
    });
  }
}
