export type UserCredentialsReq = IEmailPassword | IUsernamePassword;

export interface IEmailPassword {
  email: string;
  password: string;
}

export interface IUsernamePassword {
  username: string;
  password: string;
}
