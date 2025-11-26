import 'dotenv/config';

import express, { Request, Response } from 'express';

import cors from 'cors'; // cors = biblioteca da parte de segurança (controlar a origem basicamente)
import routes from './routes';
import * as path from 'path';


const app = express(); // cria o servidor usando a biblioteca express
const port = process.env.PORT || 3000;

const corsOptions = {
  origin: 
  [
    //'http://localhost:5173', 
    'https://dumble.onrender.com/',
    'https://www.dumble.onrender.com/'
  ], // se deixar o IP do meu pc, só ele acessa o server
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

app.use(cors(corsOptions));

app.use(express.json());

app.use('/students/pictures', express.static(path.join(__dirname, '..', 'students_pictures')));

app.use('/teachers/pictures', express.static(path.join(__dirname, '..', 'teachers_pictures')));

app.use(routes);

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});