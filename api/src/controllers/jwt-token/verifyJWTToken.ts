import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Interface para estender o objeto Request e adicionar a propriedade 'user'
interface AuthenticatedRequest extends Request {
    userAuthenticated?: { id: number; role: string; };
}

// Middleware para verificar o token JWT
export const verifyJWTToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
        return res.status(401).json({ message: 'Token de autenticação não fornecido.' });
    }

    // O token vem no formato "Bearer <token>"
    const token = authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Formato de token inválido.' });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error('JWT secret environment variable must be defined');
    }

    // Verifica o token
    jwt.verify(token, secret, (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: 'Token inválido ou expirado.' });
        }

        // Adiciona os dados do usuário (payload) ao objeto de requisição
        req.userAuthenticated = decoded as { id: number; role: string; };

        // Continua para a próxima rota
        next();
    });
};