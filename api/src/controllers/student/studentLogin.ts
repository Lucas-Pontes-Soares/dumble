import { Request, Response } from 'express';
import { Database } from '../../database';

export const loginStudent = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });

    }

    try {
        const db = Database.getInstance();
        const result = await db.query(
            'SELECT id, name, email, birthday, picture FROM students WHERE email = $1 AND password = $2',
            [email, password]
        );

        if (result.rowCount === 0) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        return res.status(200).json(result.rows[0]);

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error logging in student' });

    }
};