import { Request, Response } from 'express';
import { Database } from '../../database';

export const updateTeacher = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name, email, password, birthday, picture } = req.body;

    if (!id) {
        return res.status(400).json({ message: 'Teacher ID is required' });
    }

    try {
        const db = Database.getInstance();
        const result = await db.query(
            `UPDATE teachers SET
                name = COALESCE($1, name),
                email = COALESCE($2, email),
                password = COALESCE($3, password),
                birthday = COALESCE($4, birthday),
                picture = COALESCE($5, picture)
            WHERE id = $6
            RETURNING id, name, email, birthday, picture`,
            [name, email, password, birthday, picture, id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Teacher not found' });
        }

        return res.status(200).json(result.rows[0]);

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error updating teacher' });

    }
};