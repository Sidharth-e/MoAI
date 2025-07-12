import jwt from "jsonwebtoken";

interface UserToken {
  email: string;
  name: string;
  provider:string;
  role:string;
  isAdmin:boolean;
}

/**
 * Signs a JWT with specific user fields.
 * @param token The source object containing user info.
 * @param secret The JWT secret.
 */
export function signJwt(token: UserToken, secret: string): string {
  const user = {
    email: token.email,
    name: token.name,
    provider:token.provider,
    role:token.role,
    isAdmin:token.isAdmin
  };
  return jwt.sign(user, secret, { expiresIn: "1h" });
}