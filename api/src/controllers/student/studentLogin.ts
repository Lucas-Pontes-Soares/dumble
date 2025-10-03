const bcrypt = require("bcrypt");
import { Request, Response } from 'express';
import { Database } from '../../database';
import { generateJWTToken } from '../jwt-token/jwt-token-generate';

export const loginStudent = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    try {
        const db = Database.getInstance();
        const result = await db.query(
            'SELECT * FROM students WHERE email = $1',
            [email]
        );

        // Verifica se o email existe
        if (result.rowCount === 0) {
            return res.status(401).json({ message: 'Invalid credentials. Email not found.' });
        }

        // Verifica se a senha está correta
        const student = result.rows[0];
        const isPasswordCorrect = await bcrypt.compare(password, student.password);

        if (!isPasswordCorrect) {
            return res.status(401).json({ message: 'Invalid credentials. Password Incorrect.' });
        }

        // Gera o token JWT
        const token = generateJWTToken(student.id, 'student');

        // Retorna os dados do aluno
        delete student.password;
        return res.status(200).json({ student: student, JWTToken: token});

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error logging in Student' });

    }
};