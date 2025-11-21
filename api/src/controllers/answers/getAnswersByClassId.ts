import { Request, Response } from 'express';
import { Database } from '../../database';

const db = Database.getInstance();

export async function getAnswersByClassId(req: Request, res: Response) {
    const { class_id } = req.params;

    if (!class_id) {
        return res.status(400).json({ success: false, error: 'Class ID is required' });
    }

    try {
        // 1. Contar o número total de questões na turma
        const totalQuestionsResult = await db.query("SELECT COUNT(*) AS total_questions FROM questions WHERE class_id = $1", [class_id]);
        const total_questions = parseInt(totalQuestionsResult.rows[0].total_questions, 10);

        // 2. Buscar todos os alunos da turma e contar quantas questões cada um respondeu
        const studentProgressQuery = `
            SELECT
                s.id,
                s.name,
                s.email,
                s.picture,
                sc.created_at,
                COALESCE(ans.answered_count, 0) AS answered_questions,
                ans.first_answered_at
            FROM
                students s
            JOIN
                students_classes sc ON s.id = sc.student_id
            LEFT JOIN
                (
                    SELECT
                        sa.student_id,
                        COUNT(DISTINCT sa.question_id) AS answered_count,
                        MIN(sa.created_at) AS first_answered_at
                    FROM
                        student_answers sa
                    JOIN
                        questions q ON sa.question_id = q.id
                    WHERE
                        q.class_id = $1
                    GROUP BY
                        sa.student_id
                ) AS ans ON s.id = ans.student_id
            WHERE
                sc.class_id = $1;
        `;

        const studentProgressResult = await db.query(studentProgressQuery, [class_id]);
        const student_progress = studentProgressResult.rows.map(row => ({
            ...row,
            answered_questions: parseInt(row.answered_questions, 10),
            total_questions: total_questions,
            first_answered_at: row.first_answered_at,
        }));

        // 3. Calcular a média de respostas da turma
        const totalAnsweredByAllStudents = student_progress.reduce((sum, student) => sum + student.answered_questions, 0);
        const numberOfStudents = student_progress.length;
        const average_answered = numberOfStudents > 0 ? totalAnsweredByAllStudents / (numberOfStudents * total_questions) : 0;

        res.status(200).json({
            success: true,
            total_questions,
            student_progress,
            average_answered: parseFloat(average_answered.toFixed(2))
        });

    } catch (error) {
        console.error('Error fetching answers by class ID:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
}
