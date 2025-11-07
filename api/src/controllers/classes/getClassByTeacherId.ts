import { Request, Response } from 'express';
import { Database } from '../../database';

// Adicionando o userAuthenticated ao Request original do Express
interface AuthenticatedRequest extends Request {
    userAuthenticated?: {
      id: number;
      role: string;
    };
}

export const getClassByTeacherId = async (req: AuthenticatedRequest, res: Response) => {
    const userAuthenticated = req.userAuthenticated;

    const { teacher_id } = req.params;

    if(userAuthenticated?.role !== 'teacher'){
        return res.status(403).json({ success: false, message: 'Route only for teachers' });
    }

    if (teacher_id != String(userAuthenticated.id)) {
        console.log(`${teacher_id} ${userAuthenticated.id }`)
        return res.status(403).json({ success: false, message: 'Forbidden: You can only get your own account' });
    }

    if(!teacher_id) {
        return res.status(400).json({ success: false, message: 'teacher_id is required' });
    }

    try {
        const db = Database.getInstance();
        
        const result = await db.query(
            `SELECT id, title, description, teacher_id, created_at, updated_at
                FROM classes 
                WHERE teacher_id = $1`,
            [teacher_id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Classes not found.' });
        }
        
        return res.status(200).json({ success: true, classes: result.rows });
    } catch (err) {    
        console.error(err);
        return res.status(500).json({ success: false, message: 'Error fetching classe(s)' });
    }
};