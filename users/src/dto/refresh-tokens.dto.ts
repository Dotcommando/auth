import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

import { TOKEN_MAX_LENGTH } from '../constants';


export class RefreshTokensDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(TOKEN_MAX_LENGTH)
  refreshToken: string;
}
