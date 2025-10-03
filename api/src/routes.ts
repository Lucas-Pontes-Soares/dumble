import { Router } from 'express';
import { verifyJWTToken } from './controllers/jwt-token/jwt-token-verify';

// importa os controladores
// para professores
import { createTeacher } from './controllers/teacher/teacherCreate';
import { deleteTeacher } from './controllers/teacher/teacherDelete';
import { getTeacher } from './controllers/teacher/teacherGet';
import { loginTeacher } from './controllers/teacher/teacherLogin';
import { updateTeacher } from './controllers/teacher/teacherUpdate';

// para estudantes
import { createStudent } from './controllers/student/studentCreate';
import { deleteStudent } from './controllers/student/studentDelete';
import { getStudent } from './controllers/student/studentGet';
import { loginStudent } from './controllers/student/studentLogin';
import { updateStudent } from './controllers/student/studentUpdate';

const router = Router();

// Rota para verificar se a API está funcionando
router.get('/health', (req, res) => {
    res.send('OK');
});

// Rotas para professores
router.post('/teachers', createTeacher);            
router.delete('/teachers/:id', verifyJWTToken, deleteTeacher);      
router.get('/teachers/:id', verifyJWTToken, getTeacher);            
router.post('/teachers/login', loginTeacher);       
router.put('/teachers/:id', verifyJWTToken, updateTeacher);         

// Rotas para estudantes
router.post('/students', createStudent);            
router.delete('/students/:id', verifyJWTToken, deleteStudent);      
router.get('/students/:id', verifyJWTToken, getStudent);            
router.post('/students/login', loginStudent);       
router.put('/students/:id', verifyJWTToken, updateStudent);         

// Exporta o roteador para ser usado em server.ts
export default router;