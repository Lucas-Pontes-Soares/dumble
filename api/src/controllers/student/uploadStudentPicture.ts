import { Request, Response } from 'express';
import { Database } from '../../database';
import * as path from 'path';

// Adicionando o userAuthenticated ao Request original do Express
interface AuthenticatedRequest extends Request {
    userAuthenticated?: {
      id: number;
      role: string;
    };
}

export const uploadStudentPicture = async (req: AuthenticatedRequest, res: Response) => {
    const userAuthenticated = req.userAuthenticated;
    const { student_id } = req.params;
    const file = req.file;

    if(userAuthenticated?.role !== 'student'){
        return res.status(403).json({ success: false, message: 'Route only for students' });
    }

    if (!student_id) {
        return res.status(400).json({ success: false, message: 'Student ID is required' });
    }

    if (student_id !== String(userAuthenticated.id)) {
        return res.status(403).json({ success: false, message: 'Forbidden: You can only update your own account' });
    }

    if (!file) {
        return res.status(400).json({ success: false, message: 'file is required' });
    }
    
    const db = Database.getInstance();

    const filename = path.basename(file.path);

    try {
        const result = await db.query(
            `UPDATE students SET
                picture = $1,
                updated_at = NOW()
            WHERE id = $2
            RETURNING id, name, email, birthday, picture, created_at, updated_at`,
            [filename, student_id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }

        const student = result.rows[0];

        delete student.password;
        return res.status(200).json({ success: true, student: student });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Error updating student picture' });

    }
};
