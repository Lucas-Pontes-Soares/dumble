import { Request, Response } from 'express';
import { Database } from '../../database';

// Adicionando o userAuthenticated ao Request original do Express
interface AuthenticatedRequest extends Request {
    userAuthenticated?: {
      id: number;
      role: string;
    };
}

export const updateTeacher = async (req: AuthenticatedRequest, res: Response) => {
    const userAuthenticated = req.userAuthenticated;

    const { teacher_id } = req.params;
    const { name, email, password, birthday, picture } = req.body;

    if(userAuthenticated?.role !== 'teacher'){
        return res.status(403).json({ success: false, message: 'Route only for teachers' });
    }

    if (!teacher_id) {
        return res.status(400).json({ success: false, message: 'Teacher ID is required' });
    }

    if (teacher_id !== String(userAuthenticated.id)) {
        return res.status(403).json({ success: false, message: 'Forbidden: You can only update your own account' });
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
            [name, email, password, birthday, picture, teacher_id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ success: false, message: 'Teacher not found' });
        }

        const teacher = result.rows[0];

        delete teacher.password;
        return res.status(200).json({ success: true, teacher: teacher });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Error updating teacher' });

    }
};