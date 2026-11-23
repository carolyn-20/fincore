import jwt from 'jsonwebtoken';
import { HttpError } from '../lib/errors.js';
export function authenticate(req,_res,next){
 const token=(req.headers.authorization||'').replace(/^Bearer\s+/i,'');
 if(!token) return next(new HttpError(401,'Authentication required'));
 try { req.user=jwt.verify(token,process.env.JWT_SECRET); next(); } catch { next(new HttpError(401,'Invalid or expired session')); }
}
export const authorize = (...roles) => (req,_res,next) => roles.includes(req.user?.role) ? next() : next(new HttpError(403,'Insufficient permissions'));
