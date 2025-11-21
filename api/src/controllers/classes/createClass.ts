import { Request, Response } from 'express';
import { Database } from '../../database';

// Adicionando o userAuthenticated ao Request original do Express
interface AuthenticatedRequest extends Request {
    userAuthenticated?: {
      id: number;
      role: string;
    };
}

export const createClass = async (req: AuthenticatedRequest, res: Response) => {
    const userAuthenticated = req.userAuthenticated;

    if (!userAuthenticated || userAuthenticated.role !== 'teacher') {
        return res.status(403).json({ success: false, message: 'Route only for teachers' });
    }

    const { title, description } = req.body;

    if (!title) {
        return res.status(400).json({ success: false, message: 'Title is required' });
    }

    try {
        const db = Database.getInstance();
        const result = await db.query(
            `INSERT INTO classes (title, description, teacher_id)
             VALUES ($1, $2, $3)
             RETURNING *`,
            [title, description,userAuthenticated.id]
        );
        return res.status(201).json({ success: true, message: 'Class created with success', class: result.rows[0] });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: 'Error on create class' });
    }
};