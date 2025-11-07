import { Request, Response } from 'express';
import { Database } from '../../database';

export const enrollStudent = async (req: Request, res: Response) => {
    const user = (req as any).user;
    if (!user || user.role !== 'student') {
        return res.status(403).json({ message: 'Somente estudantes podem matricular-se em turmas' });
    }

    const { class_id } = req.params;
    if (!class_id) {
        return res.status(400).json({ message: 'class_id é obrigatório' });
    }

    try {
        const db = Database.getInstance();

        // Verifica se a turma existe
        const cls = await db.query('SELECT id FROM classes WHERE id = $1', [class_id]);
        if (cls.rowCount === 0) {
            return res.status(404).json({ message: 'Turma não encontrada' });
        }

        // Insere na tabela de junção students_classes (pressupõe existência dessa tabela)
        await db.query(
            `INSERT INTO students_classes (student_id, class_id, created_at)
             VALUES ($1, $2, NOW())`,
            [user.id, class_id]
        );

        return res.status(201).json({ message: 'Matricula realizada com sucesso' });
    } catch (err: any) {
        // trata possível constraint de duplicidade
        if (err && err.code === '23505') { // unique_violation
            return res.status(409).json({ message: 'Estudante já matriculado nesta turma' });
        }
        console.error(err);
        return res.status(500).json({ message: 'Erro ao matricular estudante' });
    }
};