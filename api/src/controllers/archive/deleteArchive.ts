import { Request, Response } from 'express';
import { Database } from '../../database';

// Adicionando o userAuthenticated ao Request original do Express
interface AuthenticatedRequest extends Request {
    userAuthenticated?: {
      id: number;
      role: string;
    };
}

export const deleteArchive = async (req: AuthenticatedRequest, res: Response) => {
    const userAuthenticated = req.userAuthenticated;
    const { archive_id } = req.params;

    if(userAuthenticated?.role !== 'teacher'){
        return res.status(403).json({ success: false, message: 'Route only for teachers' });
    }

    if(!archive_id) {
        return res.status(400).json({ success: false, message: 'Archive ID is required' });
    }

    try {
        const db = Database.getInstance();
        const result = await db.query('DELETE FROM archives WHERE id = $1 RETURNING *', [archive_id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ success: false, message: 'Archive not found' });

        }

        const archive = result.rows[0];

        delete archive.password;
        return res.status(200).json({ success: true, message: 'Archive deleted', archive: archive });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Error deleting student' });
    }
};