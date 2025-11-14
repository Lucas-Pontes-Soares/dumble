import { Request, Response } from "express";
import { Database } from "../../database";

const db = Database.getInstance();

export async function getQuestionById(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const query = "SELECT * FROM questions WHERE id = $1";
    
    const result = await db.query(query, [id]);

    // Se o array 'rows' estiver vazio, não encontramos a questão
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Questão não encontrada" });
    }

    // Retorna o primeiro (e único) item encontrado
    return res.status(200).json(result.rows[0]);

  } catch (error) {
    console.error("Erro ao buscar questão por ID:", error);
    return res.status(500).json({ error: "Erro ao buscar questão" });
  }
}