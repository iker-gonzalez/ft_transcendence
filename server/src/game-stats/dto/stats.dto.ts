import { IsDateString, IsNumber, IsObject, IsPositive } from 'class-validator';
import { UserStatObjectDto } from './user-stat-object.dto';

export class StatsDto {
  @IsNumber()
  @IsPositive()
  rank: number;

  @IsNumber()
  @IsPositive()
  totalGames: number;

  @IsNumber()
  @IsPositive()
  wins: number;

  @IsNumber()
  @IsPositive()
  losses: number;

  @IsNumber()
  @IsPositive()
  longestWinStreak: number;

  @IsNumber()
  @IsPositive()
  currentWinStreak: number;

  @IsDateString()
  busiestDay: {
    date: string;
    count: number;
  };

  @IsNumber()
  @IsPositive()
  longestMatch: number;

  @IsNumber()
  @IsPositive()
  quickestWin: number;

  @IsObject()
  nemesis: UserStatObjectDto;

  @IsObject()
  victim: UserStatObjectDto;
}
