import { Request, Response } from 'express';
import { Database } from '../../database';

// Adicionando o userAuthenticated ao Request original do Express
interface AuthenticatedRequest extends Request {
    userAuthenticated?: {
      id: number;
      role: string;
    };
}

export const getArchiveByClassId = async (req: AuthenticatedRequest, res: Response) => {
    const userAuthenticated = req.userAuthenticated;

    if(userAuthenticated?.role !== 'teacher'){
        return res.status(403).json({ message: 'Route only for teachers' });
    }

    const { class_id } = req.params;

    if(!class_id) {
        return res.status(400).json({ message: 'Class ID is required' });
    }

    try {
        const db = Database.getInstance();
        const result = await db.query('SELECT id, type, name FROM archives WHERE class_id = $1', [class_id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Archives not found' });
        }

        const archives = result.rows;

        return res.status(200).json({ archives: archives });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error fetching archive(s)' });

    }
};