import { Request, Response } from "express";
import { Database } from "../../database";
import { CreateQuestionSchema } from "../../types/questionsSchemas"; // 1. Importe o mesmo schema do create 

interface AuthenticatedRequest extends Request {
  userAuthenticated?: {
    id: number;
    role: string;
  };
}
const db = Database.getInstance();

export async function updateQuestion(req: AuthenticatedRequest, res: Response) {
  try {
    const userAuthenticated = req.userAuthenticated;

    if (!userAuthenticated || userAuthenticated.role !== 'teacher') {
        return res.status(403).json({ success: false, message: 'Route only for teachers' });
    }

    // Pegue o ID da URL e os novos dados do body
    const { id } = req.params;
    const { class_id, type, data } = req.body;

    // Busque o estado ATUAL da questão
    const currentResult = await db.query("SELECT * FROM questions WHERE id = $1", [id]);

    if (currentResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Question not found" });
    }
    const currentQuestion = currentResult.rows[0];

    // Crie o objeto "mesclado" com os dados antigos + novos
    // (O '??' usa o valor antigo se o novo for null/undefined)
    const mergedData = {
      class_id: class_id ?? currentQuestion.class_id,
      type: type ?? currentQuestion.type,
      data: data ?? currentQuestion.data,
    };

    // VALIDE o objeto mesclado com o Zod
    // (Exatamente o mesmo schema do create)
    const validationResult = CreateQuestionSchema.safeParse(mergedData);

    if (!validationResult.success) {
      return res.status(400).json({
        error: "Dados da atualização inválidos",
        details: validationResult.error.flatten(),
      });
    }

    // Se passou, os dados validados estão em 'validationResult.data'
    // (Isso é bom caso o Zod transforme algum dado, ex: .coerce)
    const { 
      class_id: validatedClassId, 
      type: validatedType, 
      data: validatedData 
    } = validationResult.data;

    // Execute o UPDATE com os dados 100% validados
    const updateQuery = `
      UPDATE questions 
      SET 
        class_id = $1, 
        type = $2, 
        data = $3, 
        updated_at = $4
      WHERE id = $5
      RETURNING * `; // RETURNING * envia o objeto atualizado de volta

    const params = [
      validatedClassId, 
      validatedType, 
      validatedData, 
      new Date(), // O novo updated_at
      id
    ];
    
    const updateResult = await db.query(updateQuery, params);

    // Responda com sucesso
    return res.status(200).json({ success: true, message: "Question updated successfully", question: updateResult.rows[0] });

  } catch (error) {
    console.error("Erro ao atualizar questão:", error);
    return res.status(500).json({ success: false, message: "Erro ao atualizar questão" });
  }
}