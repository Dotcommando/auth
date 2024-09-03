import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

import { TOKEN_MAX_LENGTH } from '../constants';


export class AuthenticateDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(TOKEN_MAX_LENGTH)
  accessToken: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(TOKEN_MAX_LENGTH)
  refreshToken: string;
}
