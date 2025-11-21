const bcrypt = require("bcrypt");
import { Request, Response } from 'express';
import { Database } from '../../database';

export const createTeacher = async (req: Request, res: Response) => {
    const { name, email, password, birthday } = req.body;

    if (!name || !email || !password || !birthday) {
        return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    try {
        // Defina o 'salt' (o número de rodadas de criptografia)
        const saltRounds = 10;
        // Gere o hash da senha
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const db = Database.getInstance();
        const result = await db.query(
            'INSERT INTO teachers (name, email, password, birthday) VALUES ($1, $2, $3, $4) RETURNING *',
            [name, email, hashedPassword, birthday]
        );

        const newTeacher = result.rows[0];

        delete newTeacher.password;
        return res.status(201).json({ success: true, teacher: newTeacher });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Error creating teacher' });

    }
};