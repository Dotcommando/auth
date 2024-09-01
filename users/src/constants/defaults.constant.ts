export const AVATAR_FILE_BYTE_SIZE = Number(process.env.AVATAR_FILE_SIZE) * 1024;
export const BRAND_BGRD_SIZE = Number(process.env.BRAND_BGRD_SIZE) * 1024;
export const BRAND_LOGO_SIZE = Number(process.env.BRAND_LOGO_SIZE) * 1024;
export const PASSWORD_MIN_LENGTH = Number(process.env.PASSWORD_MIN_LENGTH);
export const PASSWORD_MAX_LENGTH = Number(process.env.PASSWORD_MAX_LENGTH);
export const USERNAME_MIN_LENGTH = Number(process.env.USERNAME_MIN_LENGTH);
export const USERNAME_MAX_LENGTH = Number(process.env.USERNAME_MAX_LENGTH);
export const NAME_MIN_LENGTH = Number(process.env.NAME_MIN_LENGTH);
export const NAME_MAX_LENGTH = Number(process.env.NAME_MAX_LENGTH);
export const IMAGE_BASE64_MAX_LENGTH = Number(process.env.IMAGE_BASE64_MAX_LENGTH);
export const IMAGE_ADDRESS_MAX_LENGTH = parseInt(process.env.IMAGE_ADDRESS_MAX_LENGTH);
export const PROPERTY_LENGTH_1 = Number(process.env.PROPERTY_LENGTH_1);
export const PROPERTY_LENGTH_4 = Number(process.env.PROPERTY_LENGTH_4);
export const PROPERTY_LENGTH_8 = Number(process.env.PROPERTY_LENGTH_8);
export const PROPERTY_LENGTH_16 = Number(process.env.PROPERTY_LENGTH_16);
export const PROPERTY_LENGTH_24 = Number(process.env.PROPERTY_LENGTH_24);
export const PROPERTY_LENGTH_32 = Number(process.env.PROPERTY_LENGTH_32);
export const PROPERTY_LENGTH_64 = Number(process.env.PROPERTY_LENGTH_64);
export const POSTAL_CODE_MIN_LENGTH = Number(process.env.POSTAL_CODE_MIN_LENGTH);
export const POSTAL_CODE_MAX_LENGTH = Number(process.env.POSTAL_CODE_MAX_LENGTH);
export const ADDRESSES_MAX_SIZE = Number(process.env.ADDRESSES_MAX_SIZE);
export const COMPANIES_MAX_SIZE = Number(process.env.COMPANIES_MAX_SIZE);
export const PHONE_NUMBERS_MAX_SIZE = Number(process.env.PHONE_NUMBERS_MAX_SIZE);
export const PHONE_NUMBER_MIN_LENGTH = Number(process.env.PHONE_NUMBER_MIN_LENGTH);
export const PHONE_NUMBER_MAX_LENGTH = Number(process.env.PHONE_NUMBER_MAX_LENGTH);
export const ORDERS_MAX_SIZE = Number(process.env.ORDERS_MAX_SIZE);
export const MAX_TIME_OF_REQUEST_WAITING = Number(process.env.MAX_TIME_OF_REQUEST_WAITING);
export const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;
export const JWT_MIN_TOKEN_LENGTH = Number(process.env.JWT_MIN_TOKEN_LENGTH);
export const JWT_MAX_TOKEN_LENGTH = Number(process.env.JWT_MAX_TOKEN_LENGTH);
export const COMPANY_NAME_MIN_LENGTH = parseInt(process.env.COMPANY_NAME_MIN_LENGTH);
export const COMPANY_NAME_MAX_LENGTH = parseInt(process.env.COMPANY_NAME_MAX_LENGTH);
export const BANK_DATA_MAX_LENGTH = parseInt(process.env.BANK_DATA_MAX_LENGTH);
export const BRAND_TITLE_HY_MAX_LENGTH = parseInt(process.env.BRAND_TITLE_HY_MAX_LENGTH);
export const BRAND_SHORT_DESCRIPTION_HY_MAX_LENGTH = parseInt(process.env.BRAND_SHORT_DESCRIPTION_HY_MAX_LENGTH);
export const BRAND_KEYWORDS_HY_MAX_LENGTH = parseInt(process.env.BRAND_KEYWORDS_HY_MAX_LENGTH);
export const BRAND_DESCRIPTION_HY_MAX_LENGTH = parseInt(process.env.BRAND_DESCRIPTION_HY_MAX_LENGTH);
export const BRAND_TITLE_RU_MAX_LENGTH = parseInt(process.env.BRAND_TITLE_RU_MAX_LENGTH);
export const BRAND_SHORT_DESCRIPTION_RU_MAX_LENGTH = parseInt(process.env.BRAND_SHORT_DESCRIPTION_RU_MAX_LENGTH);
export const BRAND_KEYWORDS_RU_MAX_LENGTH = parseInt(process.env.BRAND_KEYWORDS_RU_MAX_LENGTH);
export const BRAND_DESCRIPTION_RU_MAX_LENGTH = parseInt(process.env.BRAND_DESCRIPTION_RU_MAX_LENGTH);
export const BRAND_TITLE_EN_MAX_LENGTH = parseInt(process.env.BRAND_TITLE_EN_MAX_LENGTH);
export const BRAND_SHORT_DESCRIPTION_EN_MAX_LENGTH = parseInt(process.env.BRAND_SHORT_DESCRIPTION_EN_MAX_LENGTH);
export const BRAND_KEYWORDS_EN_MAX_LENGTH = parseInt(process.env.BRAND_KEYWORDS_EN_MAX_LENGTH);
export const BRAND_DESCRIPTION_EN_MAX_LENGTH = parseInt(process.env.BRAND_DESCRIPTION_EN_MAX_LENGTH);
export const MANAGER_NUMBER = parseInt(process.env.MANAGER_NUMBER);

export const MONGO_INITDB_DATABASE = process.env.MONGO_INITDB_DATABASE;
export const MONGO_INITDB_ROOT_USERNAME = process.env.MONGO_INITDB_ROOT_USERNAME;
export const MONGO_INITDB_ROOT_PASSWORD = process.env.MONGO_INITDB_ROOT_PASSWORD;
export const USERS_DB_PORT = parseInt(process.env.USERS_DB_PORT);
export const USERS_DB_DSN = process.env.USERS_DB_DSN
  .replace('${MONGO_INITDB_DATABASE}', MONGO_INITDB_DATABASE)
  .replace('${MONGO_INITDB_ROOT_USERNAME}', MONGO_INITDB_ROOT_USERNAME)
  .replace('${MONGO_INITDB_ROOT_PASSWORD}', MONGO_INITDB_ROOT_PASSWORD)
  .replace('${USERS_DB_PORT}', String(USERS_DB_PORT));
