import { Request, Response } from 'express';
import { Database } from '../../database';

const db = Database.getInstance();

export async function getAnswersByStudentAndClass(req: Request, res: Response) {
    const { student_id, class_id } = req.params;

    try {
        const query = `
            SELECT sa.question_id, sa.is_correct, sa.student_answer
            FROM student_answers sa
            JOIN questions q ON sa.question_id = q.id
            WHERE sa.student_id = $1 AND q.class_id = $2
        `;
        const result = await db.query(query, [student_id, class_id]);

        res.status(200).json({ success: true, answers: result.rows });
    } catch (error) {
        console.error('Error fetching answers:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
}