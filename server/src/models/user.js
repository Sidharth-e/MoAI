const mongoose = require("mongoose");
const Joi = require("joi");
const passwordComplexity = require("joi-password-complexity");

const userSchema = new mongoose.Schema({
  oid: { type: String }, // Azure AD Object ID
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
  email: { type: String, required: true, unique: true }, // Ensure uniqueness
  emailVerified: { type: Boolean, default: null },
  provider: { type: String, required: true, enum: ["azure", "local"] },
  role: { type: String, default: "USER", enum: ["USER", "ADMIN"] },
  isAdmin: { type: Boolean, default: false },
  password: { type: String }, // Only relevant if provider is local
});

const User = mongoose.model("User", userSchema);

// Validation function covering both local and SSO (Azure) logins
const validate = (data) => {
  // For provider = 'local', password is required; for 'azure', only some fields are required
  const baseSchema = {
    provider: Joi.string().valid("azure", "local").required(),
    email: Joi.string().email().required().label("Email"),
    role: Joi.string().valid("USER", "ADMIN").label("Role"),
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

  // If provider is local, require password, otherwise optional
  if (data.provider === "local") {
    baseSchema.password = passwordComplexity().required().label("Password");
  } else {
    baseSchema.password = Joi.string().optional().allow("").label("Password");
  }

  return Joi.object(baseSchema).validate(data);
};

module.exports = { User, validate };