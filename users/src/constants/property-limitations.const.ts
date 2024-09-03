import { getIntFromEnv } from '../utils';


export const EMAIL_MAX_LENGTH = getIntFromEnv('EMAIL_MAX_LENGTH', 80);
export const USERNAME_MIN_LENGTH = getIntFromEnv('USERNAME_MIN_LENGTH', 5);
export const USERNAME_MAX_LENGTH = getIntFromEnv('USERNAME_MAX_LENGTH', 80);
export const NAME_MIN_LENGTH = getIntFromEnv('NAME_MIN_LENGTH', 1);
export const FIRST_NAME_MAX_LENGTH = getIntFromEnv('FIRST_NAME_MAX_LENGTH', 80);
export const MIDDLE_NAME_MAX_LENGTH = getIntFromEnv('MIDDLE_NAME_MAX_LENGTH', 80);
export const LAST_NAME_MAX_LENGTH = getIntFromEnv('LAST_NAME_MAX_LENGTH', 80);
export const PASSWORD_MAX_LENGTH = getIntFromEnv('PASSWORD_MAX_LENGTH', 80);
export const PHONE_NUMBER_MAX_LENGTH = getIntFromEnv('PHONE_NUMBER_MAX_LENGTH', 16);
export const TOKEN_MAX_LENGTH = getIntFromEnv('TOKEN_MAX_LENGTH', 512);
