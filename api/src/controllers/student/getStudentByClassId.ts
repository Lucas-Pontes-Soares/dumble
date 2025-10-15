import { Request, Response } from 'express';
import { Database } from '../../database';

// Adicionando o userAuthenticated ao Request original do Express
interface AuthenticatedRequest extends Request {
    userAuthenticated?: {
      id: number;
      role: string;
    };
}

export const getStudentByClassId = async (req: AuthenticatedRequest, res: Response) => {
    const userAuthenticated = req.userAuthenticated;

    const { class_code } = req.params;

    if(!class_code) {
        return res.status(400).json({ success: false, message: 'class_code is required' });
    }

    try {
        const db = Database.getInstance();

        const resultClassId = await db.query('SELECT * FROM classes WHERE code = $1', [class_code]);
        if (resultClassId.rowCount === 0) {
            return res.status(404).json({ success: false, message: 'Class not found' });
        }
        const class_id = resultClassId.rows[0].id;

        const result = await db.query('SELECT students.* FROM students_classes INNER JOIN students ON students.id = students_classes.student_id WHERE students_classes.class_id = $1', [class_id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ success: false, message: 'Students not found' });
        }

        const students = result.rows;

        return res.status(200).json({ success: true, students: students });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Error fetching students(s)' });

    }
};