require('dotenv').config();

// CRIAÇÃO DO SERVIDOR
const express = require('express');
const server = express();
const mongoose = require('mongoose');

// IMPORTAÇÕES
const routes = require('./routes'); // Importar ROTAS.
const path = require('path'); // Importar a função PATH.
const { middlewareGlobal, checkCsrfError, csrfMiddleware } = require('./src/middleware/middleware'); //Importando o middleware como teste.
const helmet = require('helmet'); // Importar middlewware de segurança.
const crsf = require('csurf'); // Importar middleware de segurança para formularios.

// CONECÇÃO COM BANCO DE DADOS
mongoose.connect(process.env.CONNECTIONSTRING, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('Conectado à Base de Dados');
        server.emit('pronto');
    })
    .catch(e => console.log(e));


// COOKIES
const session = require('express-session'); // Gerenciamento de sessão de uruário.
const MongoStore = require('connect-mongo'); // Armazenar as sessões no Banco de Dados.
const flash = require('connect-flash');

const sessionOptions = session({
    secret: 'Minha chave secreta', // Uma chave secreta para proteger as sessões
    // store: new MongoStore({ mongooseConnection: mongoose.connection }),
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7,
        httpOnly: true
    },
    store: MongoStore.create({ mongoUrl: process.env.CONNECTIONSTRING }) // Conexão com o banco de dados MongoDB
});
server.use(sessionOptions);
server.use(flash());


// USABILIDADE
server.use(express.urlencoded({ extended: true })); // Trata o body.
server.use(express.json()); // Permite o parse de JSON para dentro da aplicação.
server.use(express.static(path.resolve(__dirname, 'public'))); // Configurar o middleware para servir arquivos estáticos.
server.set('views', path.resolve(__dirname, 'src', 'views')); // Configurar o diretório das views (onde seus arquivos HTML estão).
server.set('view engine', 'ejs'); // Configurar o mecanismo de renderização (pode usar EJS, Pug, Handlebars, etc.).


// MIDDLEWARES
server.use(crsf()); // Usando middleware token de segurança.
server.use(helmet()); // Usando o middleware de segurança.
server.use(middlewareGlobal); // Usando o middleware criado como teste.
server.use(checkCsrfError); // Usando o middleware criado como teste.
server.use(csrfMiddleware); // Usando o middleware criado como teste.
server.use(routes); // Rotas.



// SERVIDOR
server.on('pronto', () => {
    const port = 3000;
    server.listen(port, () => {
        console.log(`Servidor rodando na URL http://localhost:${port}/index`);
    });
})
