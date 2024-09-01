import { IToken } from '../types';

export type RefreshTokenData = Omit<IToken, 'id'>;
