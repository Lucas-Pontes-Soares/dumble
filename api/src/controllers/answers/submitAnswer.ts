import { Request, Response } from "express";
import { Database } from "../../database";

// DEFINA A INTERFACE
interface AuthenticatedRequest extends Request {
  userAuthenticated?: {
    id: number;
    role: string;
  };
}

// DEFINA A INTERFACE PARA O BODY
interface AnswerInput {
  question_id: number;
  answer: any;
}

const db = Database.getInstance();

export async function submitAnswer(req: AuthenticatedRequest, res: Response) {
  try {
    // GUARDA DE AUTENTICAÇÃO
    const userAuthenticated = req.userAuthenticated;

    if (!userAuthenticated || userAuthenticated.role !== 'student') {
      return res.status(403).json({ error: "Acesso negado. Rota apenas para alunos." });
    }

    const student_id = userAuthenticated.id;
    const { question_id, answer } = req.body as AnswerInput;

    // 1. Busque a questão no banco
    const qResult = await db.query("SELECT * FROM questions WHERE id = $1", [question_id]);
    if (qResult.rows.length === 0) {
      return res.status(404).json({ error: "Questão não encontrada" });
    }
    const question = qResult.rows[0];

    // 2. O "CORRETOR"
    let is_correct = false;
    
    switch (question.type) {
      case "QUESTIONS_MULTIPLE_CHOICE":
        const correctOption = question.data.options.find((opt: any) => opt.is_correct);
        is_correct = (correctOption && correctOption.text === answer);
        break;

      case "QUESTIONS_FILL_IN_THE_BLANK":
        const userAnswer = (answer as string).toLowerCase();
        const correctAnswers = question.data.correct_answers.map((ans: string) => ans.toLowerCase());
        is_correct = correctAnswers.includes(userAnswer);
        break;

      case "QUESTIONS_MATCHING_PAIRS":
        // Lógica de correção para "Ligar Pares"
        
        const correctPairs = question.data.pairs as { prompt: string, answer: string }[];
        const studentPairs = answer as { prompt: string, answer: string }[];

        // 1. Validação básica
        if (!Array.isArray(studentPairs) || studentPairs.length !== correctPairs.length) {
          is_correct = false;
          break;
        }

        // 2. Criar um "gabarito" (Map)
        const correctMap = new Map<string, string>();
        for (const pair of correctPairs) {
          correctMap.set(pair.prompt, pair.answer);
        }

        // 3. Verificar cada par
        let allPairsMatch = true; 
        for (const studentPair of studentPairs) {
          
          if (typeof studentPair.prompt !== 'string' || typeof studentPair.answer !== 'string') {
              allPairsMatch = false;
              break;
          }
          
          const correctAnswer = correctMap.get(studentPair.prompt);

          if (!correctAnswer || correctAnswer !== studentPair.answer) {
            allPairsMatch = false;
            break; 
          }
        }
        is_correct = allPairsMatch;
        break;
    }

    // 3. Salve a tentativa no banco
    const insertQuery = `
      INSERT INTO student_answers (student_id, question_id, student_answer, is_correct)
      VALUES ($1, $2, $3, $4)
    `;
    await db.query(insertQuery, [student_id, question_id, JSON.stringify(answer), is_correct]);

    // 4. Retorne o feedback imediato
    return res.status(200).json({
      is_correct: is_correct
    });

  } catch (error) {
    console.error("Erro ao submeter resposta:", error);
    return res.status(500).json({ error: "Erro ao submeter resposta" });
  }
}