const bcrypt = require("bcrypt");
import { Request, Response } from 'express';
import { Database } from '../../database';
import { generateJWTToken } from '../jwt-token/generateJWTToken';

export const loginTeacher = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    try {
        const db = Database.getInstance();
        const result = await db.query(
            'SELECT * FROM teachers WHERE email = $1',
            [email]
        );

        // Verifica se o email existe
        if (result.rowCount === 0) {
            return res.status(401).json({ success: false, message: 'Invalid credentials. Email not found.' });
        }

        // Verifica se a senha está correta
        const teacher = result.rows[0];
        const isPasswordCorrect = await bcrypt.compare(password, teacher.password);

        if (!isPasswordCorrect) {
            return res.status(401).json({ success: false, message: 'Invalid credentials. Password Incorrect.' });
        }

        // Gera o token JWT
        const token = generateJWTToken(teacher.id, 'teacher');

        // Retorna os dados do professor
        delete teacher.password;
        return res.status(200).json({ success: true, teacher: teacher, JWTToken: token });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Error logging in teacher' });

    }
};