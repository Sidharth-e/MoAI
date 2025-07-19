import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { User } from '../models/user';
import { AuthenticatedRequest } from '../interface/authenticateMiddleware.interface';


const authenticateMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  const token = authHeader.substring(7);
  try {
    if(!process.env.NEXTAUTH_SECRET){
     return res.status(401).json({ message: 'No NEXTAUTH_SECRET added' }); 
    }
    // Use the same secret as NextAuth uses for NEXTAUTH_SECRET
    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET) as JwtPayload;
    const email = decoded.email || decoded.user?.email;
    if (!email) {
      return res.status(401).json({ message: 'Invalid token: Email not found.' });
    }

    // Find user by email
    const user = await User.findOne({ email }).select('_id email');
    if (!user) {
      return res.status(401).json({ message: 'User not found.' });
    }

    // Attach user info to request
    req.user = {
      _id: user._id.toString(),
      email: user.email,
      role: decoded.role, // Optional: pass through any claims from JWT
      isAdmin: decoded.isAdmin, // Optional
    };

    next();
  } catch (err) {
    return res.status(400).json({ message: 'Invalid token.' });
  }
};

export default authenticateMiddleware;