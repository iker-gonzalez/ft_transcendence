import { ConfigService } from '@nestjs/config';
import { cloudinaryConstants } from '../../config/cloudinary.constants';

export const CloudinaryProvider = {
  provide: cloudinaryConstants.provideName,
  inject: [ConfigService],
  useFactory: (configService: ConfigService): void => {
    const cloudinary = require('cloudinary').v2;
    cloudinary.config({
      cloud_name: configService.get('CLOUDINARY_CLOUD_NAME'),
      api_key: configService.get('CLOUDINARY_API_KEY'),
      api_secret: configService.get('CLOUDINARY_API_SECRET'),
    });
  },
};
