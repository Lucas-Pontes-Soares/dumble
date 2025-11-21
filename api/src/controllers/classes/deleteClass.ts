import { Request, Response } from 'express';
import { Database } from '../../database';

// Adicionando o userAuthenticated ao Request original do Express
interface AuthenticatedRequest extends Request {
    userAuthenticated?: {
      id: number;
      role: string;
    };
}

export const deleteClass = async (req: AuthenticatedRequest, res: Response) => {
    const userAuthenticated = req.userAuthenticated;

    if (!userAuthenticated || userAuthenticated.role !== 'teacher') {
        return res.status(403).json({ success: false, message: 'Route only for teachers' });
    }

    const { class_id } = req.params;
    if (!class_id) {
        return res.status(400).json({ success: false, message: 'class_id é required' });
    }

    try {
        const db = Database.getInstance();
        const ownerCheck = await db.query('SELECT teacher_id FROM classes WHERE id = $1', [class_id]);

        if (ownerCheck.rowCount === 0) {
            return res.status(404).json({ success: false, message: 'Class not found' });
        }
        if (ownerCheck.rows[0].teacher_id !== userAuthenticated.id) {
            return res.status(403).json({ success: false, message: 'Forbidden: You can only delete your own account' });
        }

        const result = await db.query('DELETE FROM classes WHERE id = $1 RETURNING *', [class_id]);
        return res.status(200).json({ success: true, message: 'Class deleted with success', class: result.rows[0] });
        
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: 'Error on delete class' });
    }
};