import { INVALID_TOKEN_REASON } from '../constants';


export type TokenValidation = IValidTokeResult | IInvalidTokeResult;

export interface IValidTokeResult {
  valid: true;
  userId: string;
}

export interface IInvalidTokeResult {
  valid: false;
  reason: INVALID_TOKEN_REASON;
}
