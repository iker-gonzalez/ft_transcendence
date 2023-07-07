import { HttpService } from '@nestjs/axios';
import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { catchError, firstValueFrom } from 'rxjs';
import { IntraTokenParams } from './interfaces/intra-token-params.interface';
import { IntraUserDataDto } from 'src/auth/dto/intra-user-data.dto';

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

  async getIntraUserInfo(token: string): Promise<IntraUserDataDto> {
    const { data } = await firstValueFrom(
      this.httpService
        .get('https://api.intra.42.fr/v2/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .pipe(
          catchError((error) => {
            const errorMessage = error.response.data.error_description;
            throw new BadRequestException(errorMessage);
          }),
        ),
    );

    // Extract intra id
    const userData = new IntraUserDataDto();
    userData['intraId'] = data.id;
    userData['username'] = data.login;
    userData['email'] = data.email;
    userData['avatar'] = data.image.link;

    return userData;
  }
}
