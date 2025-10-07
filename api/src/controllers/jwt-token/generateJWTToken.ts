import jwt from 'jsonwebtoken';

// Função para gerar um token JWT
export const generateJWTToken = (id: number, role: 'student' | 'teacher') => {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error('JWT secret environment variable must be defined');
    }

    // O token expira em 7 dias
    const expiresIn = '7d';

    // Gera o token com o id, role e tempo de expiração
    const token = jwt.sign({ id, role }, secret, { expiresIn });

    return token;
};
