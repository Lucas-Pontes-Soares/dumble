import { Request, Response } from 'express';
import { Database } from '../../database';

// Adicionando o userAuthenticated ao Request original do Express
interface AuthenticatedRequest extends Request {
    userAuthenticated?: {
      id: number;
      role: string;
    };
}

export const updateStudent = async (req: AuthenticatedRequest, res: Response) => {
    const userAuthenticated = req.userAuthenticated;

    const { student_id } = req.params;
    const { name, email, password, birthday, picture } = req.body;

    if(userAuthenticated?.role !== 'student'){
        return res.status(403).json({ message: 'Route only for students' });
    }

    if (!student_id) {
        return res.status(400).json({ message: 'Student ID is required' });
    }

    if (student_id !== String(userAuthenticated.id)) {
        return res.status(403).json({ message: 'Forbidden: You can only update your own account' });
    }
    
    try {
        const db = Database.getInstance();
        const result = await db.query(
            `UPDATE students SET
                name = COALESCE($1, name),
                email = COALESCE($2, email),
                password = COALESCE($3, password),
                birthday = COALESCE($4, birthday),
                picture = COALESCE($5, picture)
            WHERE id = $6
            RETURNING id, name, email, birthday, picture`,
            [name, email, password, birthday, picture, student_id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Student not found' });
        }

        const student = result.rows[0];

        delete student.password;
        return res.status(200).json({ student: student });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error updating student' });

    }
};