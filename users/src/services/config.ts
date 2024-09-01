export default () => ({
  environment: process.env.ENVIRONMENT,
  baseUri: process.env.CUSTOMER_BASE_URI,
  gatewayPort: process.env.CUSTOMER_GATEWAY_PORT,
  host: process.env.USERS_SERVICE_HOST,
  port: process.env.USERS_SERVICE_PORT,
  secretKey: process.env.JWT_SECRET_KEY,
  accessTokenExpiresIn: Number(process.env.JWT_ACCESS_TOKEN_EXPIRES_IN),
  refreshTokenExpiresIn: Number(process.env.JWT_REFRESH_TOKEN_EXPIRES_IN),
  audience: process.env.JWT_AUDIENCE,
  issuer: process.env.JWT_ISSUER,
  authorizedParty: process.env.JWT_AUTHORIZED_PARTY,
});
