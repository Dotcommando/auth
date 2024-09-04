import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';

import { createHash } from 'crypto';
import { Model, Types } from 'mongoose';

import { INVALID_TOKEN_REASON } from '../constants';
import { ITokenDoc } from '../schemas';
import { TokenValidation } from '../types';


export class TokenService {
  private jwtSecretKey = this.configService.get('JWT_SECRET_KEY');

  constructor(
    @InjectModel('Tokens') private readonly tokenModel: Model<ITokenDoc>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
  }

  public issueToken(
    userId: string | Types.ObjectId,
    tokenType: 'refresh' | 'access' = 'access',
  ): string {
    const options = { secret: this.jwtSecretKey };
    const now = Date.now();

    return this.jwtService.sign(
      {
        sub: String(userId),
        aud: this.configService.get('JWT_AUDIENCE'),
        iss: this.configService.get('JWT_ISSUER'),
        azp: this.configService.get('JWT_AUTHORIZED_PARTY'),
        exp: now + (tokenType === 'access'
          ? this.configService.get('JWT_ACCESS_TOKEN_EXPIRES_IN')
          : this.configService.get('JWT_REFRESH_TOKEN_EXPIRES_IN')),
        iat: now,
      },
      options,
    );
  }

  public async validateAccessToken(token: string): Promise<TokenValidation> {
    try {
      const decodedToken = this.jwtService.verify(token, { secret: this.jwtSecretKey });
      const encryptedToken = this.getEncryptedToken(token);
      const tokenDoc: ITokenDoc = await this.tokenModel.findOne({
        refreshToken: encryptedToken,
      }).exec();

      if (tokenDoc?.blacklisted) {
        return { valid: false, reason: INVALID_TOKEN_REASON.ACCESS_TOKEN_BLACKLISTED };
      }

      if (Date.now() > decodedToken.exp) {
        return { valid: false, reason: INVALID_TOKEN_REASON.ACCESS_TOKEN_EXPIRED };
      }

      return {
        valid: true,
        userId: decodedToken.sub,
      };
    } catch (error) {
      return {
        valid: false,
        reason: INVALID_TOKEN_REASON.ACCESS_TOKEN_CANNOT_BE_DECRYPTED,
      };
    }
  }

  public async validateRefreshToken(token: string): Promise<TokenValidation> {
    try {
      const decodedToken = this.jwtService.verify(token, { secret: this.jwtSecretKey });
      const encryptedToken = this.getEncryptedToken(token);
      const tokenDoc: ITokenDoc = await this.tokenModel.findOne({
        refreshToken: encryptedToken,
      }).exec();

      if (tokenDoc?.blacklisted) {
        return { valid: false, reason: INVALID_TOKEN_REASON.REFRESH_TOKEN_BLACKLISTED };
      }

      if (Date.now() > new Date(tokenDoc.expiredAfter).getTime()) {
        return { valid: false, reason: INVALID_TOKEN_REASON.REFRESH_TOKEN_EXPIRED };
      }

      return {
        valid: true,
        userId: decodedToken.sub,
      };
    } catch (error) {
      return {
        valid: false,
        reason: INVALID_TOKEN_REASON.REFRESH_TOKEN_CANNOT_BE_DECRYPTED,
      };
    }
  }

  private getEncryptedToken(token: string): string {
    return createHash('sha256')
      .update(`${this.jwtSecretKey}:${token}`)
      .digest('hex');
  }
}
