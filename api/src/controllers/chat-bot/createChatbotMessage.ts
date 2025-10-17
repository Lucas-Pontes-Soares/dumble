import { Request, Response } from 'express';
import { GoogleGenAI, HarmCategory, HarmBlockThreshold } from "@google/genai";
import { Database } from '../../database';
import { chatbotPrompt } from '../../prompts/chatbotPrompt';

// Adicionando o userAuthenticated ao Request original do Express
interface AuthenticatedRequest extends Request {
    userAuthenticated?: {
      id: number;
      role: string;
    };
}

const gemini_api_key = process.env.GEMINI_API_KEY;

if(!gemini_api_key) {
    throw new Error('Gemini api key secret environment variable must be defined');
}
const ai = new GoogleGenAI({
    apiKey: gemini_api_key, 
});

const safetySettings = [
    {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE, 
    },
    {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE, 
    },
    {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE, 
    },
    {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE, 
    }
];

export const chatbotMessageCreate = async (req: AuthenticatedRequest, res: Response) => {
    const userAuthenticated = req.userAuthenticated;
    const { student_message, class_id, student_id } = req.body;

    console.log(userAuthenticated);
    if(userAuthenticated?.role !== 'student'){
        return res.status(403).json({ success: false, message: 'Route only for students' });
    }

    if (!student_message) {
        return res.status(400).json({ success: false, message: 'Student message are required' });
    }

    if(!class_id) {
        return res.status(400).json({ success: false, message: 'class_id is required' });
    }

    if(!student_id) {
        return res.status(400).json({ success: false, message: 'student_id is required' });
    }

    if (student_id !== String(userAuthenticated.id)) {
        return res.status(403).json({ success: false, message: 'Forbidden: You can only get your own account' });
    }

    try {
        const db = Database.getInstance();
        const result = await db.query('SELECT content FROM archives WHERE class_id = $1', [class_id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ success: false, message: 'Archives not found' });
        }

        let archivesContent = '\n# Contexto dos Arquivos\n';
        result.rows.forEach((row: any, index: number) => {
            archivesContent += `\n## Arquivo ${index + 1}\n${row.content}`;
        });

        const resultClass = await db.query('SELECT title FROM classes WHERE id = $1', [class_id]);

        if (resultClass.rowCount === 0) {
            return res.status(404).json({ message: 'Class not found' });
        }

        const classTitle = resultClass.rows[0].title;

        let systemInstruction = chatbotPrompt(classTitle);
        systemInstruction += archivesContent;

        console.log("System Instruction:", systemInstruction);
        
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.setHeader('Transfer-Encoding', 'chunked');
        res.status(200);

        res.flushHeaders(); 

        const responseStream = await ai.models.generateContentStream({
            model: "gemini-2.5-flash",
            contents: [
                { role: "user", parts: [{ text: student_message }] }
            ],
            config: {
                systemInstruction: systemInstruction,
                safetySettings: safetySettings, 
            }
        });

        let ai_message = '';

        // Iterar sobre o Stream e enviar os chunks
        for await (const chunk of responseStream) {
            const textChunk = chunk.text;
            if (textChunk) {
                console.log(textChunk)
                res.write(textChunk);
                ai_message += textChunk;
            }
        }

        try {
            const resultStudentClass = await db.query('SELECT * FROM students_classes WHERE student_id = $1', [student_id]);
            if (resultStudentClass.rowCount === 0) {
                console.error("Student-Class association not found. Message not saved.");
                return;
            }

            const studentClassId = resultStudentClass.rows[0].id;
            
            await db.query(
                'INSERT INTO chat_bot_messages (student_class_id, student_message, ai_message) VALUES ($1, $2, $3)',
                [studentClassId, student_message, ai_message]
            );
        } catch (dbError) {
            console.error("Error saving chat message to database:", dbError);
        }

        res.end();

    } catch (error) {
        console.error("Erro durante o streaming da mensagem:", error); 
        if (!res.headersSent) {
            return res.status(500).json({ success: false, message: 'Error sending message via chat-bot stream' });
        } else {
            res.end();
        }
    }
};