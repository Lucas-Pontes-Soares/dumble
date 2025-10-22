const bcrypt = require("bcrypt");
import { Request, Response } from 'express';
import { Database } from '../../database';
import { GoogleGenAI, HarmCategory, HarmBlockThreshold } from "@google/genai";
import { suggestionPrompt } from '../../prompts/suggestionPrompt';

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

export const createSuggestion = async (req: AuthenticatedRequest, res: Response) => {
    const userAuthenticated = req.userAuthenticated;

    const { class_id, content, question_type } = req.body;

    if(userAuthenticated?.role !== 'teacher'){
        return res.status(403).json({ success: false, message: 'Route only for teachers' });
    }

    if(!class_id) {
        return res.status(400).json({ success: false, message: 'class_id is required' });
    }

    if (!content) {
        return res.status(400).json({ success: false, message: 'Content is required' });
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
            return res.status(404).json({ success: false, message: 'Class not found' });
        }

        const classTitle = resultClass.rows[0].title;

        let systemInstruction = suggestionPrompt(classTitle, question_type);
        systemInstruction += archivesContent;

        console.log("System Instruction:", systemInstruction);

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [
                { role: "user", parts: [{ text: content }] }
            ],
            config: {
                systemInstruction: systemInstruction,
                safetySettings: safetySettings, 
            }
        });

        console.log(response.text);
        
        return res.status(201).json({ success: true, suggestion: response.text });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Error creating suggestion' });
    }
};