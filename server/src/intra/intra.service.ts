import { HttpService } from '@nestjs/axios';
import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { catchError, firstValueFrom } from 'rxjs';
import { IntraTokenParams } from './interfaces/intra-token-params.interface';

@Injectable()
export class IntraService {
  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {}

  async getIntraUserToken(code: string): Promise<string> {
    const params: IntraTokenParams = {
      grant_type: this.configService.get('INTRA_AUTH_GRANT_TYPE'),
      client_id: this.configService.get('INTRA_CLIENT_ID'),
      client_secret: this.configService.get('INTRA_CLIENT_SECRET'),
      code,
      redirect_uri: this.configService.get('INTRA_AUTH_REDIRECT_URI'),
    };

    const { data } = await firstValueFrom(
      this.httpService
        .post('https://api.intra.42.fr/oauth/token', '', {
          params: params,
        })
        .pipe(
          catchError((error) => {
            const errorMessage = error.response.data.error_description;
            throw new BadRequestException(errorMessage);
          }),
        ),
    );

    let { access_token: token } = data;
    return token;
  }
}
