import { Request, Response } from 'express';
import { Database } from '../../database';

export const updateClass = async (req: Request, res: Response) => {
    const userAuthenticated = (req as any).userAuthenticated;

    if (!userAuthenticated || userAuthenticated.role !== 'teacher') {
        return res.status(403).json({ message: 'Somente professores podem atualizar turmas' });
    }

    const { class_id } = req.params;
    const { title, description } = req.body;

    if (!class_id) {
        return res.status(400).json({ message: 'class_id é obrigatório' });
    }

    try {
        const db = Database.getInstance();
        const ownerCheck = await db.query('SELECT teacher_id FROM classes WHERE id = $1', [class_id]);

        if (ownerCheck.rowCount === 0) {
            return res.status(404).json({ message: 'Turma não encontrada' });
        }
        if (ownerCheck.rows[0].teacher_id !== userAuthenticated.id) {
            return res.status(403).json({ message: 'Você não tem permissão para atualizar esta turma' });
        }

        const result = await db.query(
            `UPDATE classes SET
                title = COALESCE($1, title),
                description = COALESCE($2, description),
                updated_at = NOW()

             WHERE id = $3
             
             RETURNING *`,
            [title, description, class_id]
        );

        return res.status(200).json(result.rows[0]);

    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Erro ao atualizar turma' });
    }
};