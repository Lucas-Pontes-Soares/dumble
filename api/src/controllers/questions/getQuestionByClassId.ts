import { Request, Response } from "express";
import { Database } from "../../database";

const db = Database.getInstance();

export async function getQuestionByClassId(req: Request, res: Response) {
  try {
    const { class_id } = req.params;

    const query = "SELECT * FROM questions WHERE class_id = $1 ORDER BY id ASC";
    
    const result = await db.query(query, [class_id]);

    // Diferente do 'getById', aqui nós retornamos o array 'rows'
    // Se nenhuma questão for encontrada, ele simplesmente retorna um array vazio []
    // o que é o comportamento esperado.
    return res.status(200).json({ success: true, message: "Questions fetched successfully", questions: result.rows });

  } catch (error) {
    console.error("Erro ao buscar questões por Class ID:", error);
    return res.status(500).json({ success: false, message: "Error fetching questions" });
  }
}