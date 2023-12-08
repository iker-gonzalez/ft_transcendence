import { IsEnum, IsNumber, IsString, IsStrongPassword } from 'class-validator';

export class JoinRoomPayloadDto {
  @IsStrongPassword({
    minLength: 6,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  })
  password: string;

  @IsString()
  roomName: string;

  @IsNumber()
  intraId: number;

  @IsEnum(['PROTECTED', 'PRIVATE'])
  type: string;

  constructor(joinRoomPayloadDto: JoinRoomPayloadDto) {
    this.password = joinRoomPayloadDto.password;
    this.roomName = joinRoomPayloadDto.roomName;
    this.intraId = joinRoomPayloadDto.intraId;
    this.type = joinRoomPayloadDto.type;
  }
}
