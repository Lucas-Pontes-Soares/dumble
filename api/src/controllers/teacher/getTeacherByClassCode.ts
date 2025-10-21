import { Request, Response } from 'express';
import { Database } from '../../database';

// Adicionando o userAuthenticated ao Request original do Express
interface AuthenticatedRequest extends Request {
    userAuthenticated?: {
      id: number;
      role: string;
    };
}

export const getTeacherByClassCode = async (req: AuthenticatedRequest, res: Response) => {
    const userAuthenticated = req.userAuthenticated;

    const { class_code } = req.params;

    if(!class_code) {
        return res.status(400).json({ success: false, message: 'class_code is required' });
    }

    try {
        const db = Database.getInstance();

        const resultClass = await db.query('SELECT * FROM classes WHERE code = $1', [class_code]);
        if (resultClass.rowCount === 0) {
            return res.status(404).json({ success: false, message: 'Class not found' });
        }
        const classInfo = resultClass.rows[0];

        const result = await db.query('SELECT teachers.* FROM classes INNER JOIN teachers ON teachers.id = classes.teacher_id WHERE classes.id = $1', [classInfo.id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ success: false, message: 'Teacher not found' });
        }

        const teacher = result.rows[0];

        return res.status(200).json({ success: true, teacher: teacher, class: classInfo });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Error fetching teacher' });

    }
};