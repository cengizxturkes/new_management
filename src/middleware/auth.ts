import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';

interface JwtPayload {
  id: string;
  email: string;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export const protect = async (
  req: Request, 
  res: Response, 
  next: NextFunction
): Promise<void> => {
  try {
    // Token'ı header'dan al
    let token;
    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      res.status(401).json({
        status: 'error',
        message: 'Lütfen giriş yapın'
      });
      return;
    }

    // Token'ı doğrula
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;

    // Kullanıcıyı bul
    const user = await User.findById(decoded.id);
    if (!user) {
      res.status(401).json({
        status: 'error',
        message: 'Bu token\'a ait kullanıcı artık mevcut değil'
      });
      return;
    }

    // Kullanıcıyı request'e ekle
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({
      status: 'error',
      message: 'Yetkilendirme hatası'
    });
    return;
  }
};

export const restrictTo = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        status: 'error',
        message: 'Bu işlem için yetkiniz yok'
      });
      return;
    }
    next();
  };
}; 