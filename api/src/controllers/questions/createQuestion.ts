import { Request, Response } from "express";
import { Database } from "../../database";
import { CreateQuestionSchema } from "../../types/questionsSchemas"; // 1. Importe APENAS o seu schema principal do Zod 

interface AuthenticatedRequest extends Request {
  userAuthenticated?: {
    id: number;
    role: string;
  };
}
const db = Database.getInstance();

export async function createQuestion(req: AuthenticatedRequest, res: Response) {
  try {
    const userAuthenticated = req.userAuthenticated;

    if (!userAuthenticated || userAuthenticated.role !== 'teacher') {
        return res.status(403).json({ success: false, message: 'Route only for teachers' });
    }

    // Tente validar o 'req.body' INTEIRO com o schema
    const validationResult = CreateQuestionSchema.safeParse(req.body);

    // Se a validação falhar, retorne os erros detalhados do Zod
    if (!validationResult.success) {
      return res.status(400).json({
        error: "Invalid request data.",
        // 'flatten()' é ótimo para enviar ao front-end
        details: validationResult.error.flatten(), 
      });
    }
    
    // Se a validação passou, pegue os dados 100% seguros
    // O Zod já garante que 'type' e 'data' correspondem
    const { class_id, type, data } = validationResult.data;

    // Query SQL para PostgreSQL (com JSONB)
    const query = `
      INSERT INTO questions (class_id, type, created_at, updated_at, data) 
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id
    `;
    
    // Os parâmetros correspondem aos $1, $2, $3, $4, $5
    // O driver 'node-postgres' converte o 'data' (JS) para JSONB automaticamente
    const params = [class_id, type, new Date(), new Date(), data];

    console.log("SENDING TO DATABASE:", params);
    
    const result = await db.query(query, params);
    
    // Capture o ID retornado pelo 'RETURNING id'
    const newQuestionId = result.rows[0].id;

    return res.status(201).json({ success: true, message: "Question created successfully", question_id: newQuestionId,});
    
  } catch (error) {
    // Captura erros de banco de dados ou outros imprevistos
    console.error("Erro ao criar questão:", error);
    return res.status(500).json({ success: false, message: "Erro ao criar questão" });
  }
}