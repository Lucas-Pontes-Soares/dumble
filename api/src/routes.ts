import { Router } from 'express';
import testCreateUser from './controllers/testCreateUser'; 

const router = Router();



// Definir cada rota
router.get('/testCreateUser', testCreateUser);

// Exporta o roteador para ser usado em server.ts
export default router;