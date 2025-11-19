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

    if(userAuthenticated?.role !== 'student'){
      return res.status(403).json({ success: false, message: 'Route only for students' });
    }

    const student_id = userAuthenticated.id;
    const { question_id, answer } = req.body as AnswerInput;

    // 1. Busque a questão no banco
    const qResult = await db.query("SELECT * FROM questions WHERE id = $1", [question_id]);
    if (qResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Question not find" });
    }
    const question = qResult.rows[0];

    // 2. O "CORRETOR"
    let is_correct = false;
    
    switch (question.type) {
      case "QUESTIONS_MULTIPLE_CHOICE":
        const correctOption = question.data.options.find((opt: any) => opt.is_correct);
        is_correct = (correctOption && correctOption.label.trim() === (answer as string).trim());
        break;

      case "QUESTIONS_FILL_IN_THE_BLANK":
        const userAnswers = answer as string[];
        const correctAnswers = question.data.correct_answers as string[];
        
        if (userAnswers.length !== correctAnswers.length) {
          is_correct = false;
        } else {
          is_correct = userAnswers.every((ans, index) => ans === correctAnswers[index]);
        }
        break;

      case "QUESTIONS_MATCHING_PAIRS":
        const correctPairs = question.data.pairs as { label: string, answer: string }[];
        const studentPairs = answer as { prompt: string, answer: string }[];

        if (!Array.isArray(studentPairs) || studentPairs.length !== correctPairs.length) {
          is_correct = false;
          break;
        }

        const correctMap = new Map<string, string>();
        for (const pair of correctPairs) {
          correctMap.set(pair.label, pair.answer);
        }

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
    return res.status(200).json({ success: true, message: "Answer submitted successfully", is_correct: is_correct });

  } catch (error) {
    console.error("Erro ao submeter resposta:", error);
    return res.status(500).json({ success: false, message: "Error on submit answer" });
  }
}