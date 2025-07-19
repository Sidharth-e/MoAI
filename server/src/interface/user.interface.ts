import { Document} from 'mongoose';

export interface IUser extends Document {
  oid?: string;
  sid?: string;
  sub?: string;
  tid?: string;
  uti?: string;
  ver?: string;
  aud?: string;
  iss?: string;
  iat?: number;
  nbf?: number;
  exp?: number;
  name?: string;
  nickName?: string;
  preferred_username?: string;
  email: string;
  emailVerified?: boolean;
  provider: 'azure' | 'local';
  role?: 'USER' | 'ADMIN';
  isAdmin?: boolean;
  password?: string;
}