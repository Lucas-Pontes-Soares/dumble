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

export const uploadTeacherPicture = async (req: AuthenticatedRequest, res: Response) => {
    const userAuthenticated = req.userAuthenticated;
    const { teacher_id } = req.params;
    const file = req.file;

    if(userAuthenticated?.role !== 'teacher'){
        return res.status(403).json({ success: false, message: 'Route only for students' });
    }

    if (!teacher_id) {
        return res.status(400).json({ success: false, message: 'Teacher ID is required' });
    }

    if (teacher_id !== String(userAuthenticated.id)) {
        return res.status(403).json({ success: false, message: 'Forbidden: You can only update your own account' });
    }

    if (!file) {
        return res.status(400).json({ success: false, message: 'file is required' });
    }
    
    const db = Database.getInstance();

    const filename = path.basename(file.path);

    try {
        const result = await db.query(
            `UPDATE teachers SET
                picture = $1,
                updated_at = NOW()
            WHERE id = $2
            RETURNING id, name, email, birthday, picture, created_at, updated_at`,
            [filename, teacher_id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ success: false, message: 'Teacher not found' });
        }

        const teacher = result.rows[0];

        delete teacher.password;
        return res.status(200).json({ success: true, teacher: teacher });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Error updating teacher picture' });

    }
};
