import { Router } from 'express';

import { createTeacher } from './controllers/teacher/teacherCreate';
import { deleteTeacher } from './controllers/teacher/teacherDelete';
import { getTeacher } from './controllers/teacher/teacherGet';
import { loginTeacher } from './controllers/teacher/teacherLogin';
import { updateTeacher } from './controllers/teacher/teacherUpdate';

import { createStudent } from './controllers/student/studentCreate';
import { deleteStudent } from './controllers/student/studentDelete';
import { getStudent } from './controllers/student/studentGet';
import { loginStudent } from './controllers/student/studentLogin';
import { updateStudent } from './controllers/student/studentUpdate';

const router = Router();

// Rotas para professores
router.post('/teachers', createTeacher);            
router.delete('/teachers/:id', deleteTeacher);      
router.get('/teachers/:id', getTeacher);            
router.post('/teachers/login', loginTeacher);       
router.put('/teachers/:id', updateTeacher);         

// Rotas para estudantes
router.post('/students', createStudent);            
router.delete('/students/:id', deleteStudent);      
router.get('/students/:id', getStudent);            
router.post('/students/login', loginStudent);       
router.put('/students/:id', updateStudent);         

// Exporta o roteador para ser usado em server.ts
export default router;