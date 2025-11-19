import { Request, Response } from 'express';
import { Database } from '../../database';

const db = Database.getInstance();

export async function getAnswersCorrectByClassId(req: Request, res: Response) {
    const { class_id } = req.params;

    if (!class_id) {
        return res.status(400).json({ success: false, error: 'Class ID is required' });
    }

    try {
        const studentCorrectnessQuery = `
            SELECT
                s.id,
                COALESCE(ans.correct_answers_count, 0) AS correct_answers,
                ans.first_answered_at
            FROM
                students s
            JOIN
                students_classes sc ON s.id = sc.student_id
            LEFT JOIN
                (
                    SELECT
                        sa.student_id,
                        COUNT(DISTINCT sa.question_id) AS correct_answers_count,
                        MIN(sa.created_at) AS first_answered_at
                    FROM
                        student_answers sa
                    JOIN
                        questions q ON sa.question_id = q.id
                    WHERE
                        q.class_id = $1
                        AND sa.is_correct = TRUE
                    GROUP BY
                        sa.student_id
                ) AS ans ON s.id = ans.student_id
            WHERE
                sc.class_id = $1;
        `;

        const studentCorrectnessResult = await db.query(studentCorrectnessQuery, [class_id]);
        
        const student_correctness = studentCorrectnessResult.rows.map(row => ({
            id: row.id,
            correct_answers: parseInt(row.correct_answers, 10),
            first_answered_at: row.first_answered_at,
        }));

        const totalCorrectByAllStudents = student_correctness.reduce((sum, student) => sum + student.correct_answers, 0);
        
        const totalAnsweredResult = await db.query(`
            SELECT COUNT(DISTINCT sa.id) as total_answered
            FROM student_answers sa
            JOIN questions q ON sa.question_id = q.id
            WHERE q.class_id = $1
        `, [class_id]);
        const total_answered = parseInt(totalAnsweredResult.rows[0].total_answered, 10);

        const average_correctness = total_answered > 0 ? totalCorrectByAllStudents / total_answered : 0;

        res.status(200).json({
            success: true,
            student_correctness,
            average_correctness: parseFloat(average_correctness.toFixed(2))
        });

    } catch (error) {
        console.error('Error fetching correct answers by class ID:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
}
