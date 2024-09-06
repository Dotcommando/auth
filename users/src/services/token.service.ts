import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';

import { createHash } from 'crypto';
import { Model, Types } from 'mongoose';

import { INVALID_TOKEN_REASON } from '../constants';
import { ITokenDoc } from '../schemas';
import { TokenValidation } from '../types';
import { getIntFromEnv } from '../utils';


export class TokenService {
  private jwtSecretKey = this.configService.get('JWT_SECRET_KEY');
  private audience = this.configService.get('JWT_AUDIENCE');
  private issuer = this.configService.get('JWT_ISSUER');
  private authorizedParty = this.configService.get('JWT_AUTHORIZED_PARTY');
  private accessTokenExpiresIn = getIntFromEnv('JWT_ACCESS_TOKEN_EXPIRES_IN');
  private refreshTokenExpiresIn = getIntFromEnv('JWT_REFRESH_TOKEN_EXPIRES_IN');

  constructor(
    @InjectModel('Tokens') private readonly tokenModel: Model<ITokenDoc>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
  }

  public issueToken(
    userId: string | Types.ObjectId,
    tokenType: 'refresh' | 'access' = 'access',
  ): { token: string; expires: number } {
    const options = { secret: this.jwtSecretKey };
    const now = Date.now();
    const expires = now + (tokenType === 'access'
      ? this.accessTokenExpiresIn
      : this.refreshTokenExpiresIn);

    return {
      token: this.jwtService.sign(
        {
          sub: String(userId),
          aud: this.audience,
          iss: this.issuer,
          azp: this.authorizedParty,
          exp: expires,
          iat: now,
        },
        options,
      ),
      expires,
    };
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

      if (Date.now() > new Date(decodedToken.exp).getTime()) {
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
