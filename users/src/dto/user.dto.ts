import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';

import { Transform, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsDefined,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Types } from 'mongoose';

import {
  ADDRESSES_MAX_SIZE,
  IMAGE_ADDRESS_MAX_LENGTH,
  NAME_MAX_LENGTH,
  NAME_MIN_LENGTH,
  NAME_REGEXP,
  ORDERS_MAX_SIZE,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  PHONE_NUMBER_MAX_LENGTH,
  PHONE_NUMBER_MIN_LENGTH,
  PROPERTY_LENGTH_64,
  ROLE,
  USERNAME_MAX_LENGTH,
  USERNAME_MIN_LENGTH,
  USERNAME_REGEXP,
} from '../constants';
import {
  maxLengthStringMessage,
  minLengthStringMessage,
  sanitizeStringIfNotNull,
  toArrayOfObjectIds,
  toBoolean,
  toLowercase,
  toObjectId,
} from '../helpers';
import { IUser } from '../types';


export class UserDto implements IUser {
  @ApiProperty({
    description: 'It matches \'_id\' from collection \'users\' from DB. Valid MongoDB compatible ObjectId',
    required: true,
    example: '62a584a2f2fdd2cf95548236',
  })
  @IsDefined()
  @Transform(toObjectId)
  @Type(() => Types.ObjectId)
  id: Types.ObjectId;

  @ApiProperty({
    description: `First name of user. It must have length from ${NAME_MIN_LENGTH} to ${NAME_MAX_LENGTH} characters`,
    required: true,
    example: 'Ray',
  })
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
  @Transform(sanitizeStringIfNotNull)
  firstName: string;

  @ApiProperty({
    description: `Middle name of user. Optional. It must have length up to ${NAME_MAX_LENGTH} characters`,
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
  @Transform(sanitizeStringIfNotNull)
  middleName: string;

  @ApiProperty({
    description: `Last name of user. It must have length from ${NAME_MIN_LENGTH} to ${NAME_MAX_LENGTH} characters`,
    required: true,
    example: 'Bradbury',
  })
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
  @Transform(sanitizeStringIfNotNull)
  lastName: string;

  @ApiProperty({
    description: `Username. Optional. It must have length from ${USERNAME_MIN_LENGTH} to ${USERNAME_MAX_LENGTH} characters`,
    required: true,
    example: 'r.bradbury',
  })
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
  @Transform(sanitizeStringIfNotNull)
  username: string;

  @ApiProperty({
    description: 'User\'s email. Automatically converts to lowercase',
    required: true,
    example: 'ray.bradbury@gmail.com',
  })
  @IsString({ message: 'Email must be a string' })
  @IsEmail()
  @Transform(toLowercase)
  @MaxLength(PROPERTY_LENGTH_64, {
    message: `Email must be equal or shorter than ${PROPERTY_LENGTH_64} symbols`,
  })
  @Transform(sanitizeStringIfNotNull)
  email: string;

  @ApiProperty({
    description: 'Filename with extension',
    example: 'mikhail-filchushkin-2022-10-24-12-53-04-097-9800fc.jpg',
  })
  @IsOptional()
  @MaxLength(IMAGE_ADDRESS_MAX_LENGTH, {
    message: `Avatar file name length must be equal or shorter ${IMAGE_ADDRESS_MAX_LENGTH} characters`,
  })
  @Transform(sanitizeStringIfNotNull)
  avatar: string;

  @ApiProperty({
    description: 'Links to user addresses. Array of valid MongoDB compatible ObjectId',
    required: true,
    uniqueItems: true,
    example: [ '62a588187cebf9ce17bea893', '62a826ad1774f165f826923f' ],
  })
  @IsArray({ message: 'Addresses must be an array' })
  @ValidateNested({ each: true })
  @ArrayMaxSize(ADDRESSES_MAX_SIZE)
  @Transform(toArrayOfObjectIds('Addresses'))
  @Type(() => Types.ObjectId)
  addresses: Types.ObjectId[];

  @ApiProperty({
    description: 'User phone number',
    required: true,
    example: '+37477717509',
  })
  @IsString({
    message: 'Phone number must be a string',
  })
  @MinLength(PHONE_NUMBER_MIN_LENGTH, {
    message: `Minimal length for phone number is ${PHONE_NUMBER_MIN_LENGTH} symbols`,
  })
  @MaxLength(PHONE_NUMBER_MAX_LENGTH, {
    message: `Maximal length for phone number is ${PHONE_NUMBER_MAX_LENGTH} symbols`,
  })
  @Transform(sanitizeStringIfNotNull)
  phoneNumber: string;

  @ApiProperty({
    description: 'Role of user in the system',
    enum: ROLE,
    enumName: 'ROLE',
    example: ROLE.USER,
  })
  @IsEnum(ROLE, {
    message: 'The role must be a valid value of the enum',
  })
  role: ROLE;

  @ApiProperty({
    description: 'List of user orders. Array of valid MongoDB compatible ObjectId',
    required: true,
    uniqueItems: true,
    example: [ '62a827181774f165f8269247', '62a8277e1774f165f826924f' ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @ArrayMaxSize(ORDERS_MAX_SIZE)
  @Transform(toArrayOfObjectIds('Orders'))
  @Type(() => Types.ObjectId)
  orders: Types.ObjectId[];

  @ApiProperty({
    description: 'Is user email confirmed or not',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  emailConfirmed: boolean;

  @ApiProperty({
    description: 'Is user phone number confirmed or not',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  phoneConfirmed: boolean;

  @ApiProperty({
    description: `Password of user. It must have length from ${PASSWORD_MIN_LENGTH} to ${PASSWORD_MAX_LENGTH} symbols`,
    required: true,
    example: 'W746g#thTER%7',
  })
  @IsString({ message: 'Password must be a string' })
  @MinLength(PASSWORD_MIN_LENGTH, {
    message: minLengthStringMessage('Password', PASSWORD_MIN_LENGTH),
  })
  @MaxLength(PASSWORD_MAX_LENGTH, {
    message: maxLengthStringMessage('Password', PASSWORD_MAX_LENGTH),
  })
  password: string;

  @ApiProperty({
    description: 'Is user deactivated or not',
    example: true,
  })
  @IsBoolean()
  @Transform(toBoolean)
  @IsOptional()
  deactivated: boolean;
}

export class PartialUserDto extends PartialType(UserDto) {}
