import cors from 'cors';
import express from 'express';
import { rotaNaoEncontrada, tratarErros } from './middlewares/erros';
import { registrarRequisicoes } from './middlewares/registroRequisicoes';
import { rotas } from './routes';

export const app = express();

app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(registrarRequisicoes);

app.use('/api', rotas);

app.use(rotaNaoEncontrada);
app.use(tratarErros);
