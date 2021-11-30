require('dotenv').config()

const express = require('express');
const cors = require('cors')
const DB = require('./db/DB');

const user = require('./routes/user');
const chat = require('./routes/chat');
const auth = require('./routes/auth');

const app = express();
const port = 9000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }))


app.use(cors());
app.options('*', cors());
//Разрешить локальный доступ
/*app.use(function (req, res, next) {
   console.log('use')
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, token');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});*/


app.get('/', async (req, res) => {
    //res.send(JSON.stringify(data));
    const {rows} = await DB.client.query("SELECT * FROM Users");
    res.send(rows);
});

DB.ConnectDB().then(res => {
    if(!res) return;
    app.use('/user', user);
    app.use('/chat', chat);
    app.use('/auth', auth);
    app.listen(port, () => {
        console.log(`Example app listening at http://localhost:${port}`)
    });
});
