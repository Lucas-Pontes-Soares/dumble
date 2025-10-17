import { Router } from 'express';
import { verifyJWTToken } from './controllers/jwt-token/verifyJWTToken';
import multer from 'multer';

// importa os controladores
// para professores
import { createTeacher } from './controllers/teacher/createTeacher';
import { deleteTeacher } from './controllers/teacher/deleteTeacher';
import { getTeacher } from './controllers/teacher/getTeacher';
import { getTeacherByClassCode } from './controllers/teacher/getTeacherByClassCode';
import { loginTeacher } from './controllers/teacher/loginTeacher';
import { updateTeacher } from './controllers/teacher/updateTeacher';

// para estudantes
import { createStudent } from './controllers/student/createStudent';
import { deleteStudent } from './controllers/student/deleteStudent';
import { getStudent } from './controllers/student/getStudent';
import { getStudentByClassCode } from './controllers/student/getStudentByClassCode';
import { loginStudent } from './controllers/student/loginStudent';
import { updateStudent } from './controllers/student/updateStudent';

// para chatbot
import { chatbotMessageCreate } from './controllers/chat-bot/createChatbotMessage';
import { getChatBotMessageByStudentId } from './controllers/chat-bot/getChatBotMessageByStudentId';

// para arquivos
import { archiveCreate } from './controllers/archive/createArchive';
import { getArchiveByClassCode } from './controllers/archive/getArchiveByClassCode';
import { deleteArchive } from './controllers/archive/deleteArchive';

// para sugestões
import { createSuggestion } from './controllers/suggestion/createSuggestion';

// Configuração do multer para upload de arquivos
const upload = multer({ storage: multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
}) });

const router = Router();

// Rota para verificar se a API está funcionando
router.get('/health', (req, res) => {
    res.send('OK');
});

// Rotas para professores
router.post('/teachers', createTeacher);
router.delete('/teachers/:teacher_id', verifyJWTToken, deleteTeacher);
router.get('/teachers/:teacher_id', verifyJWTToken, getTeacher);
router.get('/classes/:class_code/teachers', verifyJWTToken, getTeacherByClassCode);
router.post('/teachers/login', loginTeacher);
router.put('/teachers/:teacher_id', verifyJWTToken, updateTeacher);

// Rotas para estudantes
router.post('/students', createStudent);
router.delete('/students/:student_id', verifyJWTToken, deleteStudent);
router.get('/students/:student_id', verifyJWTToken, getStudent);
router.get('/classes/:class_code/students', verifyJWTToken, getStudentByClassCode);
router.post('/students/login', loginStudent);
router.put('/students/:student_id', verifyJWTToken, updateStudent);

// Rotas para o chat-bot
router.post('/chat-bot-messages', verifyJWTToken, chatbotMessageCreate);
router.get('/students/:student_id/classes/:class_code/chat-bot-messages', verifyJWTToken, getChatBotMessageByStudentId);

// Rotas para arquivos
router.post('/archives', upload.single('file'), verifyJWTToken, archiveCreate);
router.get('/classes/:class_code/archives', verifyJWTToken, getArchiveByClassCode);
router.delete('/archives/:archive_id', verifyJWTToken, deleteArchive);

// Rotas para sugestões
router.post('/suggestions', verifyJWTToken, createSuggestion);

// Exporta o roteador para ser usado em server.ts
export default router;