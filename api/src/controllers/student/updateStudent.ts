import * as bcrypt from 'bcrypt';
import { Request, Response } from 'express';
import { Database } from '../../database';

// Adicionando o userAuthenticated ao Request original do Express
interface AuthenticatedRequest extends Request {
    userAuthenticated?: {
      id: number;
      role: string;
    };
}

export const updateStudent = async (req: AuthenticatedRequest, res: Response) => {
    const userAuthenticated = req.userAuthenticated;

    const { student_id } = req.params;
    const { name, email, birthday, picture, currentPassword } = req.body;

    const newPassword = req.body.newPassword;
    let hashedPassword = undefined;

    if(userAuthenticated?.role !== 'student'){
        return res.status(403).json({ success: false, message: 'Route only for students' });
    }

    if (!student_id) {
        return res.status(400).json({ success: false, message: 'Student ID is required' });
    }

    if (student_id !== String(userAuthenticated.id)) {
        return res.status(403).json({ success: false, message: 'Forbidden: You can only update your own account' });
    }
    
    const db = Database.getInstance();

    if(newPassword && newPassword != ""){
        const result = await db.query(
            'SELECT * FROM students WHERE id = $1',
            [student_id]
        );

        if (result.rowCount === 0) {
            return res.status(401).json({ success: false, message: 'Invalid credentials. Student not found.' });
        }

        // Verifica se a senha está correta
        const student = result.rows[0];
        const isPasswordCorrect = await bcrypt.compare(currentPassword, student.password);

        if (!isPasswordCorrect) {
            return res.status(401).json({ success: false, message: 'Invalid credentials. Password Incorrect.' });
        }

        // Defina o 'salt' (o número de rodadas de criptografia)
        const saltRounds = 10;
        // Gere o hash da senha
        hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    }

    try {
        const result = await db.query(
            `UPDATE students SET
                name = COALESCE($1, name),
                email = COALESCE($2, email),
                password = COALESCE($3, password),
                birthday = COALESCE($4, birthday),
                picture = COALESCE($5, picture),
                updated_at = NOW()
            WHERE id = $6
            RETURNING id, name, email, birthday, picture, created_at, updated_at`,
            [name, email, hashedPassword, birthday, picture, student_id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }

        const student = result.rows[0];

        delete student.password;
        return res.status(200).json({ success: true, student: student });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Error updating student' });

    }
};