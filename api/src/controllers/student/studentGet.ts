import { Request, Response } from 'express';
import { Database } from '../../database';

// Adicionando o userAuthenticated ao Request original do Express
interface AuthenticatedRequest extends Request {
    userAuthenticated?: {
      id: number;
      role: string;
    };
}

export const getStudent = async (req: AuthenticatedRequest, res: Response) => {
    const userAuthenticated  = req.userAuthenticated;

    const { id } = req.params;

    try {
        const db = Database.getInstance();
        const result = await db.query('SELECT id, name, email, birthday, picture FROM students WHERE id = $1', [id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Student not found' });
        }

        const student = result.rows[0];

        delete student.password;
        return res.status(200).json({ student: student });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error fetching student(s)' });

    }
};