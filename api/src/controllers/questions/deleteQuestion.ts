import { Request, Response } from "express";
import { Database } from "../../database";

interface AuthenticatedRequest extends Request {
  userAuthenticated?: {
    id: number;
    role: string;
  };
}
const db = Database.getInstance();

export async function deleteQuestion(req: AuthenticatedRequest, res: Response) {
  try {
    const userAuthenticated = req.userAuthenticated;

    if (!userAuthenticated || userAuthenticated.role !== 'teacher') {
        return res.status(403).json({ success: false, message: 'Route only for teachers' });
    }

    const { id } = req.params;

    const deleteQuery = "DELETE FROM questions WHERE id = $1";
    
    // O 'result' do 'node-postgres' para um DELETE contém 'rowCount'
    const result = await db.query(deleteQuery, [id]);

    // Se 'rowCount' for 0, ninguém foi deletado (não encontrou)
    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: "Question not found" });
    }

    return res.status(200).json({ success: true, message: "Question deleted successfully"});

  } catch (error) {
    console.error("Erro ao deletar questão:", error);
    return res.status(500).json({ success: false, message: "Erro ao deletar questão" });
  }
}