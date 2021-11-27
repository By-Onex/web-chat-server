const express = require('express');
const DB = require('./db/DB');

const user = require('./routes/user');
const chat = require('./routes/chat');

const app = express();
const port = 9000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }))

//Разрешить локальный доступ
app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});

app.get('/', async (req, res) => {
    //res.send(JSON.stringify(data));
    const {rows} = await DB.client.query("SELECT * FROM Users");
    res.send(rows);
});

DB.ConnectDB().then(res => {
    if(!res) return;
    app.use('/user', user);
    app.use('/chat', chat);
    app.listen(port, () => {
        console.log(`Example app listening at http://localhost:${port}`)
    });
});
