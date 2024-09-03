export enum INVALID_TOKEN_REASON {
  ACCESS_TOKEN_WRONG_USER = 'Access token owner does not match userId',
  ACCESS_TOKEN_BLACKLISTED = 'Access token is blacklisted',
  ACCESS_TOKEN_EXPIRED = 'Access token is expired',
  ACCESS_TOKEN_CANNOT_BE_DECRYPTED = 'Access token cannot be decrypted',
  REFRESH_TOKEN_WRONG_USER = 'Refresh token owner does not match userId',
  REFRESH_TOKEN_BLACKLISTED = 'Refresh token is blacklisted',
  REFRESH_TOKEN_EXPIRED = 'Refresh token is expired',
  REFRESH_TOKEN_CANNOT_BE_DECRYPTED = 'Refresh token cannot be decrypted',
}
