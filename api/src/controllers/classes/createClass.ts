import { Request, Response } from 'express';
import { Database } from '../../database';

export const createClass = async (req: Request, res: Response) => {
    const userAuthenticated = (req as any).userAuthenticated;

    if (!userAuthenticated || userAuthenticated.role !== 'teacher') {
        return res.status(403).json({ message: 'Somente professores podem criar turmas' });
    }

    const { title, description } = req.body;

    if (!title) {
        return res.status(400).json({ message: 'title é obrigatório' });
    }

    try {
        const db = Database.getInstance();
        const result = await db.query(
            `INSERT INTO classes (title, description, teacher_id)
             VALUES ($1, $2, $3)
             RETURNING *`,
            [title, description,userAuthenticated.id]
        );
        return res.status(201).json(result.rows[0]);

    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Erro ao criar turma' });
    }
};