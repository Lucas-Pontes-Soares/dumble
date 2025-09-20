import { Request, Response } from 'express';
import { Database } from '../../database';

export const getTeacher = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const db = Database.getInstance();
        let result;

        if (id) {
            result = await db.query('SELECT id, name, email, birthday, picture FROM teachers WHERE id = $1', [id]);

            if (result.rowCount === 0) {
                return res.status(404).json({ message: 'Teacher not found' });
            }
            return res.status(200).json(result.rows[0]);

        } else {
            result = await db.query('SELECT id, name, email, birthday, picture FROM teachers');
            return res.status(200).json(result.rows);

        }

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error fetching teacher(s)' });

    }
};