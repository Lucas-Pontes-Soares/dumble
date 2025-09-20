import { Request, Response } from 'express';
import { Database } from '../../database';

export const deleteTeacher = async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({ message: 'Teacher ID is required' });

    }

    try {
        const db = Database.getInstance();
        const result = await db.query('DELETE FROM teachers WHERE id = $1 RETURNING *', [id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Teacher not found' });

        }
        return res.status(200).json({ message: 'Teacher deleted', teacher: result.rows[0] });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error deleting teacher' });

    }
};