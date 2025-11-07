import { Request, Response } from 'express';
import { Database } from '../../database';

export const getClass = async (req: Request, res: Response) => {
    const { class_id } = req.params;

    try {
        const db = Database.getInstance();

        if (class_id) {
            const result = await db.query(
                `SELECT id, title, description, teacher_id, created_at, updated_at
                 FROM classes WHERE id = $1`,
                [class_id]
            );

            if (result.rowCount === 0) {
                return res.status(404).json({ message: 'Turmas não encontradas.' });
            }
            return res.status(200).json(result.rows[0]);

        } else {
            const result = await db.query(
                `SELECT id, title, description, teacher_id, created_at, updated_at
                 FROM classes ORDER BY created_at DESC`
            );
            return res.status(200).json(result.rows);
        }
    } catch (err) {
        
        console.error(err);
        return res.status(500).json({ message: 'Erro ao buscar turma(s)' });
    }
};