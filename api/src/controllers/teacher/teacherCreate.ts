import { Request, Response } from 'express';
import { Database } from '../../database';

export const createTeacher = async (req: Request, res: Response) => {
    const { name, email, password, birthday, picture } = req.body;

    if (!name || !email || !password || !birthday || !picture) {
        return res.status(400).json({ message: 'All fields are required' });

    }

    try {
        const db = Database.getInstance();
        const result = await db.query(
            'INSERT INTO teachers (name, email, password, birthday, picture) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [name, email, password, birthday, picture]
        );

        const newTeacher = result.rows[0];
        return res.status(201).json(newTeacher);

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error creating teacher' });

    }
};