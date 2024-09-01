import { PickType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';

import { Transform } from 'class-transformer';
import { IsEmail, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';

import { PartialUserDto } from './user.dto';

import {
  IMAGE_ADDRESS_MAX_LENGTH,
  NAME_MAX_LENGTH,
  NAME_MIN_LENGTH,
  NAME_REGEXP,
  PHONE_NUMBER_MAX_LENGTH,
  PHONE_NUMBER_MIN_LENGTH,
  PROPERTY_LENGTH_64,
  USERNAME_MAX_LENGTH,
  USERNAME_MIN_LENGTH,
  USERNAME_REGEXP,
} from '../constants';
import { NotNull, ValidateIfNull } from '../decorators';
import { maxLengthStringMessage, minLengthStringMessage, toLowercase } from '../helpers';


export class UpdateUserDto extends PickType(
  PartialUserDto,
  [
    'firstName',
    'middleName',
    'lastName',
    'username',
    'avatar',
    'phoneNumber',
    'email',
  ] as const,
) {
  @ApiProperty({
    description: 'It matches \'_id\' from collection \'users\' from DB. Valid MongoDB compatible ObjectId. Cannot be null',
    example: '62a584a2f2fdd2cf95548236',
  })
  @NotNull()
  @IsString({ message: 'First name must be a string' })
  @MinLength(NAME_MIN_LENGTH, {
    message: minLengthStringMessage('First name', NAME_MIN_LENGTH),
  })
  @MaxLength(NAME_MAX_LENGTH, {
    message: maxLengthStringMessage('First name', NAME_MAX_LENGTH),
  })
  @Matches(NAME_REGEXP, {
    message: 'First name can contain just latin symbols, digits, underscores and single quotes',
  })
  @ValidateIfNull()
  firstName: string;

  @ApiProperty({
    description: `Middle name of user. Optional. It must have length up to ${NAME_MAX_LENGTH} characters. Can be null`,
    example: 'Douglas',
  })
  @IsString({ message: 'Middle name must be a string' })
  @IsOptional()
  @MaxLength(NAME_MAX_LENGTH, {
    message: maxLengthStringMessage('Middle name', NAME_MAX_LENGTH),
  })
  @Matches(NAME_REGEXP, {
    message: 'Middle name can contain just latin symbols, digits, underscores and single quotes',
  })
  middleName: string;

  @ApiProperty({
    description: `Last name of user. It must have length from ${NAME_MIN_LENGTH} to ${NAME_MAX_LENGTH} characters. Cannot be null`,
    example: 'Bradbury',
  })
  @NotNull()
  @IsString({ message: 'Last name must be a string' })
  @MinLength(NAME_MIN_LENGTH, {
    message: minLengthStringMessage('Last name', NAME_MIN_LENGTH),
  })
  @MaxLength(NAME_MAX_LENGTH, {
    message: maxLengthStringMessage('Last name', NAME_MAX_LENGTH),
  })
  @Matches(NAME_REGEXP, {
    message: 'Last name can contain just latin symbols, digits, underscores and single quotes',
  })
  @ValidateIfNull()
  lastName: string;

  @ApiProperty({
    description: `Username. Optional. It must have length from ${USERNAME_MIN_LENGTH} to ${USERNAME_MAX_LENGTH} characters. Cannot be null`,
    example: 'r.bradbury',
  })
  @NotNull()
  @IsString({ message: 'Username must be a string' })
  @MinLength(USERNAME_MIN_LENGTH, {
    message: minLengthStringMessage('Username', USERNAME_MIN_LENGTH),
  })
  @MaxLength(USERNAME_MAX_LENGTH, {
    message: maxLengthStringMessage('Username', USERNAME_MAX_LENGTH),
  })
  @Matches(USERNAME_REGEXP, {
    message: 'Username can contain just latin symbols, digits, and dots',
  })
  @ValidateIfNull()
  username: string;

  @ApiProperty({
    description: 'Filename with extension. Can be null',
    example: 'mikhail-filchushkin-2022-10-24-12-53-04-097-9800fc.jpg',
  })
  @IsOptional()
  @MaxLength(IMAGE_ADDRESS_MAX_LENGTH, {
    message: `Avatar file name length must be equal or shorter ${IMAGE_ADDRESS_MAX_LENGTH} characters`,
  })
  avatar: string;

  @ApiProperty({
    description: 'User phone number. Cannot be null',
    example: '+37477717509',
  })
  @NotNull()
  @IsString({
    message: 'Phone number must be a string',
  })
  @MinLength(PHONE_NUMBER_MIN_LENGTH, {
    message: `Minimal length for phone number is ${PHONE_NUMBER_MIN_LENGTH} symbols`,
  })
  @MaxLength(PHONE_NUMBER_MAX_LENGTH, {
    message: `Maximal length for phone number is ${PHONE_NUMBER_MAX_LENGTH} symbols`,
  })
  @ValidateIfNull()
  phoneNumber: string;

  @ApiProperty({
    description: 'User\'s email. Automatically converts to lowercase. Cannot be null',
    example: 'ray.bradbury@gmail.com',
  })
  @NotNull()
  @IsString({ message: 'Email must be a string' })
  @IsEmail()
  @Transform(toLowercase)
  @MaxLength(PROPERTY_LENGTH_64, {
    message: `Email must be equal or shorter than ${PROPERTY_LENGTH_64} symbols`,
  })
  @ValidateIfNull()
  email: string;
}
