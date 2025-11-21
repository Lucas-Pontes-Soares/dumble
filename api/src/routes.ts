import { Router } from 'express';
import { verifyJWTToken } from './controllers/jwt-token/verifyJWTToken';
import multer from 'multer';

// importa os controladores
// para professores
import { createTeacher } from './controllers/teacher/createTeacher';
import { deleteTeacher } from './controllers/teacher/deleteTeacher';
import { getTeacher } from './controllers/teacher/getTeacher';
import { getTeacherByClassId } from './controllers/teacher/getTeacherByClassId';
import { loginTeacher } from './controllers/teacher/loginTeacher';
import { updateTeacher } from './controllers/teacher/updateTeacher';

// para estudantes
import { createStudent } from './controllers/student/createStudent';
import { deleteStudent } from './controllers/student/deleteStudent';
import { getStudent } from './controllers/student/getStudent';
import { getStudentByClassId } from './controllers/student/getStudentByClassId';
import { loginStudent } from './controllers/student/loginStudent';
import { updateStudent } from './controllers/student/updateStudent';
import { uploadStudentPicture } from './controllers/student/uploadStudentPicture';

// adiciona imports para classes
import { createClass } from './controllers/classes/createClass';
import { getClass } from './controllers/classes/getClass';
import { updateClass } from './controllers/classes/updateClass';
import { deleteClass } from './controllers/classes/deleteClass';
import { enrollStudent } from './controllers/classes/enrollStudent';

// para chatbot
import { chatbotMessageCreate } from './controllers/chat-bot/createChatbotMessage';
import { getChatBotMessageByStudentId } from './controllers/chat-bot/getChatBotMessageByStudentId';

// para arquivos
import { archiveCreate } from './controllers/archive/createArchive';
import { getArchiveByClassId } from './controllers/archive/getArchiveByClassId';
import { deleteArchive } from './controllers/archive/deleteArchive';

// para sugestões
import { createSuggestion } from './controllers/suggestion/createSuggestion';
import { uploadTeacherPicture } from './controllers/teacher/uploadTeacherPicture';
import { getClassByTeacherId } from './controllers/classes/getClassByTeacherId';
import { getEnrolledClass } from './controllers/classes/getEnrolledClass';

// imports para questões
import { createQuestion } from './controllers/questions/createQuestion';
import { updateQuestion } from './controllers/questions/updateQuestion';
import { deleteQuestion } from './controllers/questions/deleteQuestion';
import { getQuestionById } from './controllers/questions/getQuestionById';
import { getQuestionByClassId } from './controllers/questions/getQuestionByClassId';

// imports para respostas
import { submitAnswer } from './controllers/answers/submitAnswer';
import { getAnswersByStudentAndClass } from './controllers/answers/getAnswersByStudentAndClass';
import { deleteStudentAnswers } from './controllers/answers/deleteStudentAnswers';
import { getAnswersByClassId } from './controllers/answers/getAnswersByClassId';
import { getAnswersCorrectByClassId } from './controllers/answers/getAnswersCorrectByClassId';

// Configuração do multer para upload de arquivos
const upload = multer({ storage: multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
}) });

// Configuração do multer para upload de fotos ESTUDANTE
const multerUploadStudentPicture = multer({ storage: multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'students_pictures/');
    },
    filename: (req, file, cb) => {
        const student_id = req.params.student_id;
        const fileExtension = file.originalname.split('.').pop();
        cb(null, `${student_id}.${fileExtension}`);
    }
}) });

// Configuração do multer para upload de fotos PROFESSOR
const multerUploadTeacherPicture = multer({ storage: multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'teachers_pictures/');
    },
    filename: (req, file, cb) => {
        const teacher_id = req.params.teacher_id;
        const fileExtension = file.originalname.split('.').pop();
        cb(null, `${teacher_id}.${fileExtension}`);
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
router.get('/classes/:class_id/teachers', verifyJWTToken, getTeacherByClassId);
router.post('/teachers/login', loginTeacher);
router.put('/teachers/:teacher_id', verifyJWTToken, updateTeacher);
router.put('/teachers/:teacher_id/picture', multerUploadTeacherPicture.single('picture'), verifyJWTToken, uploadTeacherPicture);

// Rotas para estudantes
router.post('/students', createStudent);
router.delete('/students/:student_id', verifyJWTToken, deleteStudent);
router.get('/students/:student_id', verifyJWTToken, getStudent);
router.get('/classes/:class_id/students', verifyJWTToken, getStudentByClassId);
router.post('/students/login', loginStudent);
router.put('/students/:student_id', verifyJWTToken, updateStudent);
router.put('/students/:student_id/picture', multerUploadStudentPicture.single('picture'), verifyJWTToken, uploadStudentPicture);

// Rotas para classes
router.post('/classes/:class_id/enroll', verifyJWTToken, enrollStudent);
router.post('/classes', verifyJWTToken, createClass);
router.get('/classes', verifyJWTToken, getClass); 
router.get('/classes/:class_id', verifyJWTToken, getClass); 
router.put('/classes/:class_id', verifyJWTToken, updateClass); 
router.delete('/classes/:class_id', verifyJWTToken, deleteClass); 
router.get('/teachers/:teacher_id/classes', verifyJWTToken, getClassByTeacherId);
router.get('/students/:student_id/classes', verifyJWTToken, getEnrolledClass);

// Rotas para o chat-bot
router.post('/chat-bot-messages', verifyJWTToken, chatbotMessageCreate);
router.get('/students/:student_id/classes/:class_id/chat-bot-messages', verifyJWTToken, getChatBotMessageByStudentId);

// Rotas para arquivos
router.post('/archives', upload.single('file'), verifyJWTToken, archiveCreate);
router.get('/classes/:class_id/archives', verifyJWTToken, getArchiveByClassId);
router.delete('/archives/:archive_id', verifyJWTToken, deleteArchive);

// Rotas para sugestões
router.post('/suggestions', verifyJWTToken, createSuggestion);

// rotas para questões
router.post("/questions", verifyJWTToken, createQuestion);
router.put("/questions/:id", verifyJWTToken, updateQuestion);
router.delete("/questions/:id", verifyJWTToken, deleteQuestion);
router.get("/questions/:id", getQuestionById);
router.get("/questions/class/:class_id", getQuestionByClassId); // Rota para buscar por classe

// rotas respostas
router.post('/answers', verifyJWTToken, submitAnswer);
router.get('/student/:student_id/class/:class_id/answers', verifyJWTToken, getAnswersByStudentAndClass);
router.get('/classes/:class_id/answers/summary', verifyJWTToken, getAnswersByClassId);
router.get('/classes/:class_id/answers/summary/correct', verifyJWTToken, getAnswersCorrectByClassId);
router.delete('/classes/:class_id/question/:question_id/answers', verifyJWTToken, deleteStudentAnswers);
router.delete('/classes/:class_id/answers', verifyJWTToken, deleteStudentAnswers);

// Exporta o roteador para ser usado em server.ts
export default router;