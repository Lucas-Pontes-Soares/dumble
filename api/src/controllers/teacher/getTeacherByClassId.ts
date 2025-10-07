import { Request, Response } from 'express';
import { Database } from '../../database';

// Adicionando o userAuthenticated ao Request original do Express
interface AuthenticatedRequest extends Request {
    userAuthenticated?: {
      id: number;
      role: string;
    };
}

export const getTeacherByClassId = async (req: AuthenticatedRequest, res: Response) => {
    const userAuthenticated = req.userAuthenticated;

    const { class_id } = req.params;

    if(!class_id) {
        return res.status(400).json({ message: 'Class ID is required' });
    }

    try {
        const db = Database.getInstance();
        const result = await db.query('SELECT teachers.* FROM classes INNER JOIN teachers ON teachers.id = classes.teacher_id WHERE classes.id = $1', [class_id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Teacher not found' });
        }

        const teacher = result.rows[0];

        return res.status(200).json({ teacher: teacher });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error fetching teacher' });

    }
};