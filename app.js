const express = require('express');
const DB = require('./db/DB');

const user = require('./routes/user');
const chat = require('./routes/chat');

const app = express();
const port = 9000;

const data = [{user_id:1,name:'test'}];

app.use(express.json());
app.use(express.urlencoded({ extended: true }))

app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
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
