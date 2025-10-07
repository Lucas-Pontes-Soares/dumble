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

    const { class_id } = req.params;

    if(!class_id) {
        return res.status(400).json({ message: 'Class ID is required' });
    }

    try {
        const db = Database.getInstance();
        const result = await db.query('SELECT students.* FROM students_classes INNER JOIN students ON students.id = students_classes.student_id WHERE students_classes.class_id = $1', [class_id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Students not found' });
        }

        const students = result.rows;

        return res.status(200).json({ students: students });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error fetching students(s)' });

    }
};