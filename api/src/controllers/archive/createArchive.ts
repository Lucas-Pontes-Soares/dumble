import * as fs from 'fs/promises';
import { Request, Response } from 'express';
import { Database } from '../../database';
import { convertToMarkdown } from 'filetomarkdown';

// Adicionando o userAuthenticated ao Request original do Express
interface AuthenticatedRequest extends Request {
    userAuthenticated?: {
      id: number;
      role: string;
    };
}

function removeMarkdownImages(markdown: string): string {
    // Regex para encontrar e remover qualquer link de imagem Markdown
    // Padrão: ![...](...)
    // A flag 'g' garante que todas as ocorrências sejam substituídas.
    const imageRegex = /!\[.*?\]\s*\(.*?\)/g;
    
    return markdown.replace(imageRegex, '');
}

export const archiveCreate = async (req: AuthenticatedRequest, res: Response) => {
    const userAuthenticated = req.userAuthenticated;
    const file = req.file; 
    const { class_code } = req.body; 

    if(userAuthenticated?.role !== 'teacher'){
        return res.status(403).json({ success: false, message: 'Route only for teachers' });
    }

    if (!file) {
        return res.status(400).json({ success: false, message: 'File is required' });
    }

    if (!class_code) {
        if (file.path) await fs.unlink(file.path).catch(() => {});
        return res.status(400).json({ success: false, message: 'class_code is required' });
    }

    const filePath = file.path; 

    try {
        const rawMarkdown = await convertToMarkdown(filePath);
        
        const cleanedMarkdown = removeMarkdownImages(rawMarkdown);
        
        const fileName = file.originalname.split('.').shift();
        const fileType = file.originalname.split('.').pop();
        const db = Database.getInstance();
       
        const resultClassId = await db.query('SELECT * FROM classes WHERE code = $1', [class_code]);
        if (resultClassId.rowCount === 0) {
            await fs.unlink(filePath);
            return res.status(404).json({ success: false, message: 'Class not found' });
        }
        const class_id = resultClassId.rows[0].id;

        const resultSelect = await db.query('SELECT id, type, name FROM archives WHERE class_id = $1', [class_id]);

        if ((resultSelect.rowCount ?? 0) >= 5) {
            return res.status(403).json({ success: false, message: 'Max 5 archives allowed' });
        }

        const result = await db.query(
            'INSERT INTO archives (class_id, name, type, content) VALUES ($1, $2, $3, $4) RETURNING *',
            [class_id, fileName, fileType, cleanedMarkdown] 
        );

        const newArchive = result.rows[0];

        await fs.unlink(filePath);

        return res.status(201).json({ success: true, archive: newArchive });

    } catch (error) {
        console.error("Error creating archive:", error);

        if (filePath) {
            await fs.unlink(filePath).catch(err => console.error("Error cleaning up file:", err));
        }
        return res.status(500).json({ success: false, message: 'Error creating archive' });
    }
};