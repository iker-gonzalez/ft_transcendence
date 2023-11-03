import { ApiProperty } from '@nestjs/swagger';
import { swaggerConstants } from '../../../config/swagger.constants';

class LeaderboardUser {
  username: string;
  intraId: number;
  avatar: string;
}

class LeaderboardStats {
  rank: number;
  wins: number;
  losses: number;
  totalGames: number;
  totalGameTime: number;
}

class LeaderboardItem {
  user: LeaderboardUser;
  stats: LeaderboardStats;
}

export class FetchLeaderboardResponseDto {
  @ApiProperty({
    description:
      swaggerConstants.dto.fetchLeaderboardResponseDto.found.description,
    example: swaggerConstants.dto.fetchLeaderboardResponseDto.found.example,
  })
  found: number;

  @ApiProperty({
    description:
      swaggerConstants.dto.fetchLeaderboardResponseDto.data.description,
    example: swaggerConstants.dto.fetchLeaderboardResponseDto.data.example,
  })
  data: LeaderboardItem[];
}
