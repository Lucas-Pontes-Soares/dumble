import { Request, Response } from 'express';
import { Database } from '../../database';

// Adicionando o userAuthenticated ao Request original do Express
interface AuthenticatedRequest extends Request {
    userAuthenticated?: {
      id: number;
      role: string;
    };
}

export const getChatBotMessageByStudentId = async (req: AuthenticatedRequest, res: Response) => {
    const userAuthenticated = req.userAuthenticated;

    const { student_id, class_code } = req.params;

    if(userAuthenticated?.role !== 'student'){
        return res.status(403).json({ success: false, message: 'Route only for students' });
    }

    if(!student_id) {
        return res.status(400).json({ success: false, message: 'Student ID is required' });
    }

    if (student_id !== String(userAuthenticated.id)) {
        return res.status(403).json({ success: false, message: 'Forbidden: You can only get your own account' });
    }

    if(!class_code) {
        return res.status(400).json({ success: false, message: 'class_code is required' });
    }
    
    try {
        const db = Database.getInstance();

        const resultStudentClass = await db.query('SELECT * FROM students_classes WHERE student_id = $1', [student_id]);
        if (resultStudentClass.rowCount === 0) {
            return res.status(404).json({ success: false, message: 'Student-Class association not found' });
        }

        const studentClassId = resultStudentClass.rows[0].id;
        const result = await db.query('SELECT * FROM chat_bot_messages WHERE student_class_id = $1', [studentClassId]);

        if (result.rowCount === 0) {
            return res.status(404).json({ success: false, message: 'Messages not found' });
        }

        const messages = result.rows;

        return res.status(200).json({ success: true, messages: messages });
    } catch (error) { 
        console.error(error);
        return res.status(500).json({ success: false, message: 'Error fetching messages(s)' });

    }
};