import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

import {
  EMAIL_MAX_LENGTH,
  FIRST_NAME_MAX_LENGTH,
  LAST_NAME_MAX_LENGTH,
  MIDDLE_NAME_MAX_LENGTH,
  PASSWORD_MAX_LENGTH,
  USERNAME_MAX_LENGTH,
} from '../constants';


export class SignUpDto {
  @IsString()
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(EMAIL_MAX_LENGTH)
  email: string;

  @IsOptional()
  @IsString()
  @MaxLength(USERNAME_MAX_LENGTH)
  username?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(FIRST_NAME_MAX_LENGTH)
  firstName: string;

  @IsOptional()
  @IsString()
  @MaxLength(MIDDLE_NAME_MAX_LENGTH)
  middleName?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(LAST_NAME_MAX_LENGTH)
  lastName: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(PASSWORD_MAX_LENGTH)
  password: string;
}
