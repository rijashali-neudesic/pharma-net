import express from "express";
import cors from 'cors';
import logger from 'morgan';

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());
app.set('title', 'PharmaNet Distributed Application');
app.use(logger());

app.listen(port, () => console.log('Distributed App listening on port', port));
