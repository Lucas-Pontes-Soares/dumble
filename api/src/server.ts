import 'dotenv/config';

import express, { Request, Response } from 'express';

import cors from 'cors'; // cors = biblioteca da parte de segurança (controlar a origem basicamente)
import routes from './routes';


const app = express(); // cria o servidor usando a biblioteca express
const port = 3000; 

const corsOptions = {
  origin: ['*'], // se deixar o IP do meu pc, só ele acessa o server
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

app.use(cors(corsOptions));

app.use(express.json());

app.use(routes);

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});