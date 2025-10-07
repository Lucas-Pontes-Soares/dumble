import { Request, Response } from 'express';
import { Database } from '../../database';

// Adicionando o userAuthenticated ao Request original do Express
interface AuthenticatedRequest extends Request {
    userAuthenticated?: {
      id: number;
      role: string;
    };
}

export const deleteTeacher = async (req: AuthenticatedRequest, res: Response) => {
    const userAuthenticated = req.userAuthenticated;

    const { teacher_id } = req.params;

    if(userAuthenticated?.role !== 'teacher'){
        return res.status(403).json({ message: 'Route only for teachers' });
    }

    if (!teacher_id) {
        return res.status(400).json({ message: 'Teacher ID is required' });
    }

    if (teacher_id !== String(userAuthenticated.id)) {
        return res.status(403).json({ message: 'Forbidden: You can only delete your own account' });
    }

    try {
        const db = Database.getInstance();
        const result = await db.query('DELETE FROM teachers WHERE id = $1 RETURNING *', [teacher_id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Teacher not found' });
        }

        const teacher = result.rows[0];
        
        delete teacher.password;
        return res.status(200).json({ message: 'Teacher deleted', teacher: teacher });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error deleting teacher' });

    }
};