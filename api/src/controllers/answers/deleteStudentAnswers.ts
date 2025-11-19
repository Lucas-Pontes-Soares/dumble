import { Request, Response } from "express";
import { Database } from "../../database";

interface AuthenticatedRequest extends Request {
  userAuthenticated?: {
    id: number;
    role: string;
  };
}

const db = Database.getInstance();

export async function deleteStudentAnswers(req: AuthenticatedRequest, res: Response) {
  try {
    const userAuthenticated = req.userAuthenticated;

    if (userAuthenticated?.role !== 'student') {
      return res.status(403).json({ success: false, message: 'Route only for students' });
    }

    const student_id = userAuthenticated.id;
    const { question_id, class_id } = req.params;

    if (question_id) {
      // Deleta uma resposta específica
      const deleteQuery = `
        DELETE FROM student_answers
        WHERE student_id = $1 AND question_id = $2
      `;
      await db.query(deleteQuery, [student_id, question_id]);
      return res.status(200).json({ success: true, message: "Answer deleted successfully" });

    } else if (class_id) {
      // Deleta todas as respostas de uma turma
      const deleteQuery = `
        DELETE FROM student_answers
        WHERE student_id = $1 AND question_id IN (
          SELECT id FROM questions WHERE class_id = $2
        )
      `;
      await db.query(deleteQuery, [student_id, class_id]);
      return res.status(200).json({ success: true, message: "All answers for the class deleted successfully" });

    } else {
      return res.status(400).json({ success: false, message: "Missing question_id or class_id query parameter" });
    }

  } catch (error) {
    console.error("Erro ao deletar respostas:", error);
    return res.status(500).json({ success: false, message: "Error on deleting answers" });
  }
}
