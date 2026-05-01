import jwt from "jsonwebtoken";
import { config } from "../config";

interface TokenPayload {
  id: string;
  email: string;
  role: string;
  name: string;
}

export function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload, config.jwt.secret, { expiresIn: config.jwt.expiry } as jwt.SignOptions);
}

export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, config.jwt.secret) as TokenPayload;
}
