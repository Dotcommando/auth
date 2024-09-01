import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';

import { Transform, TransformFnParams, Type } from 'class-transformer';
import { IsBoolean, IsDateString, IsDefined, IsString, MaxLength, MinLength } from 'class-validator';
import { Types } from 'mongoose';

import { BEARER_PREFIX, JWT_MAX_TOKEN_LENGTH, JWT_MIN_TOKEN_LENGTH } from '../constants';
import { maxLengthStringMessage, minLengthStringMessage, toBoolean, toObjectId } from '../helpers';
import { IToken } from '../types';


export class TokenDto implements IToken {
  @ApiProperty({
    description: 'It matches \'_id\' from collection \'tokens\' from DB. Valid MongoDB compatible ObjectId',
    required: true,
    example: '62a584a2f2fdd2cf95548236',
  })
  @IsDefined()
  @Transform(toObjectId)
  @Type(() => Types.ObjectId)
  id: Types.ObjectId;

  @ApiProperty({
    description: 'It matches \'_id\' from collection \'users\' from DB. This shows who owns the token. Valid MongoDB compatible ObjectId',
    required: true,
    example: '62a584a2f2fdd2cf95548236',
  })
  @IsDefined()
  @Transform(toObjectId)
  @Type(() => Types.ObjectId)
  userId: Types.ObjectId;

  @ApiProperty({
    description: `Access token. It must have length from ${JWT_MIN_TOKEN_LENGTH} to ${JWT_MAX_TOKEN_LENGTH} symbols. Bearer prefix will be removed automatically`,
    required: true,
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2MmE4NWJhNjJhYWY3MzE5ZTI1ZTRiZGQiLCJhdWQiOiJodHRwczovL2pldGYuYW0iLCJpc3MiOiJodHRwczovL2pldGYuYW0iLCJhenAiOiJqZXRmLmFtIiwiZXhwIjoxNjU1MjAwNzY4NjUyLCJpYXQiOjE2NTUyMDA2Nzg2NTIsImxvZ2luT3JpZ2luIjoidXNlcm5hbWVfcGFzc3dvcmQifQ.a7Ct49fucHp-o-6Xzdj_7dEcw1pQKS2dLqWEr8zLGu4',
  })
  @IsString({ message: 'Access token must be a string' })
  @Transform((data: TransformFnParams) => data.value?.replace(BEARER_PREFIX, ''))
  @MinLength(JWT_MIN_TOKEN_LENGTH, {
    message: minLengthStringMessage('Access token', JWT_MIN_TOKEN_LENGTH),
  })
  @MaxLength(JWT_MAX_TOKEN_LENGTH, {
    message: maxLengthStringMessage('Access token', JWT_MAX_TOKEN_LENGTH),
  })
  accessToken: string;

  @ApiProperty({
    description: `Refresh token. Database keeps SHA-256 hash of it. Refresh token must have length from ${JWT_MIN_TOKEN_LENGTH} to ${JWT_MAX_TOKEN_LENGTH} symbols. Bearer prefix will be removed automatically`,
    required: true,
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2MmE4NWJhNjJhYWY3MzE5ZTI1ZTRiZGQiLCJhdWQiOiJodHRwczovL2pldGYuYW0iLCJpc3MiOiJodHRwczovL2pldGYuYW0iLCJhenAiOiJqZXRmLmFtIiwiZXhwIjoxNjU1MjAxMjc4NjUyLCJpYXQiOjE2NTUyMDA2Nzg2NTIsImxvZ2luT3JpZ2luIjoidXNlcm5hbWVfcGFzc3dvcmQifQ.trFdyGJw-_IAcEq8LFRuNAqkbV-03z2onIhVK1MB2mA',
  })
  @IsString({ message: 'Refresh token must be a string' })
  @Transform((data: TransformFnParams) => data.value?.replace(BEARER_PREFIX, ''))
  @MinLength(JWT_MIN_TOKEN_LENGTH, {
    message: minLengthStringMessage('Refresh token', JWT_MIN_TOKEN_LENGTH),
  })
  @MaxLength(JWT_MAX_TOKEN_LENGTH, {
    message: maxLengthStringMessage('Refresh token', JWT_MAX_TOKEN_LENGTH),
  })
  refreshToken: string;

  @ApiProperty({
    description: 'It matches \'_id\' from collection \'user_agents\' from DB. Valid MongoDB compatible ObjectId',
    required: true,
    example: '62a827c91774f165f8269257',
  })
  @IsDefined()
  @Transform(toObjectId)
  @Type(() => Types.ObjectId)
  issuedForUserAgent: Types.ObjectId;

  @ApiProperty({
    description: 'JS string of Date. Shows when token pare was issued',
    required: true,
    example: 'Tue Jun 14 2022 19:42:47 GMT+0400',
  })
  @IsDateString()
  issuedAt: Date;

  @ApiProperty({
    description: 'JS string of Date. Shows when the refresh token will be expired',
    required: true,
    example: 'Tue Jun 14 2022 23:42:47 GMT+0400',
  })
  @IsDateString()
  expiredAfter: Date;

  @ApiProperty({
    description: 'It can be true in cases if user reissued pare of tokens or if user logged out. Or user hacked and he communicated with us and asked to unlogin him from all devices',
    required: true,
    example: true,
  })
  @IsBoolean()
  @Transform(toBoolean)
  blacklisted: boolean;
}

export class PartialTokenDto extends PartialType(TokenDto) {}
