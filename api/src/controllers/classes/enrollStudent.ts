import { Request, Response } from 'express';
import { Database } from '../../database';

// Adicionando o userAuthenticated ao Request original do Express
interface AuthenticatedRequest extends Request {
    userAuthenticated?: {
      id: number;
      role: string;
    };
}

export const enrollStudent = async (req: AuthenticatedRequest, res: Response) => {
    const userAuthenticated = req.userAuthenticated;
    if (!userAuthenticated || userAuthenticated.role !== 'student') {
        return res.status(403).json({ success: false, message: 'Route only for students' });
    }

    const { class_id } = req.params;
    if (!class_id) {
        return res.status(400).json({ success: false, message: 'class_id is required' });
    }

    try {
        const db = Database.getInstance();

        // Verifica se a turma existe
        const cls = await db.query('SELECT id FROM classes WHERE id = $1', [class_id]);
        if (cls.rowCount === 0) {
            return res.status(404).json({ success: false, message: 'Class not found' });
        }

        // Insere na tabela de junção students_classes (pressupõe existência dessa tabela)
        await db.query(
            `INSERT INTO students_classes (student_id, class_id, created_at)
             VALUES ($1, $2, NOW())`,
            [userAuthenticated.id, class_id]
        );

        return res.status(201).json({ success: true, message: 'Enrollment created with success' });
    } catch (err: any) {
        console.error(err);
        return res.status(500).json({ success: false, message: 'Error on student enrollment' });
    }
};