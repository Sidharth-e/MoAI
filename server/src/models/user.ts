import mongoose, {Schema } from 'mongoose';
import Joi from 'joi';
import passwordComplexity from 'joi-password-complexity';
import { IUser } from '../interface/user.interface';

// Define the user schema in TypeScript
const userSchema = new Schema<IUser>({
  oid: { type: String },
  sid: { type: String },
  sub: { type: String },
  tid: { type: String },
  uti: { type: String },
  ver: { type: String },
  aud: { type: String },
  iss: { type: String },
  iat: { type: Number },
  nbf: { type: Number },
  exp: { type: Number },
  name: { type: String },
  nickName: { type: String },
  preferred_username: { type: String },
  email: { type: String, required: true, unique: true },
  emailVerified: { type: Boolean, default: null },
  provider: { type: String, required: true, enum: ['azure', 'local'] },
  role: { type: String, default: 'USER', enum: ['USER', 'ADMIN'] },
  isAdmin: { type: Boolean, default: false },
  password: { type: String },
});

// Create the User model with the IUser interface
const User = mongoose.model<IUser>('User', userSchema);

// Define the validation function with TypeScript types
const validate = (data: Partial<IUser>) => {
  // Base schema for validation as a Record of Joi schemas
  const baseSchema: Record<string, Joi.Schema> = {
    provider: Joi.string().valid('azure', 'local').required(),
    email: Joi.string().email().required().label('Email'),
    role: Joi.string().valid('USER', 'ADMIN').label('Role'),
    isAdmin: Joi.boolean(),
    emailVerified: Joi.boolean().allow(null),
    name: Joi.string(),
    nickName: Joi.string(),
    oid: Joi.string(),
    sid: Joi.string(),
    sub: Joi.string(),
    tid: Joi.string(),
    uti: Joi.string(),
    ver: Joi.string(),
    aud: Joi.string(),
    iss: Joi.string(),
    iat: Joi.number(),
    nbf: Joi.number(),
    exp: Joi.number(),
    preferred_username: Joi.string(),
  };

  // If provider is local, require password; otherwise, optional
  if (data.provider === 'local') {
    baseSchema.password = passwordComplexity().required().label('Password');
  } else {
    baseSchema.password = Joi.string().optional().allow('').label('Password');
  }

  return Joi.object(baseSchema).validate(data);
};

export { User, validate, IUser };